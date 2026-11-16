import { createFileRoute, Link } from '@tanstack/react-router'
import {
  CheckIcon,
  ExternalLinkIcon,
  EyeIcon,
  EyeOffIcon,
  RotateCcwIcon,
  ScanSearchIcon,
  SparklesIcon,
} from 'lucide-react'
import { useState } from 'react'
import { toast } from '@/lib/notifications'
import { Field, Section } from '@/components/common/FormSection'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { detectComfyUi, PROVIDER_META } from '@/services/aiGenerator'
import { useStudio } from '@/store/studioStore'
import type { ImagePassMode, ImageProviderId } from '@/types/gallery'
import { ComfyConnectionStatus } from '@/components/studio/ComfyConnectionStatus'
import { COMFY_CONNECTION_LABELS } from '@/store/useComfyConnection'

export const Route = createFileRoute('/settings')({
  staticData: { title: 'Cấu hình API' },
  component: SettingsPage,
})

const PROVIDER_ORDER: ImageProviderId[] = ['gemini', 'gpt', 'qwen', 'doubao', 'comfyui']

function SettingsPage() {
  const { apiConfig, updateApiConfig, updateProviderConfig, comfyConnection } = useStudio()
  const [showKey, setShowKey] = useState(false)
  const [testingComfy, setTestingComfy] = useState(false)

  const pid = apiConfig.activeProvider
  const meta = PROVIDER_META[pid]
  const pCfg = apiConfig.providers[pid]

  const handleDetectComfy = async () => {
    setTestingComfy(true)
    try {
      const found = await detectComfyUi(pCfg.baseUrl, pCfg.apiKey)
      if (!found) {
        toast.error('Không tìm thấy ComfyUI khả dụng (đã thử địa chỉ hiện tại, 127.0.0.1:8000, 127.0.0.1:8188), hãy xác nhận đã khởi động và kiểm tra cài đặt CORS', {
          duration: 10000,
        })
        return
      }
      updateProviderConfig('comfyui', { baseUrl: found.baseUrl })
      toast.success(`Đã nhận diện: ${found.info} (${found.baseUrl})`)
    } finally {
      setTestingComfy(false)
    }
  }

  return (
    <>
      <PageHeader
        title="Cấu hình giao diện API"
        actions={
          <Button size="sm" asChild>
            <Link to="/studio">
              <SparklesIcon className="size-4" />
              Về bàn tổng hợp
            </Link>
          </Button>
        }
      />

      {/* Thẻ chuyển đổi 5 giao thức */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {PROVIDER_ORDER.map((id) => {
          const itemMeta = PROVIDER_META[id]
          const isActive = pid === id
          const hasKey =
            id === 'comfyui'
              ? Boolean(apiConfig.providers.comfyui.baseUrl.trim())
              : Boolean(apiConfig.providers[id].apiKey.trim())
          return (
            <button
              key={id}
              type="button"
              onClick={() => updateApiConfig({ activeProvider: id })}
              className={`flex items-center justify-between rounded-xl border px-3.5 py-2.5 text-left transition-all ${
                isActive
                  ? 'border-primary bg-primary/6 font-semibold shadow-xs'
                  : 'border-border/60 bg-card hover:bg-muted/40'
              }`}
            >
              <span className="min-w-0"><span className="block truncate text-sm">{itemMeta.name}</span><span className="block text-xs font-normal text-muted-foreground">{id === 'comfyui' ? COMFY_CONNECTION_LABELS[comfyConnection.status] : hasKey ? 'Đã cấu hình' : 'Chưa cấu hình Key'}</span></span>
              <span
                aria-hidden="true"
                className={`size-2 shrink-0 rounded-full ${
                  id === 'comfyui' && comfyConnection.status === 'connected' ? 'bg-emerald-500' : hasKey ? 'bg-amber-500' : 'bg-muted-foreground/30'
                }`}
                title={id === 'comfyui' ? COMFY_CONNECTION_LABELS[comfyConnection.status] : hasKey ? 'Đã cấu hình, chưa kiểm tra' : 'Chưa cấu hình Key'}
              />
            </button>
          )
        })}
      </div>

      {pid === 'comfyui' && <ComfyConnectionStatus />}

      {/* Cấu hình kết nối của nhà cung cấp hiện tại */}
      <Section
        title={`${meta.name} Cấu hình kết nối`}
        actions={
          <div className="flex items-center gap-1.5">
            {pid === 'comfyui' && (
              <>
                <Button variant="outline" size="sm" onClick={handleDetectComfy} disabled={testingComfy}>
                  <ScanSearchIcon className="size-3.5" />
                  Tự động nhận diện
                </Button>
              </>
            )}
            <Button variant="ghost" size="sm" asChild>
              <a href={meta.docUrl} target="_blank" rel="noreferrer">
                <ExternalLinkIcon className="size-3.5" />
                Tài liệu
              </a>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                updateProviderConfig(pid, {
                  baseUrl: meta.defaultBaseUrl,
                  model: meta.models[0].value,
                })
                toast.success('Đã khôi phục mặc định')
              }}
            >
              <RotateCcwIcon className="size-3.5" />
              Đặt lại
            </Button>
          </div>
        }
      >
        <Field
          label={pid === 'comfyui' ? 'Địa chỉ ComfyUI (Base URL)' : 'Base URL'}
          hint={
            pid === 'comfyui'
              ? `Khi chạy trang này cục bộ, điền /comfy (proxy cùng nguồn, không cần đổi cài đặt CORS); khi kết nối trực tiếp, ComfyUI cần thêm tham số khởi động --enable-cors-header "${typeof window !== 'undefined' ? window.location.origin : '*'}". Bản Desktop dùng cổng mặc định 8000, bản portable dùng 8188`
              : undefined
          }
        >
          <Input
            type={pid === 'comfyui' ? 'text' : 'url'}
            value={pCfg.baseUrl}
            onChange={(e) => updateProviderConfig(pid, { baseUrl: e.target.value })}
            placeholder={meta.defaultBaseUrl}
          />
        </Field>

        <Field label={pid === 'comfyui' ? 'API Key (tùy chọn, để trống khi chạy cục bộ)' : 'API Key'}>
          <div className="relative">
            <Input
              type={showKey ? 'text' : 'password'}
              value={pCfg.apiKey}
              onChange={(e) => updateProviderConfig(pid, { apiKey: e.target.value })}
              placeholder={
                pid === 'comfyui'
                  ? 'ComfyUI cục bộ không cần điền, xác thực từ xa có thể điền Token'
                  : 'Nhập API Key (chỉ lưu trong trình duyệt cục bộ)'
              }
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowKey((s) => !s)}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showKey ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
            </button>
          </div>
        </Field>

        {pid !== 'comfyui' && (
          <Field label="Model ID mặc định">
            <Select
              value={pCfg.model}
              onValueChange={(v) => updateProviderConfig(pid, { model: v })}
            >
              <SelectTrigger className="w-full font-mono text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {meta.models.map((m) => (
                  <SelectItem key={m.value} value={m.value} className="font-mono text-xs">
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        )}

        {pid !== 'comfyui' && pCfg.model === 'custom' && (
          <Field label="Model ID tùy chỉnh">
            <Input
              value={pCfg.customModel}
              onChange={(e) => updateProviderConfig(pid, { customModel: e.target.value })}
              placeholder={pid === 'doubao' ? 'ep-2026xxxx hoặc model ID' : 'Nhập model ID'}
              className="font-mono text-xs"
            />
          </Field>
        )}
      </Section>

      {pid === 'comfyui' && (
        <p className="text-sm text-muted-foreground">Model do workflow quyết định. Hãy về bàn tổng hợp để nhập workflow và đặt các node chân dung, trang phục và tư thế.</p>
      )}

      {/* Cài đặt truyền tải toàn cục */}
      {pid !== 'comfyui' && (
        <Section title="Tùy chọn yêu cầu toàn cục">
          <Field label="Cách truyền tham số ảnh tham chiếu">
            <Select
              value={apiConfig.imagePassMode}
              onValueChange={(v) => updateApiConfig({ imagePassMode: v as ImagePassMode })}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="url">Truyền URL ảnh (không cần tải file lên, nên dùng)</SelectItem>
                <SelectItem value="base64">Chuyển mã Base64 để truyền</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field
            label="Proxy CORS phía máy chủ (/api/proxy)"
            hint="Mặc định tắt (trình duyệt kết nối trực tiếp); sẽ tự bật khi chuyển sang Alibaba Cloud Bailian (Qwen) hoặc Volcengine Ark (Doubao). Chỉ hỗ trợ tên miền trong danh sách cho phép (có thể mở rộng qua biến môi trường phía máy chủ PROXY_ALLOWED_ORIGINS)"
          >
            <div className="flex h-9 items-center justify-between rounded-xl border bg-background px-3">
              <span className="text-xs text-muted-foreground">
                {apiConfig.useProxy ? 'Đã bật (khắc phục giới hạn CORS)' : 'Đã tắt (trình duyệt kết nối trực tiếp)'}
              </span>
              <Switch
                checked={apiConfig.useProxy}
                onCheckedChange={(v) => updateApiConfig({ useProxy: v })}
              />
            </div>
          </Field>
        </Section>
      )}

      <div className="flex justify-end">
        <Button size="sm" onClick={() => toast.success('Đã lưu cấu hình')}>
          <CheckIcon className="size-4" />
          Lưu cấu hình
        </Button>
      </div>
    </>
  )
}
