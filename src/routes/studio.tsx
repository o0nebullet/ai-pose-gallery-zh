import { ReferenceComparisonDialog } from '@/components/common/ReferenceComparisonDialog'
import { ImageViewer } from '@/components/common/ImageViewer'
import { useQueryClient } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import {
  ChevronDownIcon,
  CircleAlertIcon,
  CircleCheckIcon,
  ChevronUpIcon,
  CodeXmlIcon,
  CopyIcon,
  DicesIcon,
  DownloadIcon,
  FileUpIcon,
  ImagePlusIcon,
  KeyRoundIcon,
  LayoutGridIcon,
  LinkIcon,
  LoaderCircleIcon,
  PersonStandingIcon,
  ScanSearchIcon,
  RotateCcwIcon,
  ShirtIcon,
  SlidersHorizontalIcon,
  SparklesIcon,
  Trash2Icon,
  UserRoundIcon,
  XIcon,
} from 'lucide-react'
import { type ChangeEvent, type DragEvent, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from '@/lib/notifications'
import { costumesQuery, portraitsQuery, posesQuery } from '@/api/gallery'
import { Field, Section } from '@/components/common/FormSection'
import { ComfyConnectionStatus } from '@/components/studio/ComfyConnectionStatus'
import { WorkflowParameters } from '@/components/studio/WorkflowParameters'
import { applyWorkflowOverrides, validateReferenceCombinations, workflowIdentity } from '@/lib/comfyWorkflowParameters'
import { PageHeader } from '@/components/common/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  autoDetectComfyMappings,
  buildRecipePrompt,
  type ComfyCheckResult,
  type ComfyPresetId,
  checkComfyWorkflow,
  COMFYUI_WORKFLOW_TEMPLATES,
  detectComfyUi,
  fileToDataUrl,
  fetchComfyObjectInfo,
  parseComfyWorkflowNodes,
  PROVIDER_META,
  stitchRecipeCanvas,
  STYLE_PRESETS,
} from '@/services/aiGenerator'
import { poseImagePath, poseThumbPath, referenceImageUrl, uploadedReferences } from '@/lib/recipeImages'
import { useStudio } from '@/store/studioStore'
import type { RandomScope, ReferenceSlot } from '@/lib/randomRecipe'
import { selectCostumeView } from '@/lib/costumeSources'
import type {
  ComfyUiParams,
  DoubaoParams,
  GeminiParams,
  GenerationHistoryItem,
  GptParams,
  ImagePassMode,
  ImageProviderId,
  QwenParams,
} from '@/types/gallery'

export const Route = createFileRoute('/studio')({
  staticData: { title: 'Bàn tổng hợp AI' },
  component: StudioPage,
})

const PROVIDER_LIST: ImageProviderId[] = ['gemini', 'gpt', 'qwen', 'doubao', 'comfyui']

