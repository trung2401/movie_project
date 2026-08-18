---     
trigger: manual
---

# Rules Nâng Cấp Dự Án Web Xem Phim → Next.js 16

Mục tiêu: **Giữ nguyên business logic & API call hiện có**, chỉ nâng cấp công nghệ nền tảng + xây lại UI/UX + tổ chức lại code theo feature-based, tối ưu hiệu năng, dễ mở rộng bảo trì.

---

## 1. Tech Stack sau nâng cấp

| # | Công nghệ | Ghi chú |
|---|---|---|
| 1 | Next.js (v16.x) | Chuyển sang App Router (nếu dự án cũ dùng React thuần/CRA/Pages Router) |
| 2 | React (v19.x) | |
| 3 | TypeScript (v5.x) | Nếu dự án cũ là JS thuần → migrate dần sang TS (xem mục 3) |
| 4 | Tailwind CSS (v4.x) | Thay toàn bộ CSS module/SCSS/inline style cũ |
| 5 | Lucide React | Thay icon cũ (font-icon, svg rời rạc...) |
| 6 | clsx + tailwind-merge | Chuẩn hoá cách build className động |
| 7 | ESLint (v9.x) | |

> **Không đổi**: nguồn API phim (free API đang dùng), cấu trúc dữ liệu trả về, các endpoint/tham số gọi API, logic xử lý nghiệp vụ (lọc thể loại, phân trang, tìm kiếm, player logic...).

---

## 2. Nguyên tắc migrate (bắt buộc đọc trước khi code)

1. **Không viết lại logic gọi API** — chỉ di chuyển code cũ vào `services/` và bọc lại theo pattern mới (typed function), giữ nguyên tham số & endpoint.
2. **Tách UI ra khỏi logic** trước khi build lại giao diện — nếu component cũ đang trộn lẫn fetch + state + render trong 1 file, tách thành: `hook` (logic) + `component` (UI thuần).
3. Build lại UI **từng feature một** (VD: xong Trang chủ → Chi tiết phim → Trang xem phim → Tìm kiếm), không đập hết 1 lần để tránh vỡ toàn bộ site giữa chừng.
4. Mỗi feature cũ → đối chiếu lại đúng hành vi (loading, error, empty state, phân trang) trước khi coi là "xong", vì bản cũ có thể thiếu các state này.

---

## 3. Cấu trúc thư mục (feature-based)

```
src/
├── app/
│   ├── (site)/
│   │   ├── page.tsx                     # Trang chủ
│   │   ├── phim/[slug]/page.tsx         # Chi tiết phim
│   │   ├── xem-phim/[slug]/page.tsx     # Trang player
│   │   ├── the-loai/[slug]/page.tsx     # Danh sách theo thể loại
│   │   ├── tim-kiem/page.tsx            # Tìm kiếm
│   │   └── layout.tsx
│   └── layout.tsx                        # Root layout (Header, Footer, Providers)
│
├── features/                              # Chia theo tính năng, KHÔNG theo loại file
│   ├── movie-list/
│   │   ├── components/                    # MovieGrid, MovieCard, FilterBar...
│   │   ├── hooks/                         # useMovieList, useMovieFilter
│   │   └── types.ts
│   ├── movie-detail/
│   │   ├── components/                    # MovieInfo, EpisodeList, RelatedMovies...
│   │   ├── hooks/                         # useMovieDetail
│   │   └── types.ts
│   ├── player/
│   │   ├── components/                    # VideoPlayer, ServerSelect, EpisodeNav...
│   │   ├── hooks/                         # usePlayerState
│   │   └── types.ts
│   └── search/
│       ├── components/
│       ├── hooks/
│       └── types.ts
│
├── components/
│   ├── ui/                                # Component thuần tái sử dụng toàn app: Button, Skeleton, Badge, Pagination...
│   └── layout/                            # Header, Footer, Sidebar, MobileNav
│
├── services/                               # Gọi API phim — GIỮ NGUYÊN logic cũ, chỉ định lại type
│   └── movieApi.ts
│
├── lib/                                     # cn(), formatDate, slugify, constants...
├── types/                                    # Movie, Episode, Category... (type dùng chung nhiều feature)
├── hooks/                                     # Hook dùng chung toàn app: useDebounce, useInfiniteScroll...
└── constants/                                  # Route path, config phân trang, danh sách server...
```

