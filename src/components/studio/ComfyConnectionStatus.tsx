import { useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useStudio } from '@/store/studioStore'
import { COMFY_CONNECTION_LABELS } from '@/store/useComfyConnection'

export function ComfyConnectionStatus({ compact = false }: { compact?: boolean }) {
  const { comfyConnection, checkComfyConnection, setComfyConnectionVisible } = useStudio()
  useEffect(() => {
    setComfyConnectionVisible(true)
    return () => setComfyConnectionVisible(false)
  }, [setComfyConnectionVisible])
  const { status, checkedAt, info, error } = comfyConnection
  return <div className="flex min-w-0 flex-wrap items-center gap-2 text-xs" role="status">
    <Badge variant={status === 'error' ? 'destructive' : status === 'connected' ? 'default' : 'secondary'}>{`ComfyUI · ${COMFY_CONNECTION_LABELS[status]}`}</Badge>
    {compact && checkedAt && <span className="text-muted-foreground">{new Date(checkedAt).toLocaleTimeString()}</span>}
    {!compact && <>
      {info && status === 'connected' && <span>{info}</span>}
      {error && <span className="break-words text-destructive">{error}</span>}
      <span className="text-muted-foreground">{checkedAt ? `Kiểm tra gần nhất ${new Date(checkedAt).toLocaleTimeString()}` : 'Chưa có lần kiểm tra nào'}; kiểm tra HTTP không có nghĩa là task WebSocket đã kết nối</span>
    </>}
    <Button type="button" size="sm" variant="outline" className="min-h-11" disabled={status === 'checking'} onClick={() => void checkComfyConnection(true)}>Kiểm tra kết nối</Button>
  </div>
}
