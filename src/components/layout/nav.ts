import type { LinkProps } from '@tanstack/react-router'
import {
  BookOpenIcon,
  KeyRoundIcon,
  LayoutDashboardIcon,
  PersonStandingIcon,
  ShirtIcon,
  SparklesIcon,
  UserRoundIcon,
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  title: string
  to: NonNullable<LinkProps['to']>
  icon: LucideIcon
  badge?: string
}

export interface NavGroup {
  label: string
  items: NavItem[]
}

export const navGroups: NavGroup[] = [
  {
    label: 'Bàn làm việc',
    items: [
      { title: 'Tổng quan thư viện', to: '/', icon: LayoutDashboardIcon },
      { title: 'Bàn tổng hợp nhân vật AI', to: '/studio', icon: SparklesIcon, badge: 'PRO' },
    ],
  },
  {
    label: '3 thư viện tham chiếu',
    items: [
      { title: 'Thư viện tư thế', to: '/poses', icon: PersonStandingIcon, badge: '1,439' },
      { title: 'Thư viện trang phục', to: '/costumes', icon: ShirtIcon, badge: '3,224' },
      { title: 'Thư viện chân dung', to: '/portraits', icon: UserRoundIcon, badge: '1,499' },
    ],
  },
  {
    label: 'Cấu hình & hướng dẫn',
    items: [
      { title: 'Cấu hình API', to: '/settings', icon: KeyRoundIcon },
      { title: 'Hướng dẫn sử dụng & tuyên bố miễn trừ trách nhiệm', to: '/guide', icon: BookOpenIcon },
    ],
  },
]

const allItems = navGroups.flatMap((g) => g.items)

export function activeNavTo(pathname: string): string | undefined {
  let best: string | undefined
  for (const { to } of allItems) {
    const hit = to === '/' ? pathname === '/' : pathname === to || pathname.startsWith(`${to}/`)
    if (hit && (!best || to.length > best.length)) best = to
  }
  return best
}