**Quy tắc đặt trong `features/` vs `components/ui/`:**
- Component chỉ dùng cho 1 tính năng (VD: `EpisodeList` chỉ dùng ở trang chi tiết phim) → nằm trong `features/[feature]/components`.
- Component dùng ở ≥ 2 feature (VD: `Button`, `MovieCardSkeleton`, `Rating`) → đưa lên `components/ui`.

---

## 4. Migrate business logic & API (mục 2.1 chi tiết)

```ts
// services/movieApi.ts
// Giữ nguyên endpoint, tham số, response shape của API cũ — chỉ thêm type

export interface Movie {
  slug: string;
  name: string;
  thumbUrl: string;
  year: number;
  // ...map đúng field trả về từ API cũ
}

export async function getMovieList(page: number): Promise<Movie[]> {
  const res = await fetch(`${API_BASE}/danh-sach/phim-moi?page=${page}`); // endpoint giữ nguyên
  const data = await res.json();
  return data.items; // giữ nguyên path lấy data như code cũ
}
```

- Nếu bản cũ gọi API trực tiếp trong component (`useEffect` + `fetch`) → chuyển thành:
  - Server Component: gọi thẳng trong component (`async function Page()`), **không cần `useEffect`** nữa.
  - Hoặc nếu cần tương tác client (search, filter theo action người dùng) → giữ Client Component nhưng đưa fetch vào custom hook riêng.

---

## 5. UI/UX — xây mới, giữ luồng nghiệp vụ cũ

- Thiết kế theo hướng **dark theme** (chuẩn UX web xem phim), tương phản tốt, poster là trọng tâm thị giác.
- Component cần có trong bản mới (thường bản cũ thiếu):
  - Skeleton loading cho `MovieGrid`, `MovieDetail` (tránh layout shift khi fetch).
  - Empty state khi tìm kiếm không có kết quả.
  - Error state khi API lỗi/free API die (rất hay xảy ra với API free).
  - Responsive đầy đủ: mobile (poster 2-3 cột), tablet, desktop.
- Player: giữ nguyên logic chọn server/tập, chỉ làm lại UI chọn tập dạng grid/list đẹp hơn, sticky player trên mobile khi scroll xuống danh sách tập.
- Dùng `next/image` cho toàn bộ poster/thumbnail (ảnh từ domain ngoài → khai báo `images.remotePatterns` trong `next.config.js`).

---

## 6. Clean Code & Tái sử dụng

- 1 component = 1 nhiệm vụ UI rõ ràng, không quá 150 dòng.
- Class Tailwind lặp lại nhiều → gộp qua `cn()` (`clsx` + `tailwind-merge`) hoặc tách thành component (VD: `<MovieCard variant="compact" />` thay vì copy class).
- Không hard-code text/label rời rạc — gom vào `constants/` nếu dùng nhiều nơi (tên thể loại, label trạng thái phim...).
- Custom hook cho logic lặp lại: `useInfiniteScroll` (load thêm phim khi cuộn), `useDebounce` (ô tìm kiếm), `useMovieFilter`.

---

## 7. Tối ưu hiệu năng

- **Server Component mặc định** cho trang danh sách/chi tiết phim (SEO tốt hơn hẳn bản CSR cũ) — chỉ `"use client"` ở phần tương tác (player, filter, search box, infinite scroll).
- `next/image` bắt buộc cho poster — set đúng `sizes` để tránh tải ảnh to hơn cần thiết trên mobile.
- `next/dynamic` cho `VideoPlayer` (thường nặng do embed iframe/hls.js) — không cần SSR.
- Cache API phim bằng Next.js fetch cache (`next: { revalidate: 3600 }`) cho danh sách ít thay đổi (thể loại, phim đề cử) — giảm gọi lại API free liên tục (API free hay bị rate-limit).
- Infinite scroll / phân trang thay vì load hết danh sách 1 lần.
- Lazy-load các section không nằm trong viewport đầu (phim liên quan, bình luận nếu có).

---

## 8. Checklist khi migrate xong 1 feature

- [ ] Business logic & tham số API giữ nguyên 100% so với bản cũ
- [ ] Có đủ loading / error / empty state
- [ ] UI responsive mobile/tablet/desktop
- [ ] Component đã tách đúng `features/` vs `components/ui`
- [ ] Ảnh dùng `next/image`, phần nặng dùng `next/dynamic`
- [ ] Không còn `any`, không còn code chết (dead code) từ bản cũ
- [ ] Pass ESLint không warning