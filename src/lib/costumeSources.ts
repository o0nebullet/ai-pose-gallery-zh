import type { CostumeItem } from '@/types/gallery'

const SHISEI_REPOSITORY = 'https://github.com/wquguru/shisei'
const SHISEI_REVISION = '8f61ceab10e45f8d3afd254900903733a0ba76ee'
export const SHISEI_SOURCE_URLS = {
  repository: SHISEI_REPOSITORY,
  catalog: `${SHISEI_REPOSITORY}/blob/${SHISEI_REVISION}/data/costumes.json`,
  license: `${SHISEI_REPOSITORY}/blob/${SHISEI_REVISION}/LICENSE-images`,
}

export const COSTUME_SOURCES = [
  { id: 'gia', label: 'ギア · Thực tế', url: 'https://ai-costume-gallery.pages.dev/', notice: 'Tham chiếu trang phục AI của ギア (@giaaibusi).' },
  { id: 'gia-anime', label: 'ギア · Anime', url: 'https://ai-costume-anime-gallery.pages.dev/', notice: 'Chỉ thu thập metadata, ảnh do trang gốc của ギア cung cấp; khi dùng hãy tuân thủ hướng dẫn của trang gốc.' },
  { id: 'charadb', label: 'たき AI · CharaDB', url: 'https://github.com/taki-ttt/charadb/blob/main/LICENSE', notice: 'Chỉ để tham khảo, phải tuân thủ giới hạn của tác giả gốc; hãy đọc điều khoản nguồn.' },
  { id: 'shisei', label: 'Shisei · Trung Quốc các triều đại', url: 'https://github.com/wquguru/shisei', notice: 'Tham chiếu trang phục do AI tạo của wquguru, CC0; ghi rõ nguồn. Không phải phục dựng trang phục lịch sử chuyên nghiệp.' },
] as const

export function costumeSourceId(item: CostumeItem): string {
  return item.source || 'gia'
}

export function selectCostumeView(item: CostumeItem, id = item.selectedView || 'front'): CostumeItem {
  const view = item.views?.find((view) => view.id === id) || item.views?.find((view) => view.id === 'front') || item.views?.[0]
  return view ? { ...item, selectedView: view.id, 缩略图: view.缩略图, 预览图: view.预览图, 原图: view.原图 } : item
}