function StudioPage() {
  const {
    hydrated, activeTask, resumeGeneration, stopTracking,
    recipe,
    apiConfig,
    history,
    customPrompt,
    setCustomPrompt,
    previewUrl,
    isGenerating,
    generatingModel,
    generationProgress,
    generationError,
    startGeneration,
    setPortrait,
    setCostume,
    setPose,
    toggleRecipePoseDepth,
    addExtraImage,
    removeExtraImage,
    updateExtraImageName,
    updateApiConfig,
    updateProviderConfig,
    updateGptParams,
    updateGeminiParams,
    updateQwenParams,
    updateDoubaoParams,
    updateComfyUiParams,
    randomizeRecipe,
    randomizeSlot,
    removeHistoryItem,
    clearHistory,
  } = useStudio()
  const [comparisonResult, setComparisonResult] = useState<GenerationHistoryItem | null>(null)
  const previewResult = history.find((item) => item.imageUrl === previewUrl)
  const qc = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const comfyFileInputRef = useRef<HTMLInputElement | null>(null)
  const slotInputRef = useRef<HTMLInputElement | null>(null)
  const uploadSlotRef = useRef<'portrait' | 'costume' | 'pose'>('portrait')
  const [uploadingSlot, setUploadingSlot] = useState<string | null>(null)
  const [randomizingSlot, setRandomizingSlot] = useState<ReferenceSlot | null>(null)
  const [randomScopes, setRandomScopes] = useState<Record<ReferenceSlot, RandomScope>>({ portrait: 'similar', costume: 'similar', pose: 'similar' })
  const costumeViews = recipe.costume?.views?.filter((view) => view.原图 && view.缩略图) || []
  const [showReferenceErrors, setShowReferenceErrors] = useState(false)
  const referenceErrorsRef = useRef<HTMLDivElement | null>(null)

  const activeProvider = apiConfig.activeProvider
  const providerMeta = PROVIDER_META[activeProvider]
  const providerCfg = apiConfig.providers[activeProvider]

  const activeWorkflowImages = activeProvider === 'comfyui' && recipe.workflowImagesIdentity === workflowIdentity(apiConfig.comfyuiParams.workflowJson) ? Object.values(recipe.workflowImages || {}) : []
  const defaultPrompt = buildRecipePrompt(recipe, apiConfig.stylePreset, activeWorkflowImages)
  const prompt = customPrompt ?? defaultPrompt
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [extraUrlInput, setExtraUrlInput] = useState('')
  const [showUrlInput, setShowUrlInput] = useState(false)
  const [stitchModalUrl, setStitchModalUrl] = useState<string | null>(null)
  const [zoomImageUrl, setZoomImageUrl] = useState<string | null>(null)
  const [showComfyJsonModal, setShowComfyJsonModal] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [comfyCheck, setComfyCheck] = useState<(ComfyCheckResult & { info?: string }) | null>(null)
  const [checkingComfy, setCheckingComfy] = useState(false)

  const parsedComfyNodes = useMemo(
    () => parseComfyWorkflowNodes(apiConfig.comfyuiParams.workflowJson),
    [apiConfig.comfyuiParams.workflowJson]
  )

  const handleSelectComfyPreset = (preset: ComfyUiParams['workflowPreset']) => {
    setComfyCheck(null)
    if (preset === 'custom') {
      updateComfyUiParams({ workflowPreset: 'custom' })
      return
    }
    const tpl = COMFYUI_WORKFLOW_TEMPLATES[preset]
    updateComfyUiParams({
      workflowPreset: preset,
      workflowJson: JSON.stringify(tpl.workflow, null, 2),
      ...tpl.defaults,
    })
    toast.success(`Đã chuyển sang: ${tpl.label}`)
  }

  // Tự động nhận diện địa chỉ ComfyUI + kiểm tra node/model mà workflow cần có trên máy cục bộ không
  const handleCheckComfy = async () => {
    setCheckingComfy(true)
    setComfyCheck(null)
    try {
      const cfg = apiConfig.providers.comfyui
      const found = await detectComfyUi(cfg.baseUrl, cfg.apiKey)
      if (!found) {
        setComfyCheck({
          ok: false,
          errors: [
            `Không tìm thấy dịch vụ ComfyUI khả dụng (đã thử: ${cfg.baseUrl || 'địa chỉ mặc định'}, 127.0.0.1:8000, 127.0.0.1:8188). Hãy xác nhận ComfyUI đã khởi động và kiểm tra cài đặt CORS.`,
          ],
          warnings: [],
          fixes: [],
        })
        return
      }
      if (found.baseUrl !== cfg.baseUrl.trim().replace(/\/+$/, '')) {
        updateProviderConfig('comfyui', { baseUrl: found.baseUrl })
        toast.success(`Đã tự động nhận diện địa chỉ ComfyUI: ${found.baseUrl}`)
      }
      const cp = apiConfig.comfyuiParams
      const result = await checkComfyWorkflow(found.baseUrl, cfg.apiKey, cp.workflowJson, [
        cp.portraitNodeId,
        cp.costumeNodeId,
        cp.poseNodeId,
        cp.stitchedNodeId,
      ])
      // Tự sửa chỉ dùng cho bản sao gửi đi, giữ nguyên API gốc đã nhập.
      setComfyCheck({ ...result, info: `${found.info} (${found.baseUrl})` })
    } catch (e) {
      setComfyCheck({ ok: false, errors: [e instanceof Error ? e.message : 'Kiểm tra thất bại'], warnings: [], fixes: [] })
    } finally {
      setCheckingComfy(false)
    }
  }

  const handleComfyFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      const text = await file.text()
      const info = parseComfyWorkflowNodes(text)
      if (!info.valid) {
        toast.error(info.error || 'Workflow JSON không hợp lệ')
        return
      }
      const detected = autoDetectComfyMappings(text)
      setComfyCheck(null)
      updateComfyUiParams({
        workflowPreset: 'custom',
        workflowJson: text,
        ...detected,
      })
      setShowAdvanced(true)
      toast.success(
        `Đã nhập workflow: nhận diện được ${info.imageNodes.length} node ảnh, ${info.promptNodes.length} node prompt`
      )
    } catch {
      toast.error('Đọc file JSON thất bại')
    }
  }

  const handleExportComfyJson = async (original = false) => {
    try {
      const cp = apiConfig.comfyuiParams
      const schemas = !original && cp.parameterOverrides?.workflowId === workflowIdentity(cp.workflowJson) ? await fetchComfyObjectInfo(providerCfg.baseUrl, providerCfg.apiKey, cp.workflowJson) : undefined
      const wf = JSON.parse(original ? cp.workflowJson : applyWorkflowOverrides(cp.workflowJson, cp.parameterOverrides, schemas))
      if (!original && cp.promptNodeId && cp.promptNodeId !== 'none' && wf[cp.promptNodeId]?.inputs) {
        const inputs = wf[cp.promptNodeId].inputs
        for (const field of ['prompt', 'text', 'string', 'positive']) {
          if (typeof inputs[field] === 'string') {
            inputs[field] = prompt
            break
          }
        }
      }
      const blob = new Blob([JSON.stringify(wf, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `comfyui-workflow-${Date.now()}.api.json`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Đã xuất workflow JSON API ComfyUI')
    } catch {
      toast.error('Định dạng workflow JSON hiện tại sai, không thể xuất')
    }
  }

  const handleSlotUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    const slot = uploadSlotRef.current
    e.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Hãy chọn file ảnh')
      return
    }
    setUploadingSlot(slot)
    try {
      const url = await fileToDataUrl(file)
      const image = new Image()
      image.src = url
      await image.decode()
      const name = file.name.replace(/\.[^.]+$/, '') || 'Ảnh tải lên'
      const items = uploadedReferences(name, url, image.width, image.height, file.size)
      if (slot === 'portrait') setPortrait(items.portrait)
      if (slot === 'costume') setCostume(items.costume)
      if (slot === 'pose') setPose(items.pose)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Đọc ảnh thất bại')
    } finally {
      setUploadingSlot(null)
    }
  }

  const missingReferences = activeProvider === 'comfyui' ? [
    { label: '人像', node: apiConfig.comfyuiParams.portraitNodeId, image: recipe.portrait },
    { label: '服装', node: apiConfig.comfyuiParams.costumeNodeId, image: recipe.costume },
    { label: '姿势', node: apiConfig.comfyuiParams.poseNodeId, image: recipe.pose },
  ].filter((slot) => slot.node && slot.node !== 'none' && parsedComfyNodes.imageNodes.some((node) => node.id === slot.node && node.emptyValue === undefined) && !slot.image).map((slot) => slot.label) : []

  const extraImages = recipe.extraImages || []
  const hasStitchRefs = Boolean(recipe.portrait || recipe.costume || recipe.pose || extraImages.length > 0)
  const hasAnyRef = hasStitchRefs || activeWorkflowImages.length > 0

  const processFiles = async (files: File[]) => {
    const imgFiles = files.filter((f) => f.type.startsWith('image/'))
    if (!imgFiles.length) return
    try {
      for (const file of imgFiles) {
        const dataUrl = await fileToDataUrl(file)
        const baseName = file.name.replace(/\.[^.]+$/, '').slice(0, 16)
        addExtraImage({ name: baseName || 'Ảnh đính kèm', url: dataUrl })
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Đọc ảnh thất bại')
    }
  }

  // Hỗ trợ dán trực tiếp ảnh từ clipboard bằng Cmd+V / Ctrl+V trên bàn tổng hợp làm ảnh tham chiếu đính kèm
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement | null
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return
      const items = Array.from(e.clipboardData?.items || [])
      const files = items
        .filter((it) => it.type.startsWith('image/'))
        .map((it) => it.getAsFile())
        .filter(Boolean) as File[]
      if (files.length > 0) {
        e.preventDefault()
        void processFiles(files)
      }
    }
    window.addEventListener('paste', onPaste)
    return () => window.removeEventListener('paste', onPaste)
  })

  const handleRandom = async () => {
    const [posesRes, costumes, portraits] = await Promise.all([
      qc.ensureQueryData(posesQuery),
      qc.ensureQueryData(costumesQuery),
      qc.ensureQueryData(portraitsQuery),
    ])
    randomizeRecipe({
      poses: posesRes.items,
      costumes,
      portraits,
    })
  }

  const handleRandomSlot = async (slot: ReferenceSlot) => {
    const expectedId = recipe[slot]?.id ?? null
    setRandomizingSlot(slot)
    try {
      const pools = slot === 'portrait' ? { portraits: await qc.ensureQueryData(portraitsQuery) }
        : slot === 'costume' ? { costumes: await qc.ensureQueryData(costumesQuery) }
        : { poses: (await qc.ensureQueryData(posesQuery)).items }
      randomizeSlot(slot, randomScopes[slot], pools, expectedId)
    } catch {
      toast.error('Tải thư viện tư liệu thất bại, hãy thử lại sau')
    } finally {
      setRandomizingSlot(null)
    }
  }

  const randomControls = (slot: ReferenceSlot, label: string) => <div className="flex basis-full flex-wrap items-center gap-2 border-t pt-2">
    <Select value={randomScopes[slot]} onValueChange={(value) => setRandomScopes((current) => ({ ...current, [slot]: value as RandomScope }))}>
      <SelectTrigger aria-label={`${label} phạm vi đổi mẫu`} className="min-h-11 w-24"><SelectValue /></SelectTrigger>
      <SelectContent><SelectItem value="similar">Cùng loại</SelectItem><SelectItem value="all">Tất cả</SelectItem></SelectContent>
    </Select>
    <Button type="button" variant="outline" className="min-h-11" disabled={uploadingSlot !== null || randomizingSlot !== null} onClick={() => void handleRandomSlot(slot)} aria-label={`${label} đổi một cái khác`}>
      {randomizingSlot === slot ? <LoaderCircleIcon className="size-4 animate-spin motion-reduce:animate-none" /> : <DicesIcon className="size-4" />}Đổi một cái
    </Button>
  </div>

  const handleUploadFiles = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    await processFiles(files)
    e.target.value = ''
  }

  const handleDropFiles = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files || [])
    await processFiles(files)
  }

  const handleAddUrl = () => {
    const trimmed = extraUrlInput.trim()
    if (!trimmed) return
    if (!/^https?:\/\//i.test(trimmed) && !trimmed.startsWith('data:image/')) {
      toast.error('Hãy nhập liên kết ảnh http(s):// hợp lệ')
      return
    }
    addExtraImage({ name: 'Ảnh tham chiếu ngoài', url: trimmed })
    setExtraUrlInput('')
    setShowUrlInput(false)
  }

  const handleOpenStitchModal = async () => {
    try {
      const url = await stitchRecipeCanvas(recipe)
      setStitchModalUrl(url)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Ghép ảnh thất bại')
    }
  }

  const handleGenerate = () => {
    if (activeProvider === 'comfyui') {
      const cp = apiConfig.comfyuiParams
      const workflowImages = recipe.workflowImagesIdentity === workflowIdentity(cp.workflowJson) ? recipe.workflowImages || {} : {}
      const selected = [recipe.portrait ? cp.portraitNodeId : '', recipe.costume ? cp.costumeNodeId : '', recipe.pose ? cp.poseNodeId : '', ...Object.keys(workflowImages)].filter((id) => id && id !== 'none')
      const combinationError = validateReferenceCombinations(cp.workflowJson, selected)
      if (combinationError) { toast.error(combinationError); setShowAdvanced(true); return }
    }
    if (missingReferences.length) {
      setShowReferenceErrors(true)
      requestAnimationFrame(() => referenceErrorsRef.current?.focus())
      return
    }
    void startGeneration(prompt)
  }

  return (
    <>
      <PageHeader
        title="Bàn tổng hợp nhân vật AI"
        actions={
          activeProvider === 'comfyui' ? <ComfyConnectionStatus compact /> : <Button variant="outline" size="sm" asChild>
            <Link to="/settings">
              <KeyRoundIcon className="size-4" />
              {providerCfg.apiKey.trim() ? `${providerMeta.shortName} đã cấu hình` : 'Cấu hình API Key'}
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-6">
        {/* Cột trái: ảnh tham chiếu, tham số model và prompt */}
        <div
          className="flex min-w-0 flex-col gap-4 lg:col-span-7"
          onDragOver={(e) => {
            e.preventDefault()
            setIsDragging(true)
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDropFiles}
        >
          {/* 1. Kết hợp ảnh tham chiếu */}
          <Section
            title="1. Kết hợp ảnh tham chiếu"
            className="@lg/section:grid-cols-1"
            actions={
              <div className="flex flex-wrap items-center gap-1.5">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleUploadFiles}
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-2.5 text-xs"
                  onClick={handleRandom}
                >
                  <DicesIcon className="size-3.5" />
                  Ngẫu nhiên
                </Button>
                {hasAnyRef && hasStitchRefs && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2.5 text-xs"
                    onClick={handleOpenStitchModal}
                  >
                    <LayoutGridIcon className="size-3.5" />
                    Ảnh ghép tham chiếu
                  </Button>
                )}
              </div>
            }
          >

            <input ref={slotInputRef} type="file" accept="image/*" className="hidden" onChange={handleSlotUpload} />
            {showReferenceErrors && missingReferences.length > 0 && (
              <div id="reference-errors" ref={referenceErrorsRef} role="alert" tabIndex={-1} className="rounded-lg border border-destructive/50 bg-destructive/5 p-3 text-sm text-destructive focus-visible:outline-2">
                Hãy chọn hoặc tải lên trước: {missingReferences.join('、')}. Các ô này đã liên kết với node workflow.
              </div>
            )}
            {/* 3 ô thư viện chính: một cột thoáng trên điện thoại, ba cột song song trên máy tính bảng/máy tính */}
            <div className="grid min-w-0 grid-cols-1 gap-2 @min-[42rem]/section:grid-cols-3">
              {/* Ô chân dung */}
              <div className={`relative flex min-w-0 flex-wrap items-start gap-2.5 rounded-xl bg-background p-2.5 ${showReferenceErrors && missingReferences.includes('人像') ? 'ring-1 ring-destructive' : ''}`}>
                {recipe.portrait ? (
                  <>
                    <button type="button" aria-label="Phóng to ảnh tham chiếu chân dung" className="shrink-0 cursor-zoom-in overflow-hidden rounded-lg transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-ring" onClick={() => {
                      const item = recipe.portrait
                      if (item) setZoomImageUrl(referenceImageUrl(item.原图 || item.缩略图))
                    }}>
                      <img
                        src={referenceImageUrl(recipe.portrait.缩略图)}
                        alt={recipe.portrait.标题}
                        className="h-12 w-10 shrink-0 rounded-lg object-cover"
                      />
                    </button>
                    <div className="flex min-h-12 min-w-0 flex-1 flex-col justify-between gap-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="shrink-0 text-[11px] text-muted-foreground">Chân dung</span>
                        <button
                          type="button"
                          aria-label="Xóa ảnh tham chiếu chân dung"
                          onClick={() => setPortrait(null)}
                          className="-mr-0.5 -mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
                        >
                          <XIcon className="size-3.5" />
                        </button>
                      </div>
                      <div className="line-clamp-2 text-xs font-medium leading-snug" title={recipe.portrait.发型名称}>
                        {recipe.portrait.发型名称}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <Link
                      to="/portraits"
                      className="flex min-h-12 min-w-0 flex-1 items-center gap-2 rounded-lg text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
                    >
                      <div className="flex h-10 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                        <UserRoundIcon className="size-4" />
                      </div>
                      <span className="truncate text-xs">+ Chọn chân dung</span>
                    </Link>
                    <Button type="button" variant="ghost" size="sm" aria-label="Tải lên ảnh tham chiếu chân dung" aria-describedby={showReferenceErrors && missingReferences.includes('人像') ? 'reference-errors' : undefined} aria-busy={uploadingSlot === 'portrait'} disabled={uploadingSlot !== null || randomizingSlot !== null} className="h-12 shrink-0 border-l px-2 text-xs" onClick={() => { uploadSlotRef.current = 'portrait'; slotInputRef.current?.click() }}>
                      {uploadingSlot === 'portrait' ? <LoaderCircleIcon className="size-3.5 animate-spin motion-reduce:animate-none" /> : <ImagePlusIcon className="size-3.5" />}
                      {uploadingSlot === 'portrait' ? 'Đang xử lý' : 'Tải lên'}
                    </Button>
                  </>
                )}
                {randomControls('portrait', 'Chân dung')}
              </div>

              {/* Ô trang phục */}
              <div className={`relative flex min-w-0 flex-wrap items-start gap-2.5 rounded-xl bg-background p-2.5 ${showReferenceErrors && missingReferences.includes('服装') ? 'ring-1 ring-destructive' : ''}`}>
                {recipe.costume ? (
                  <>
                    <button type="button" aria-label="Phóng to ảnh tham chiếu trang phục" className="shrink-0 cursor-zoom-in overflow-hidden rounded-lg transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-ring" onClick={() => {
                      const item = recipe.costume
                      if (item) setZoomImageUrl(referenceImageUrl(item.预览图 || item.原图 || item.缩略图))
                    }}>
                      <img
                        src={referenceImageUrl(recipe.costume.缩略图)}
                        alt={recipe.costume.服装名称}
                        className="h-12 w-10 shrink-0 rounded-lg object-cover"
                      />
                    </button>
                    <div className="flex min-h-12 min-w-0 flex-1 flex-col justify-between gap-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="shrink-0 text-[11px] text-muted-foreground">Trang phục</span>
                        <button
                          type="button"
                          aria-label="Xóa ảnh tham chiếu trang phục"
                          onClick={() => setCostume(null)}
                          className="-mr-0.5 -mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
                        >
                          <XIcon className="size-3.5" />
                        </button>
                      </div>
                      <div className="line-clamp-2 text-xs font-medium leading-snug" title={recipe.costume.服装名称}>
                        {recipe.costume.服装名称}
                      </div>
                      {costumeViews.length > 0 && <Select
                        value={costumeViews.find((view) => view.id === recipe.costume?.selectedView)?.id || costumeViews.find((view) => view.id === 'front')?.id || costumeViews[0].id}
                        disabled={uploadingSlot !== null || randomizingSlot !== null}
                        onValueChange={(value) => {
                          if (recipe.costume && uploadingSlot === null && randomizingSlot === null) setCostume(selectCostumeView(recipe.costume, value))
                        }}
                      >
                        <SelectTrigger aria-label="Góc nhìn trang phục đã chọn" className="h-8 w-full text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>{costumeViews.map((view) => <SelectItem key={view.id} value={view.id}>{view.label}</SelectItem>)}</SelectContent>
                      </Select>}
                    </div>
                  </>
                ) : (
                  <>
                    <Link
                      to="/costumes"
                      className="flex min-h-12 min-w-0 flex-1 items-center gap-2 rounded-lg text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
                    >
                      <div className="flex h-10 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                        <ShirtIcon className="size-4" />
                      </div>
                      <span className="truncate text-xs">+ Chọn trang phục</span>
                    </Link>
                    <Button type="button" variant="ghost" size="sm" aria-label="Tải lên ảnh tham chiếu trang phục" aria-describedby={showReferenceErrors && missingReferences.includes('服装') ? 'reference-errors' : undefined} aria-busy={uploadingSlot === 'costume'} disabled={uploadingSlot !== null || randomizingSlot !== null} className="h-12 shrink-0 border-l px-2 text-xs" onClick={() => { uploadSlotRef.current = 'costume'; slotInputRef.current?.click() }}>
                      {uploadingSlot === 'costume' ? <LoaderCircleIcon className="size-3.5 animate-spin motion-reduce:animate-none" /> : <ImagePlusIcon className="size-3.5" />}
                      {uploadingSlot === 'costume' ? 'Đang xử lý' : 'Tải lên'}
                    </Button>
                  </>
                )}
                {randomControls('costume', 'Trang phục')}
              </div>

              {/* Ô tư thế */}
              <div className={`relative flex min-w-0 flex-wrap items-start gap-2.5 rounded-xl bg-background p-2.5 ${showReferenceErrors && missingReferences.includes('姿势') ? 'ring-1 ring-destructive' : ''}`}>
                {recipe.pose ? (
                  <>
                    <button type="button" aria-label="Phóng to ảnh tham chiếu tư thế" className="shrink-0 cursor-zoom-in overflow-hidden rounded-lg transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-ring" onClick={() => {
                      const item = recipe.pose
                      if (item) setZoomImageUrl(referenceImageUrl(poseImagePath(item)))
                    }}>
                      <img
                        src={referenceImageUrl(poseThumbPath(recipe.pose))}
                        alt={recipe.pose.姿势名称}
                        className="h-12 w-10 shrink-0 rounded-lg object-cover"
                      />
                    </button>
                    <div className="flex min-h-12 min-w-0 flex-1 flex-col justify-between gap-1">
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                          <span className="shrink-0 text-[11px] text-muted-foreground">Tư thế</span>
                          {recipe.pose.source !== 'upload' && (
                            <div
                              role="group"
                              aria-label="Chuyển mẫu trắng hoặc ảnh depth"
                              className="inline-flex shrink-0 items-center rounded-md border border-border/70 bg-muted/70 p-0.5 text-[10px] leading-none"
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  if (recipe.pose?.useDepth) toggleRecipePoseDepth()
                                }}
                                className={`rounded px-1.5 py-0.5 font-medium transition ${
                                  !recipe.pose.useDepth
                                    ? 'bg-background text-foreground shadow-xs'
                                    : 'text-muted-foreground hover:text-foreground'
                                }`}
                              >
                                Mẫu trắng
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (!recipe.pose?.useDepth) toggleRecipePoseDepth()
                                }}
                                className={`rounded px-1.5 py-0.5 font-medium transition ${
                                  recipe.pose.useDepth
                                    ? 'bg-primary text-primary-foreground shadow-xs'
                                    : 'text-muted-foreground hover:text-foreground'
                                }`}
                              >
                                Depth
                              </button>
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          aria-label="Xóa ảnh tham chiếu tư thế"
                          onClick={() => setPose(null)}
                          className="-mr-0.5 -mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
                        >
                          <XIcon className="size-3.5" />
                        </button>
                      </div>
                      <div
                        className="line-clamp-2 text-xs font-medium leading-snug"
                        title={recipe.pose.角度 ? `${recipe.pose.姿势名称} · ${recipe.pose.角度}` : recipe.pose.姿势名称}
                      >
                        {recipe.pose.角度 ? `${recipe.pose.姿势名称} · ${recipe.pose.角度}` : recipe.pose.姿势名称}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <Link
                      to="/poses"
                      className="flex min-h-12 min-w-0 flex-1 items-center gap-2 rounded-lg text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
                    >
                      <div className="flex h-10 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                        <PersonStandingIcon className="size-4" />
                      </div>
                      <span className="truncate text-xs">+ Chọn tư thế</span>
                    </Link>
                    <Button type="button" variant="ghost" size="sm" aria-label="Tải lên ảnh tham chiếu tư thế" aria-describedby={showReferenceErrors && missingReferences.includes('姿势') ? 'reference-errors' : undefined} aria-busy={uploadingSlot === 'pose'} disabled={uploadingSlot !== null || randomizingSlot !== null} className="h-12 shrink-0 border-l px-2 text-xs" onClick={() => { uploadSlotRef.current = 'pose'; slotInputRef.current?.click() }}>
                      {uploadingSlot === 'pose' ? <LoaderCircleIcon className="size-3.5 animate-spin motion-reduce:animate-none" /> : <ImagePlusIcon className="size-3.5" />}
                      {uploadingSlot === 'pose' ? 'Đang xử lý' : 'Tải lên'}
                    </Button>
                  </>
                )}
                {randomControls('pose', 'Tư thế')}
              </div>
            </div>

            {/* Danh sách ảnh tham chiếu đính kèm + khung tải lên kéo-thả/dán trực quan */}
            <div className="space-y-2 pt-1">
              {extraImages.length > 0 && (
                <div className="grid min-w-0 grid-cols-1 gap-2 @min-[42rem]/section:grid-cols-3">
                  {extraImages.map((img, idx) => (
                    <div
                      key={img.id}
                      className="flex items-center gap-2 rounded-xl border border-border/60 bg-background p-1.5"
                    >
                      <img
                        src={img.url}
                        alt={img.name}
                        className="h-11 w-9 shrink-0 rounded-lg object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-[10px] text-muted-foreground">Ảnh đính kèm #{idx + 1}</div>
                        <input
                          type="text"
                          value={img.name}
                          onChange={(e) => updateExtraImageName(img.id, e.target.value)}
                          placeholder="Ghi chú (vd: phụ kiện/nền)"
                          className="w-full truncate bg-transparent text-xs font-medium outline-none focus:underline"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeExtraImage(img.id)}
                        className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                      >
                        <XIcon className="size-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Vùng nhắc tải lên/kéo-thả/dán bằng đường đứt nét */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed px-3 py-2.5 text-center transition sm:flex-row sm:justify-between ${
                  isDragging
                    ? 'border-primary bg-primary/8 text-primary'
                    : 'border-border bg-background/60 text-muted-foreground hover:border-primary/50 hover:bg-background hover:text-foreground'
                }`}
              >
                <div className="flex items-center gap-2 text-xs">
                  <ImagePlusIcon className="size-4 shrink-0" />
                  <span>
                    {isDragging
                      ? 'Thả chuột để thêm ảnh tham chiếu đính kèm'
                      : 'Thêm ảnh tham chiếu đính kèm: nhấn để tải lên, kéo thả ảnh vào đây, hoặc nhấn trực tiếp Ctrl+V / ⌘V để dán'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowUrlInput((s) => !s)
                  }}
                  className="inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium text-primary hover:bg-primary/10"
                >
                  <LinkIcon className="size-3" />
                  Nhập URL ảnh
                </button>
              </div>

              {showUrlInput && (
                <div className="flex items-center gap-2">
                  <Input
                    value={extraUrlInput}
                    onChange={(e) => setExtraUrlInput(e.target.value)}
                    placeholder="Dán địa chỉ ảnh https://..."
                    className="bg-background text-xs"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddUrl()}
                  />
                  <Button size="sm" onClick={handleAddUrl}>
                    Thêm
                  </Button>
                </div>
              )}
            </div>
          </Section>

          {/* 2. Giao thức, model và tham số nâng cao có thể thu gọn */}
          <Section
            title="2. Model và tham số"
            actions={
              <Button variant="ghost" size="sm" onClick={() => setShowAdvanced((v) => !v)}>
                <SlidersHorizontalIcon className="size-3.5" />
                Tham số nâng cao
                {showAdvanced ? (
                  <ChevronUpIcon className="size-3.5" />
                ) : (
                  <ChevronDownIcon className="size-3.5" />
                )}
              </Button>
            }
          >
            <Field label="Giao thức API">
              <Select
                value={activeProvider}
                onValueChange={(v) => updateApiConfig({ activeProvider: v as ImageProviderId })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROVIDER_LIST.map((pid) => (
                    <SelectItem key={pid} value={pid}>
                      {PROVIDER_META[pid].name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            {activeProvider === 'comfyui' ? (
              <Field label="Mẫu workflow (định dạng API)">
                <div className="space-y-2">
                  <Select
                    value={apiConfig.comfyuiParams.workflowPreset}
                    onValueChange={(v) =>
                      handleSelectComfyPreset(v as ComfyUiParams['workflowPreset'])
                    }
                  >
                    <SelectTrigger className="w-full text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(COMFYUI_WORKFLOW_TEMPLATES) as ComfyPresetId[]).map((key) => (
                        <SelectItem key={key} value={key} className="text-xs">
                          {COMFYUI_WORKFLOW_TEMPLATES[key].label}
                        </SelectItem>
                      ))}
                      <SelectItem value="custom" className="text-xs">
                        Workflow tùy chỉnh (đã nhập JSON)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex flex-wrap gap-1.5">
                    <input
                      ref={comfyFileInputRef}
                      type="file"
                      accept=".json,application/json"
                      onChange={handleComfyFileUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 px-2 text-xs"
                      onClick={() => comfyFileInputRef.current?.click()}
                    >
                      <FileUpIcon className="size-3.5" />
                      Nhập .json
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 px-2 text-xs"
                      onClick={() => setShowComfyJsonModal(true)}
                    >
                      <CodeXmlIcon className="size-3.5" />
                      Sửa JSON
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 px-2 text-xs"
                      onClick={() => void handleExportComfyJson()}
                    >
                      <DownloadIcon className="size-3.5" />
                      Xuất .json
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 px-2 text-xs"
                      onClick={handleCheckComfy}
                      disabled={checkingComfy}
                    >
                      {checkingComfy ? (
                        <LoaderCircleIcon className="size-3.5 animate-spin" />
                      ) : (
                        <ScanSearchIcon className="size-3.5" />
                      )}
                      Kiểm tra model trên máy
                    </Button>
                  </div>
                  {comfyCheck && (
                    <div
                      className={`space-y-1 rounded-xl border px-3 py-2 text-[11px] leading-relaxed ${
                        comfyCheck.ok
                          ? 'border-emerald-500/40 bg-emerald-500/8 text-emerald-700 dark:text-emerald-300'
                          : 'border-destructive/40 bg-destructive/10 text-destructive'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-semibold">
                        {comfyCheck.ok ? (
                          <CircleCheckIcon className="size-3.5" />
                        ) : (
                          <CircleAlertIcon className="size-3.5" />
                        )}
                        {comfyCheck.ok ? 'Workflow khớp với model/node trên máy, có thể tạo' : 'Kiểm tra chưa đạt'}
                      </div>
                      {comfyCheck.info && <div className="opacity-80">{comfyCheck.info}</div>}
                      {comfyCheck.errors.map((m, i) => (
                        <div key={`e${i}`} className="whitespace-pre-wrap break-all">
                          • {m}
                        </div>
                      ))}
                      {comfyCheck.fixes.map((m, i) => (
                        <div key={`f${i}`} className="break-all">
                          ✓ {m}
                        </div>
                      ))}
                      {comfyCheck.warnings.map((m, i) => (
                        <div key={`w${i}`} className="break-all opacity-80">
                          ! {m}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Field>
            ) : (
              <>
                <Field label="Model ID">
                  <Select
                    value={providerCfg.model}
                    onValueChange={(v) => updateProviderConfig(activeProvider, { model: v })}
                  >
                    <SelectTrigger className="w-full font-mono text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {providerMeta.models.map((m) => (
                        <SelectItem key={m.value} value={m.value} className="font-mono text-xs">
                          {m.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                {providerCfg.model === 'custom' && (
                  <Field label="Model ID tùy chỉnh">
                    <Input
                      value={providerCfg.customModel}
                      onChange={(e) =>
                        updateProviderConfig(activeProvider, { customModel: e.target.value })
                      }
                      placeholder="Nhập model ID"
                      className="bg-background font-mono text-xs"
                    />
                  </Field>
                )}
              </>
            )}

            <Field label="Preset phong cách vẽ">
              <Select
                value={apiConfig.stylePreset}
                onValueChange={(v) => updateApiConfig({ stylePreset: v })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(STYLE_PRESETS).map(([key, info]) => (
                    <SelectItem key={key} value={key}>
                      {info.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            {activeProvider === 'comfyui' && (
              <>
                {!parsedComfyNodes.valid && (
                  <div className="col-span-full rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                    {parsedComfyNodes.error}
                  </div>
                )}

                <Field label="Node ảnh chân dung (LoadImage)">
                  <Select
                    value={apiConfig.comfyuiParams.portraitNodeId}
                    onValueChange={(v) => updateComfyUiParams({ portraitNodeId: v })}
                  >
                    <SelectTrigger className="w-full text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Không liên kết</SelectItem>
                      {parsedComfyNodes.imageNodes.map((n) => (
                        <SelectItem key={n.id} value={n.id} className="text-xs">
                          #{n.id} {n.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <Field label="Node ảnh trang phục (LoadImage)">
                  <Select
                    value={apiConfig.comfyuiParams.costumeNodeId}
                    onValueChange={(v) => updateComfyUiParams({ costumeNodeId: v })}
                  >
                    <SelectTrigger className="w-full text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Không liên kết</SelectItem>
                      {parsedComfyNodes.imageNodes.map((n) => (
                        <SelectItem key={n.id} value={n.id} className="text-xs">
                          #{n.id} {n.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <Field label="Node ảnh tư thế (LoadImage)">
                  <Select
                    value={apiConfig.comfyuiParams.poseNodeId}
                    onValueChange={(v) => updateComfyUiParams({ poseNodeId: v })}
                  >
                    <SelectTrigger className="w-full text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Không liên kết</SelectItem>
                      {parsedComfyNodes.imageNodes.map((n) => (
                        <SelectItem key={n.id} value={n.id} className="text-xs">
                          #{n.id} {n.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <Field label="Node prompt thuận (Prompt)">
                  <Select
                    value={apiConfig.comfyuiParams.promptNodeId}
                    onValueChange={(v) => updateComfyUiParams({ promptNodeId: v })}
                  >
                    <SelectTrigger className="w-full text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Giữ prompt gốc của workflow</SelectItem>
                      {parsedComfyNodes.promptNodes.map((n) => (
                        <SelectItem key={n.id} value={n.id} className="text-xs">
                          #{n.id} {n.title} ({n.field})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </>
            )}

            {activeProvider === 'comfyui' && showAdvanced && <WorkflowParameters onPreview={setZoomImageUrl} onUploadingChange={setUploadingSlot} />}

            {/* Tham số riêng của giao thức nâng cao đã mở rộng */}
            {showAdvanced && (
              <>
                {activeProvider === 'gemini' && (
                  <>
                    <Field label="Chế độ giao thức Gemini">
                      <Select
                        value={apiConfig.geminiParams.endpointMode}
                        onValueChange={(v) =>
                          updateGeminiParams({ endpointMode: v as GeminiParams['endpointMode'] })
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="native">Native (:generateContent)</SelectItem>
                          <SelectItem value="openai_chat">OpenAI Chat (/v1/chat/completions)</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field label="Tỉ lệ khung hình (aspectRatio)">
                      <Select
                        value={apiConfig.geminiParams.aspectRatio}
                        onValueChange={(v) =>
                          updateGeminiParams({ aspectRatio: v as GeminiParams['aspectRatio'] })
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3:4">3:4</SelectItem>
                          <SelectItem value="9:16">9:16</SelectItem>
                          <SelectItem value="1:1">1:1</SelectItem>
                          <SelectItem value="4:3">4:3</SelectItem>
                          <SelectItem value="16:9">16:9</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field label="Độ phân giải (imageSize)">
                      <Select
                        value={apiConfig.geminiParams.imageSize}
                        onValueChange={(v) =>
                          updateGeminiParams({ imageSize: v as GeminiParams['imageSize'] })
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1K">1K</SelectItem>
                          <SelectItem value="2K">2K</SelectItem>
                          <SelectItem value="4K">4K</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                  </>
                )}

                {activeProvider === 'gpt' && (
                  <>
                    <Field label="Endpoint gọi (endpointMode)">
                      <Select
                        value={apiConfig.gptParams.endpointMode}
                        onValueChange={(v) =>
                          updateGptParams({ endpointMode: v as GptParams['endpointMode'] })
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="images_edits_json">/v1/images/edits (JSON)</SelectItem>
                          <SelectItem value="responses">/v1/responses</SelectItem>
                          <SelectItem value="chat">/v1/chat/completions</SelectItem>
                          <SelectItem value="images_edits">/v1/images/edits (Multipart)</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field label="Kích thước đầu ra (size)">
                      <Select
                        value={apiConfig.gptParams.size}
                        onValueChange={(v) => updateGptParams({ size: v as GptParams['size'] })}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1024x1536">1024x1536</SelectItem>
                          <SelectItem value="1024x1024">1024x1024</SelectItem>
                          <SelectItem value="1536x1024">1536x1024</SelectItem>
                          <SelectItem value="auto">auto</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field label="Chất lượng render (quality)">
                      <Select
                        value={apiConfig.gptParams.quality}
                        onValueChange={(v) => updateGptParams({ quality: v as GptParams['quality'] })}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">high</SelectItem>
                          <SelectItem value="xhigh">xhigh</SelectItem>
                          <SelectItem value="max">max</SelectItem>
                          <SelectItem value="medium">medium</SelectItem>
                          <SelectItem value="low">low</SelectItem>
                          <SelectItem value="auto">auto</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field label="Độ bám tham chiếu (input_fidelity)">
                      <Select
                        value={apiConfig.gptParams.inputFidelity}
                        onValueChange={(v) =>
                          updateGptParams({ inputFidelity: v as GptParams['inputFidelity'] })
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">high</SelectItem>
                          <SelectItem value="low">low</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field label="Chế độ nền (background)">
                      <Select
                        value={apiConfig.gptParams.background}
                        onValueChange={(v) =>
                          updateGptParams({ background: v as GptParams['background'] })
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="auto">auto</SelectItem>
                          <SelectItem value="transparent">transparent</SelectItem>
                          <SelectItem value="opaque">opaque</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field label="Định dạng ảnh (output_format)">
                      <Select
                        value={apiConfig.gptParams.outputFormat}
                        onValueChange={(v) =>
                          updateGptParams({ outputFormat: v as GptParams['outputFormat'] })
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="png">png</SelectItem>
                          <SelectItem value="webp">webp</SelectItem>
                          <SelectItem value="jpeg">jpeg</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                  </>
                )}

                {activeProvider === 'qwen' && (
                  <>
                    <Field label="Kích thước đầu ra (size)">
                      <Select
                        value={apiConfig.qwenParams.size}
                        onValueChange={(v) => updateQwenParams({ size: v as QwenParams['size'] })}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1024*1536">1024*1536</SelectItem>
                          <SelectItem value="928*1664">928*1664</SelectItem>
                          <SelectItem value="1328*1328">1328*1328</SelectItem>
                          <SelectItem value="1664*928">1664*928</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field label="Mở rộng prompt (prompt_extend)">
                      <div className="flex h-9 items-center justify-between rounded-xl border bg-background px-3">
                        <span className="text-xs text-muted-foreground">
                          {apiConfig.qwenParams.promptExtend ? 'Bật' : 'Tắt'}
                        </span>
                        <Switch
                          checked={apiConfig.qwenParams.promptExtend}
                          onCheckedChange={(v) => updateQwenParams({ promptExtend: v })}
                        />
                      </div>
                    </Field>
                    <Field label="Prompt phủ định (negative_prompt)">
                      <Input
                        value={apiConfig.qwenParams.negativePrompt}
                        onChange={(e) => updateQwenParams({ negativePrompt: e.target.value })}
                        placeholder="độ phân giải thấp, ngón tay thừa, méo mó"
                        className="bg-background text-xs"
                      />
                    </Field>
                  </>
                )}

                {activeProvider === 'doubao' && (
                  <>
                    <Field label="Kích thước đầu ra (size)">
                      <Select
                        value={apiConfig.doubaoParams.size}
                        onValueChange={(v) =>
                          updateDoubaoParams({ size: v as DoubaoParams['size'] })
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1728x2304">1728x2304</SelectItem>
                          <SelectItem value="2K">2K</SelectItem>
                          <SelectItem value="4K">4K</SelectItem>
                          <SelectItem value="1440x2560">1440x2560</SelectItem>
                          <SelectItem value="2048x2048">2048x2048</SelectItem>
                          <SelectItem value="2560x1440">2560x1440</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field label="Chế độ ảnh nhóm (sequential)">
                      <Select
                        value={apiConfig.doubaoParams.sequentialImageGeneration}
                        onValueChange={(v) =>
                          updateDoubaoParams({
                            sequentialImageGeneration:
                              v as DoubaoParams['sequentialImageGeneration'],
                          })
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="disabled">disabled (từng ảnh)</SelectItem>
                          <SelectItem value="auto">auto (ảnh nhóm)</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field label="Định dạng trả về (response_format)">
                      <Select
                        value={apiConfig.doubaoParams.responseFormat}
                        onValueChange={(v) =>
                          updateDoubaoParams({
                            responseFormat: v as DoubaoParams['responseFormat'],
                          })
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="b64_json">b64_json</SelectItem>
                          <SelectItem value="url">url</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                  </>
                )}

                {activeProvider === 'comfyui' && (
                  <>
                    <Field label="Node ghép ba-trong-một (tùy chọn)">
                      <Select
                        value={apiConfig.comfyuiParams.stitchedNodeId}
                        onValueChange={(v) => updateComfyUiParams({ stitchedNodeId: v })}
                      >
                        <SelectTrigger className="w-full text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Không liên kết</SelectItem>
                          {parsedComfyNodes.imageNodes.map((n) => (
                            <SelectItem key={n.id} value={n.id} className="text-xs">
                              #{n.id} {n.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field label="Thời gian chờ tối đa (giây)">
                      <Input
                        type="number"
                        min={60}
                        step={60}
                        value={apiConfig.comfyuiParams.timeoutSec}
                        onChange={(e) =>
                          updateComfyUiParams({ timeoutSec: Math.max(60, Number(e.target.value) || 600) })
                        }
                        className="bg-background text-xs"
                      />
                    </Field>
                    <Field label="Seed ngẫu nhiên (seed)">
                      <div className="flex h-9 items-center justify-between rounded-xl border bg-background px-3">
                        <span className="text-xs text-muted-foreground">
                          {apiConfig.comfyuiParams.randomizeSeed ? 'Seed ngẫu nhiên mỗi lần' : 'Seed workflow cố định'}
                        </span>
                        <Switch
                          checked={apiConfig.comfyuiParams.randomizeSeed}
                          onCheckedChange={(v) => updateComfyUiParams({ randomizeSeed: v })}
                        />
                      </div>
                    </Field>
                  </>
                )}

                {activeProvider !== 'comfyui' && (
                  <>
                    <Field label="Cách truyền tham số ảnh">
                      <Select
                        value={apiConfig.imagePassMode}
                        onValueChange={(v) => updateApiConfig({ imagePassMode: v as ImagePassMode })}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="url">URL</SelectItem>
                          <SelectItem value="base64">Base64</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>

                    <Field label="Kèm ảnh ghép tổng hợp">
                      <div className="flex h-9 items-center justify-between rounded-xl border bg-background px-3">
                        <span className="text-xs text-muted-foreground">
                          {apiConfig.sendStitchedSheet ? 'Đồng thời gửi ảnh ghép' : 'Chỉ gửi chuỗi ảnh đơn'}
                        </span>
                        <Switch
                          checked={apiConfig.sendStitchedSheet}
                          onCheckedChange={(v) => updateApiConfig({ sendStitchedSheet: v })}
                        />
                      </div>
                    </Field>
                  </>
                )}
              </>
            )}
          </Section>

          {/* 3. Prompt và nút tạo */}
          <Section
            title="3. Prompt"
            className="@lg/section:grid-cols-1"
            actions={
              <div className="flex items-center gap-1.5">
                <Button variant="ghost" size="sm" onClick={() => setCustomPrompt(null)}>
                  <RotateCcwIcon className="size-3.5" />
                  Đặt lại
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    void navigator.clipboard.writeText(prompt)
                    toast.success('Đã sao chép')
                  }}
                >
                  <CopyIcon className="size-3.5" />
                  Sao chép
                </Button>
              </div>
            }
          >
            <Textarea
              value={prompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              rows={5}
              className="bg-background font-mono text-xs leading-relaxed"
            />

            <Button
              onClick={handleGenerate}
              disabled={!hydrated || !!activeTask || isGenerating || uploadingSlot !== null}
              className="h-11 w-full text-sm font-semibold"
            >
              {isGenerating ? (
                <>
                  <LoaderCircleIcon className="size-4 animate-spin" />
                  Đang tạo…
                </>
              ) : (
                <>
                  <SparklesIcon className="size-4" />
                  Tạo ảnh nhân vật
                </>
              )}
            </Button>
          </Section>
        </div>

        {/* Cột phải: tập trung hiển thị kết quả tạo AI và trạng thái tạo */}
        <div className="min-w-0 space-y-4 lg:col-span-5">
          <Section
            title="Kết quả tạo"
            className="@lg/section:grid-cols-1"
            actions={
              previewUrl && !isGenerating ? (
                <Button variant="outline" size="sm" asChild>
                  <a href={previewUrl} download="image.png">
                    <DownloadIcon className="size-3.5" />
                    Tải ảnh xuống
                  </a>
                </Button>
              ) : null
            }
          >
            {previewResult && !isGenerating && <Button className="min-h-11" variant="outline" onClick={() => setComparisonResult(previewResult)}>So sánh tham chiếu</Button>}
            <div className="relative flex min-h-[340px] items-center justify-center overflow-hidden rounded-2xl bg-background p-4 sm:min-h-[460px]">
              {isGenerating ? (
                <div className="flex flex-col items-center gap-3 text-center">
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <LoaderCircleIcon className="size-6 animate-spin" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-semibold">Đang tạo ảnh nhân vật…</div>
                    {generatingModel && (
                      <Badge variant="secondary" className="font-mono text-[11px]">
                        {generatingModel}
                      </Badge>
                    )}
                    {generationProgress && (
                      <div className="w-56 max-w-full space-y-1.5 pt-1">
                        <div className="text-xs text-foreground/80">{generationProgress.message}</div>
                        {generationProgress.connection && <p className="text-xs text-muted-foreground">Kết nối: {{connecting: 'Đang kết nối WebSocket', connected: 'Đã kết nối WebSocket', reconnecting: 'Đang kết nối lại WebSocket, theo dõi dự phòng bằng HTTP', degraded: 'WebSocket tạm không khả dụng, theo dõi dự phòng bằng HTTP'}[generationProgress.connection]}</p>}
                        {generationProgress.percent !== undefined && (
                          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-primary transition-all"
                              style={{ width: `${generationProgress.percent}%` }}
                            />
                          </div>
                        )}
                      </div>
                    )}
                    <p className="pt-1 text-xs text-muted-foreground">
                      Chuyển trang sẽ không làm gián đoạn tác vụ hiện tại
                    </p>
                  </div>
                </div>
              ) : generationError ? (
                <div className="flex max-w-md flex-col items-center gap-2 text-center">
                  <CircleAlertIcon className="size-7 text-destructive" />
                  <div className="text-sm font-semibold text-destructive">Tạo thất bại</div>
                  <p className="whitespace-pre-wrap break-all text-left text-xs leading-relaxed text-muted-foreground">
                    {generationError}
                  </p>
                  {previewUrl && (
                    <Button variant="ghost" size="sm" onClick={() => setZoomImageUrl(previewUrl)}>
                      Xem kết quả trước đó
                    </Button>
                  )}
                </div>
              ) : previewUrl ? (
                <button type="button" aria-label="Phóng to kết quả tạo" onClick={() => setZoomImageUrl(previewUrl)} className="cursor-zoom-in rounded-xl focus-visible:outline-2 focus-visible:outline-ring"><img src={previewUrl} alt="Kết quả tạo" className="max-h-[480px] w-auto rounded-xl object-contain transition hover:opacity-95" /></button>
              ) : (
                <div className="flex flex-col items-center gap-2 text-center text-muted-foreground">
                  <SparklesIcon className="size-7 opacity-35" />
                  <span className="text-xs">Nhấn «Tạo ảnh nhân vật» để hiển thị kết quả tạo tại đây</span>
                </div>
              )}
            </div>
          </Section>
          {activeTask && <Section title="Tác vụ chờ xác nhận" className="@lg/section:grid-cols-1">
            <p className="break-all text-xs">{activeTask.task ? `Tác vụ ${activeTask.task.promptId}: sau khi làm mới sẽ tra cứu tác vụ gốc, không gửi lại.` : 'Kết quả gửi chưa rõ hoặc đã bị gián đoạn trước khi gửi, hãy đối chiếu hàng đợi phía backend; sẽ không tự gửi lại.'}</p>
            <div className="flex flex-wrap gap-2">
              <Button disabled={isGenerating || !activeTask.task} onClick={() => void resumeGeneration()}>Tiếp tục theo dõi</Button>
              <Button variant="outline" onClick={() => void stopTracking()}>Dừng theo dõi (không hủy phía backend)</Button>
            </div>
          </Section>}
        </div>
      </div>

      {/* Lịch sử tạo */}
      {history.length > 0 && (
        <Section
          title={`Lịch sử tạo (${history.length})`}
          className="grid-cols-2 @lg/section:grid-cols-3 @3xl/section:grid-cols-4"
          actions={
            <Button variant="ghost" size="sm" onClick={clearHistory}>
              <Trash2Icon className="size-3.5" />
              Xóa hết
            </Button>
          }
        >
          {history.map((h) => (
            <div
              key={h.id}
              className="group flex flex-col justify-between overflow-hidden rounded-2xl bg-background p-2"
            >
              <div className="relative aspect-3/4 overflow-hidden rounded-xl bg-muted">
                <button type="button" aria-label={`Xem lịch sử tạo: ${h.recipeSummary}`} onClick={() => setZoomImageUrl(h.imageUrl)} className="block h-full w-full cursor-zoom-in focus-visible:outline-2 focus-visible:outline-ring">
                <img
                  src={h.imageUrl}
                  alt={h.recipeSummary}
                  className="h-full w-full object-cover transition group-hover:scale-105"
                />
                <span className="absolute bottom-1.5 left-1.5 max-w-[calc(100%-12px)] truncate rounded-md bg-black/70 px-1.5 py-0.5 font-mono text-[10px] text-white">
                  {h.model}
                </span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeHistoryItem(h.id)
                  }}
                  title="Xóa bản ghi này"
                  className="absolute top-1.5 right-1.5 rounded-full bg-black/65 p-1 text-white opacity-85 transition hover:bg-destructive hover:opacity-100"
                >
                  <XIcon className="size-3" />
                </button>
              </div>

              <div className="mt-2 space-y-1.5 px-0.5">
                <div className="truncate text-xs font-medium">{h.recipeSummary}</div>
                <Button variant="outline" className="min-h-11 w-full" onClick={() => setComparisonResult(h)}>So sánh tham chiếu</Button>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setCustomPrompt(h.prompt)
                      toast.success('Đã khôi phục prompt của ảnh này')
                    }}
                    className="flex h-7 items-center justify-center rounded-lg bg-muted text-[11px] font-medium whitespace-nowrap text-foreground transition hover:bg-muted/70"
                  >
                    Dùng lại prompt
                  </button>
                  <a
                    href={h.imageUrl}
                    download={`character-${h.id}.png`}
                    className="flex h-7 items-center justify-center rounded-lg bg-primary/10 text-[11px] font-medium whitespace-nowrap text-primary transition hover:bg-primary/20"
                  >
                    Tải xuống
                  </a>
                </div>
              </div>
            </div>
          ))}
        </Section>
      )}

      <ReferenceComparisonDialog result={comparisonResult} open={comparisonResult !== null} onOpenChange={(open) => !open && setComparisonResult(null)} />
      {/* Hộp đèn phóng to toàn màn hình cho kết quả tạo */}
      <ImageViewer imageUrl={zoomImageUrl || ''} open={Boolean(zoomImageUrl)} onOpenChange={(open) => !open && setZoomImageUrl(null)} />

      {/* Hộp thoại riêng cho ảnh ghép tham chiếu (không chiếm canvas chính) */}
      <Dialog open={Boolean(stitchModalUrl)} onOpenChange={(o) => !o && setStitchModalUrl(null)}>
        <DialogContent className="max-h-[90dvh] w-[95vw] max-w-3xl overflow-y-auto p-4 sm:max-w-3xl">
          <DialogHeader className="flex flex-row flex-wrap items-center justify-between gap-3 pr-8">
            <DialogTitle className="text-base">Thẻ ghép ảnh tham chiếu</DialogTitle>
            {stitchModalUrl && (
              <Button size="sm" variant="outline" asChild>
                <a href={stitchModalUrl} download="reference-sheet.jpg">
                  <DownloadIcon className="size-3.5" />
                  Tải ảnh ghép xuống
                </a>
              </Button>
            )}
          </DialogHeader>
          {stitchModalUrl && (
            <div className="mt-2 flex items-center justify-center overflow-hidden rounded-xl bg-muted p-2">
              <img
                src={stitchModalUrl}
                alt="Ảnh ghép tham chiếu"
                className="max-h-[70dvh] w-auto rounded-lg object-contain"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Hộp thoại trình sửa workflow JSON API ComfyUI */}
      <Dialog open={showComfyJsonModal} onOpenChange={setShowComfyJsonModal}>
        <DialogContent className="max-h-[90dvh] w-[95vw] max-w-3xl overflow-y-auto p-4 sm:max-w-3xl">
          <DialogHeader className="flex flex-row flex-wrap items-center justify-between gap-3 pr-8">
            <DialogTitle className="text-base">Workflow JSON API ComfyUI</DialogTitle>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const info = parseComfyWorkflowNodes(apiConfig.comfyuiParams.workflowJson)
                if (!info.valid) {
                  toast.error(info.error || 'Workflow JSON không hợp lệ')
                  return
                }
                const detected = autoDetectComfyMappings(apiConfig.comfyuiParams.workflowJson)
                updateComfyUiParams(detected)
                toast.success(
                  `Đã tự động nhận diện lại node: ${info.imageNodes.length} node ảnh, ${info.promptNodes.length} node prompt`
                )
              }}
            >
              Tự động nhận diện node
            </Button>
          </DialogHeader>
          <p className="text-xs text-muted-foreground">
            Hãy bật «Bật tùy chọn chế độ nhà phát triển» trong cài đặt ComfyUI, nhấn «Xuất (API)» trong menu để lấy JSON rồi dán vào bên dưới.
          </p>
          <Button type="button" size="sm" variant="outline" onClick={() => void handleExportComfyJson(true)}>Xuất API gốc</Button>
          <Textarea
            value={apiConfig.comfyuiParams.workflowJson}
            onChange={(e) =>
              updateComfyUiParams({
                workflowPreset: 'custom',
                workflowJson: e.target.value,
              })
            }
            rows={18}
            className="font-mono text-xs leading-relaxed"
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
