import { createFileRoute } from '@tanstack/react-router'
import { Section } from '@/components/common/FormSection'
import { PageHeader } from '@/components/common/PageHeader'
import { Badge } from '@/components/ui/badge'

export const Route = createFileRoute('/guide')({
  staticData: { title: 'Hướng dẫn sử dụng và tuyên bố miễn trừ trách nhiệm' },
  component: GuidePage,
})

function GuidePage() {
  return (
    <>
      <PageHeader title="Hướng dẫn sử dụng và tuyên bố miễn trừ trách nhiệm" />

      <Section title="Quy trình tổng hợp nhân vật" className="@lg/section:grid-cols-3">
        <div className="rounded-2xl bg-background p-4">
          <Badge>1. Chân dung</Badge>
          <h3 className="mt-2 text-sm font-semibold">Thư viện chân dung (1,499)</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Chọn tham chiếu ngũ quan và kiểu tóc, hoặc tải trực tiếp ảnh chân dung tùy chỉnh lên bàn tổng hợp để khóa đặc điểm khuôn mặt nhân vật.
          </p>
        </div>

        <div className="rounded-2xl bg-background p-4">
          <Badge>2. Trang phục</Badge>
          <h3 className="mt-2 text-sm font-semibold">Thư viện trang phục (3,224)</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Chọn theo tất cả / thực tế / 2D cùng nguồn, danh mục, thẻ; gồm ギア tả thực 1.407 bộ, Shisei các triều đại Trung Quốc 57 bộ (227 góc nhìn), ギア anime 1.320 bộ và CharaDB 2D 440 bộ.
          </p>
        </div>

        <div className="rounded-2xl bg-background p-4">
          <Badge>3. Tư thế + ảnh đính kèm</Badge>
          <h3 className="mt-2 text-sm font-semibold">Thư viện tư thế (1,439)</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Chọn mẫu trắng 3D 5 góc nhìn hoặc ảnh depth (Depth), kết hợp API đám mây hoặc ComfyUI cục bộ để tạo tranh nhân vật chỉ bằng một cú nhấp.
          </p>
        </div>
      </Section>

      <Section title="Tuyên bố miễn trừ trách nhiệm và quy tắc sử dụng hợp lệ (bắt buộc đọc)" className="@lg/section:grid-cols-1">
        <div className="space-y-2.5 rounded-2xl bg-background p-4 text-xs leading-relaxed text-muted-foreground">
          <p>
            <strong className="text-foreground">1. Chỉ dùng cho học tập và sáng tạo nghệ thuật hợp pháp (nghiêm cấm vi phạm pháp luật):</strong>
            Dự án này (gồm bàn làm việc web, plugin ComfyUI cục bộ và mẫu workflow)
            <strong className="text-foreground">chỉ dùng cho học tập cá nhân, nghiên cứu cấu trúc cơ thể người, tham chiếu bố cục minh họa và trao đổi kỹ thuật</strong>
            Nghiêm cấm dùng công cụ này để tạo, sản xuất hay phát tán bất kỳ nội dung nào vi phạm pháp luật, khiêu dâm, bạo lực bị cấm; nghiêm cấm tải ảnh người thật khi chưa được người đó cho phép rõ ràng để hoán đổi khuôn mặt hay tổng hợp deepfake (Deepfake) và các hành vi xâm phạm quyền chân dung, quyền riêng tư và quyền danh dự của người khác.
          </p>
          <p>
            <strong className="text-foreground">2. Lưu ý về nội dung nhạy cảm NSFW (18+):</strong>
            Thư viện có một số tư thế mẫu 3D hướng người lớn (hệ gợi cảm đơn toàn thân, đôi quấn quýt) và tham chiếu trang phục nội y/gợi cảm, nhằm phục vụ luyện vẽ và thiết kế động tác. Hệ thống mặc định bật «Chế độ an toàn (SFW)» để chặn các danh mục trên,
            <strong className="text-rose-600 dark:text-rose-400">người chưa đủ 18 tuổi nghiêm cấm tắt chế độ an toàn hoặc truy cập nội dung liên quan</strong>.
          </p>
          <p>
            <strong className="text-foreground">3. Bảo vệ quyền riêng tư và trách nhiệm của người dùng:</strong>
            Bàn làm việc này là ứng dụng front-end chạy hoàn toàn cục bộ, mọi yêu cầu tạo ảnh bằng AI đều do API Key đám mây mà người dùng tự cấu hình hoặc môi trường ComfyUI trên máy của người dùng thực hiện trực tiếp, nền tảng không thu thập hay lưu trữ bất kỳ ảnh nào người dùng tải lên hay kết quả đã tạo.
            <strong className="text-foreground">Mọi trách nhiệm pháp lý phát sinh do người dùng sử dụng sai quy định hoặc phát tán không đúng đều do chính người dùng chịu hoàn toàn, không liên quan đến dự án này và người bảo trì.</strong>
          </p>
        </div>
      </Section>

      <Section title="Nguồn dữ liệu và giải thích bản quyền" className="@lg/section:grid-cols-1">
        <div className="space-y-2.5 rounded-2xl bg-background p-4 text-xs leading-relaxed text-muted-foreground">
          <p>
            <strong className="text-foreground">• Quyền tác giả thuộc về tác giả gốc:</strong>
            Ảnh tham chiếu tư thế sẵn có trong repo này (<code>ai-pose-gallery.pages.dev</code>, <code>ai-pose-depth-gallery.pages.dev</code>), trang phục thực tế (<code>ai-costume-gallery.pages.dev</code>), chân dung (<code>ai-portrait-gallery.pages.dev</code>) và metadata gốc lấy từ tác giả gốc{' '}
            <strong className="text-foreground">ギア（@giaaibusi）</strong> trên trang công khai, bản quyền thuộc về tác giả gốc. Repo này chỉ là kho lưu trữ học tập về kỹ thuật front-end sau khi đã dịch và bản địa hóa sang tiếng Trung, không khẳng định bất kỳ quyền sở hữu nào đối với ảnh gốc.
          </p>
          <p>
            <strong className="text-foreground">• Nguồn trang phục 2D:</strong>
            440 bộ trang phục 2D lấy từ <a className="underline hover:text-foreground" href="https://charadb-2fi.pages.dev/" target="_blank" rel="noopener noreferrer">たき AI · CharaDB</a>(thẻ và tên tuân theo CC0, ảnh tải trực tuyến từ trang gốc, chỉ dùng cho học tập và tham chiếu tạo ảnh, cấm dùng cho người thật/trẻ vị thành niên hoặc phân phối lại ảnh gốc, xem chi tiết tại <a className="underline hover:text-foreground" href="https://github.com/taki-ttt/charadb/blob/main/LICENSE" target="_blank" rel="noopener noreferrer">Giải thích của tác giả gốc</a>).
          </p>
          <p>
            <strong className="text-foreground">• Giới hạn sử dụng và phân phối:</strong>
            Thư viện chân dung tuân theo <strong className="text-emerald-600 dark:text-emerald-400">giấy phép CC0 1.0</strong>; thư viện tư thế và trang phục thực tế sẵn có được dùng miễn phí cho học tập cá nhân và tham chiếu tạo ảnh bằng AI,
            <strong className="text-foreground">nghiêm cấm đóng gói ảnh gốc của thư viện này để bán lại hoặc dùng để phân phối có trả phí</strong>.
          </p>
        </div>
      </Section>
    </>
  )
}
