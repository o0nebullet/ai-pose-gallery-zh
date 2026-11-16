// Cloudflare Pages Function / Worker: /api/proxy
// Dùng trong môi trường production để giải quyết giới hạn CORS của trình duyệt với API chính thức của Alibaba Cloud Bailian (DashScope) và Volcengine Ark của ByteDance
// Chỉ cho phép các domain upstream trong whitelist, hỗ trợ mở rộng động qua biến môi trường PROXY_ALLOWED_ORIGINS (phân tách bằng dấu phẩy/khoảng trắng/xuống dòng).

export interface ProxyEnv {
  /**
   * Biến môi trường tùy chọn: cấu hình động danh sách domain upstream được phép chuyển tiếp qua /api/proxy (nhiều quy tắc phân tách bằng dấu phẩy, dấu chấm phẩy hoặc khoảng trắng).
   * Hỗ trợ:
   * - Domain chính xác: `https://api.openai.com`
   * - Domain con dùng ký tự đại diện: `https://*.openai.com`, `https://*.volces.com`
   * - Cho phép tất cả: `*`
   */
  PROXY_ALLOWED_ORIGINS?: string
}

/**
 * Quy tắc origin upstream được phép chuyển tiếp theo mặc định.
 */
const DEFAULT_ALLOWED_ORIGINS = [
  'https://dashscope.aliyuncs.com', // Alibaba Cloud Bailian / Qwen
  'https://ark.cn-beijing.volces.com', // Volcengine Ark / Doubao
  'https://generativelanguage.googleapis.com', // Google Gemini
  'https://api.openai.com', // OpenAI
]

function matchOriginRule(target: URL, rawRule: string): boolean {
  const rule = rawRule.trim()
  if (!rule) return false
  if (rule === '*') return true

  // Hỗ trợ domain con dùng ký tự đại diện: ví dụ https://*.openai.com hoặc *.openai.com
  const wildcardMatch = rule.match(/^(?:(https?):\/\/)?\*\.([a-z0-9.-]+)(?::(\d+))?(?:\/.*)?$/i)
  if (wildcardMatch) {
    const [, proto, baseHost, port] = wildcardMatch
    if (proto && `${proto.toLowerCase()}:` !== target.protocol) return false
    if ((port || '') !== target.port) return false
    const host = target.hostname.toLowerCase()
    const suffix = `.${baseHost.toLowerCase().replace(/^\.+|\.+$/g, '')}`
    return host.endsWith(suffix) && host.length > suffix.length
  }

  // Khớp origin chính xác
  try {
    const parsed = new URL(rule.includes('://') ? rule : `https://${rule}`)
    return parsed.origin === target.origin
  } catch {
    return false
  }
}

function isOriginAllowed(target: URL, envRaw?: string): boolean {
  const extraRules =
    envRaw && typeof envRaw === 'string'
      ? envRaw
          .split(/[\s,;]+/)
          .map((s) => s.trim())
          .filter(Boolean)
      : []
  const allRules = [...DEFAULT_ALLOWED_ORIGINS, ...extraRules]
  return allRules.some((rule) => matchOriginRule(target, rule))
}

/** Giới hạn kích thước body của 1 lần chuyển tiếp: với API tạo ảnh mang theo ảnh base64 thì 10 MiB là đủ. */
const MAX_BODY_BYTES = 10 * 1024 * 1024

class BodyTooLargeError extends Error {}

const jsonResponse = (status: number, message: string) =>
  new Response(JSON.stringify({ error: { message } }), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  })

/**
 * Thống kê kích thước body của request theo luồng (streaming), vượt giới hạn thì ngắt ngay.
 * Phía trình duyệt thường gửi kèm content-length, đây là phương án dự phòng cho trường hợp upload chunked.
 */
const limitBodySize = (body: ReadableStream<Uint8Array> | null, limit: number) => {
  if (!body) return null
  let received = 0
  return body.pipeThrough(
    new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
        received += chunk.byteLength
        if (received > limit) {
          controller.error(new BodyTooLargeError())
          return
        }
        controller.enqueue(chunk)
      },
    }),
  )
}

export const onRequestPost = async (context: { request: Request; env?: ProxyEnv }) => {
  const { request, env } = context

  const targetUrl = request.headers.get('x-target-url')
  if (!targetUrl) return jsonResponse(400, 'Thiếu header x-target-url')

  let target: URL
  try {
    target = new URL(targetUrl)
  } catch {
    return jsonResponse(400, 'Header x-target-url không hợp lệ')
  }

  // Chỉ cho phép upstream https trong whitelist (gồm biến môi trường PROXY_ALLOWED_ORIGINS), còn lại từ chối hết
  if (target.protocol !== 'https:' || !isOriginAllowed(target, env?.PROXY_ALLOWED_ORIGINS)) {
    return jsonResponse(403, 'Origin đích không được phép')
  }

  const declaredLength = Number(request.headers.get('content-length') ?? '0')
  if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) {
    return jsonResponse(413, `Nội dung yêu cầu vượt quá ${MAX_BODY_BYTES} byte`)
  }

  const forwardHeaders = new Headers()
  for (const key of ['content-type', 'authorization', 'x-goog-api-key', 'x-dashscope-async']) {
    const val = request.headers.get(key)
    if (val) forwardHeaders.set(key, val)
  }

  try {
    const upstream = await fetch(target.toString(), {
      method: 'POST',
      headers: forwardHeaders,
      body: limitBodySize(request.body, MAX_BODY_BYTES),
    })
    return new Response(upstream.body, {
      status: upstream.status,
      headers: {
        'Content-Type': upstream.headers.get('content-type') || 'application/json; charset=utf-8',
      },
    })
  } catch (err) {
    if (err instanceof BodyTooLargeError) {
      return jsonResponse(413, `Nội dung yêu cầu vượt quá ${MAX_BODY_BYTES} byte`)
    }
    return jsonResponse(502, err instanceof Error ? err.message : 'Lỗi proxy upstream')
  }
}
