import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import {
  ArrowRightIcon,
  CheckIcon,
  FlameIcon,
  LayersIcon,
  PersonStandingIcon,
  PlusIcon,
  ShirtIcon,
  UserRoundIcon,
} from 'lucide-react'
import { costumesQuery, portraitsQuery, posesQuery } from '@/api/gallery'
import { PageHeader } from '@/components/common/PageHeader'
import { StatCard } from '@/components/common/StatCard'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useStudio } from '@/store/studioStore'
import { referenceImageUrl } from '@/lib/recipeImages'

export const Route = createFileRoute('/')({
  staticData: { title: 'Tổng quan thư viện' },
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(posesQuery),
      context.queryClient.ensureQueryData(costumesQuery),
      context.queryClient.ensureQueryData(portraitsQuery),
    ]),
  pendingComponent: () => <Skeleton className="h-[520px] rounded-[22px]" />,
  component: DashboardPage,
})

function DashboardPage() {
  const { data: posesData } = useSuspenseQuery(posesQuery)
  const { data: costumes } = useSuspenseQuery(costumesQuery)
  const { data: portraits } = useSuspenseQuery(portraitsQuery)
  const { recipe, togglePortrait } = useStudio()

  const topPortraits = portraits.filter((p) => p.热门).slice(0, 10)
  const totalImages = posesData.items.length + costumes.length + portraits.length

  return (
    <>
      <PageHeader title="Thư viện tham chiếu nhân vật AI" />

      {/* Thẻ chỉ số dữ liệu chính */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          title="Tổng ảnh tham chiếu"
          value={totalImages.toLocaleString('zh-CN')}
          icon={<LayersIcon />}
          desc="11,568 ảnh HD cục bộ"
        />
        <StatCard
          title="Tư thế (Pose)"
          value={`${posesData.groups.length} nhóm`}
          icon={<PersonStandingIcon />}
          desc={`${posesData.items.length} ảnh · Mẫu trắng/Depth`}
        />
        <StatCard
          title="Trang phục (Costume)"
          value={`${costumes.length.toLocaleString('zh-CN')} bộ`}
          icon={<ShirtIcon />}
          desc="Thực tế 1,407 · 2D 440"
        />
        <StatCard
          title="Chân dung (Portrait)"
          value={`${portraits.length.toLocaleString('zh-CN')} ảnh`}
          icon={<UserRoundIcon />}
          desc="Giấy phép CC0 · 51 kiểu tóc"
        />
      </div>

      {/* Thẻ lối vào 3 thư viện chính */}
      <div className="grid gap-3 sm:grid-cols-3 sm:gap-4">
        <Link
          to="/poses"
          className="group flex flex-col justify-between rounded-[20px] bg-muted p-4 transition hover:bg-muted/70"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">🕺 Thư viện tư thế</h2>
            <Badge variant="secondary">1,439</Badge>
          </div>
          <div className="mt-3 grid grid-cols-4 gap-1.5">
            {posesData.groups.slice(0, 4).map((g) => (
              <img
                key={g.key}
                src={`/${g.order[0].缩略图}`}
                alt={g.name}
                loading="lazy"
                className="aspect-3/4 w-full rounded-lg bg-background object-cover"
              />
            ))}
          </div>
        </Link>

        <Link
          to="/costumes"
          className="group flex flex-col justify-between rounded-[20px] bg-muted p-4 transition hover:bg-muted/70"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">👗 Thư viện trang phục</h2>
            <Badge variant="secondary">{costumes.length.toLocaleString('zh-CN')}</Badge>
          </div>
          <div className="mt-3 grid grid-cols-4 gap-1.5">
            {costumes.slice(0, 4).map((c) => (
              <img
                key={c.id}
                src={referenceImageUrl(c.缩略图)}
                alt={c.服装名称}
                loading="lazy"
                className="aspect-3/4 w-full rounded-lg bg-background object-cover"
              />
            ))}
          </div>
        </Link>

        <Link
          to="/portraits"
          className="group flex flex-col justify-between rounded-[20px] bg-muted p-4 transition hover:bg-muted/70"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">👤 Thư viện chân dung</h2>
            <Badge variant="secondary">1,499</Badge>
          </div>
          <div className="mt-3 grid grid-cols-4 gap-1.5">
            {portraits.slice(0, 4).map((p) => (
              <img
                key={p.id}
                src={`/${p.缩略图}`}
                alt={p.标题}
                loading="lazy"
                className="aspect-3/4 w-full rounded-lg bg-background object-cover"
              />
            ))}
          </div>
        </Link>
      </div>

      {/* Khu vực chọn nhanh chân dung hot Top 10 */}
      <section className="rounded-[20px] bg-muted p-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold sm:text-base">
            <FlameIcon className="size-4 text-orange-500" />
            Chân dung hot Top 10
          </h2>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/portraits">
              Tất cả
              <ArrowRightIcon className="size-3.5" />
            </Link>
          </Button>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-5 lg:grid-cols-10">
          {topPortraits.map((item, idx) => {
            const picked = recipe.portrait?.id === item.id
            return (
              <div
                key={item.id}
                onClick={() => togglePortrait(item)}
                className="group relative cursor-pointer overflow-hidden rounded-xl bg-background transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="relative aspect-4/5 overflow-hidden">
                  <img
                    src={`/${item.缩略图}`}
                    alt={item.标题}
                    loading="lazy"
                    className="h-full w-full object-cover transition group-hover:scale-105"
                  />
                  <span className="absolute top-1.5 left-1.5 rounded-md bg-black/70 px-1.5 py-0.5 text-[10px] font-bold text-white">
                    #{idx + 1}
                  </span>
                  <span
                    className={`absolute right-1.5 bottom-1.5 flex size-6 items-center justify-center rounded-full text-white shadow ${
                      picked ? 'bg-emerald-600' : 'bg-black/65 group-hover:bg-primary'
                    }`}
                  >
                    {picked ? <CheckIcon className="size-3.5" /> : <PlusIcon className="size-3.5" />}
                  </span>
                </div>
                <div className="p-1.5">
                  <div className="truncate text-[11px] font-medium">{item.发型名称}</div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Thanh nhắc tuyên bố miễn trừ trách nhiệm ở cuối trang */}
      <footer className="rounded-[18px] border border-border/60 bg-muted/50 px-4 py-3 text-xs leading-relaxed text-muted-foreground">
        <strong className="text-foreground">⚠️ Tuyên bố miễn trừ trách nhiệm:</strong>
        Ảnh tham chiếu tư thế và trang phục thực tế gốc của trang này lấy từ nhà sáng tạo trên X{' '}
        <a
          href="https://x.com/giaaibusi"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-foreground"
        >
          ギア (@giaaibusi)
        </a>{' '}
        chia sẻ công khai. Trang phục 2D mới bổ sung lấy từ たき AI · CharaDB, chỉ thu thập metadata, ảnh được đọc từ trang nguồn, mỗi tư liệu áp dụng điều kiện riêng. Mặc định đã bật «Chế độ an toàn (SFW)» để ẩn các danh mục nhạy cảm 18+, người chưa đủ 18 tuổi không được tắt. Công cụ và tư liệu này
        <strong className="text-foreground">chỉ dùng cho học tập cá nhân và sáng tạo nghệ thuật hợp pháp, nghiêm cấm dùng cho bất kỳ mục đích vi phạm pháp luật hay xâm phạm quyền chân dung của người khác</strong>。{' '}
        <Link to="/guide" className="font-medium text-primary underline">
          Xem toàn bộ tuyên bố miễn trừ trách nhiệm →
        </Link>
      </footer>
    </>
  )
}
