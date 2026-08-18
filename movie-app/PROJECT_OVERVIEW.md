# Tài liệu mô tả chức năng và cấu trúc dự án Movie App

## 1. Tổng quan dự án

Dự án là một ứng dụng xem phim trực tuyến được xây dựng trên Next.js, React và TypeScript. Mục tiêu chính là cung cấp trải nghiệm xem danh sách phim, lọc theo tiêu chí, xem thông tin chi tiết phim, chọn server phát và phát video từ các nguồn phim bên ngoài.

Hiện tại, ứng dụng có cấu trúc mô-đun rõ ràng, phù hợp để mở rộng theo từng tính năng: danh sách phim, chi tiết phim, player, API provider, UI components và logic lọc.

---

## 2. Mục tiêu chức năng hiện tại

### 2.1. Trang danh sách phim
- Hiển thị phim mới cập nhật theo trang
- Hỗ trợ tìm kiếm theo từ khóa
- Hỗ trợ lọc theo:
  - loại phim
  - quốc gia
  - thể loại
  - năm phát hành
- Hiển thị tổng hợp bộ lọc đang áp dụng
- Phân trang dữ liệu phim

### 2.2. Trang chi tiết phim
- Hiển thị thông tin phim: tên, tên gốc, năm, mô tả, ảnh bìa
- Hiển thị danh sách tập và server phát
- Cho phép chọn server phát khác nhau
- Cho phép chuyển tập phim trong cùng server

### 2.3. Trình phát video
- Tích hợp iframe / embed link để phát video
- Hiển thị tên phim và tập đang phát
- Hỗ trợ lựa chọn server khác nhau nếu cùng một phim có nhiều nguồn phát

### 2.4. Xử lý dữ liệu và dự phòng
- Tách logic API từ UI
- Có cơ chế fallback giữa các provider nếu provider chính không hoạt động
- Nếu không có dữ liệu đúng định dạng, ứng dụng dùng dữ liệu dự phòng cho trạng thái không có video hợp lệ

---

## 3. Các chức năng chính đang có trong app

### 3.1. Quản lý danh sách phim
- UI tập trung vào `MovieListClient`
- Dùng custom hook `useMovieList` để quản lý:
  - dữ liệu phim
  - trạng thái loading
  - lỗi
  - bộ lọc đang chọn
  - từ khóa tìm kiếm
  - trang hiện tại

### 3.2. Tìm kiếm và lọc
- `buildMoviesEndpoint()` xây dựng URL API dựa trên điều kiện lọc và từ khóa
- Có thể cấu hình endpoint theo:
  - phim mới nhất
  - tìm kiếm
  - theo thể loại
  - theo quốc gia
  - theo năm
  - theo loại phim

### 3.3. Chi tiết phim và tập phim
- `MovieWatchClient` nhận dữ liệu phim và danh sách tập fallback
- Tính năng chính:
  - chọn server
  - chọn tập
  - đổi tập khi đang phát
  - hiển thị mô tả phim

### 3.4. Quản lý provider phim
- Có mô hình `MovieProvider` giúp truy cập dữ liệu từ nhiều nguồn API
- `movieProviderManager` quản lý provider và có logic fallback
- Mỗi provider cần triển khai:
  - `getMovieList(endpoint)`
  - `getMovieDetail(slug)`

---

## 4. Cấu trúc thư mục dự án

```text
movie-app/
├── public/                     # Tài nguyên tĩnh
├── src/
│   ├── api/
│   │   └── mockData.ts         # Dữ liệu dự phòng/mock cho route xem phim
│   ├── app/
│   │   ├── globals.css         # CSS toàn cục, biến màu, reset
│   │   ├── layout.tsx          # Layout gốc của Next.js
│   │   ├── page.tsx            # Trang chủ
│   │   └── xem-phim/
│   │       └── [slug]/
│   │           └── page.tsx    # Trang chi tiết và phát phim theo slug
│   ├── assets/                 # Tài nguyên hình ảnh / asset riêng
│   ├── components/
│   │   ├── layout/
│   │   │   ├── FloatingParticles.tsx
│   │   │   └── SiteHeader.tsx
│   │   └── ui/
│   │       ├── EmptyState.tsx
│   │       ├── ErrorState.tsx
│   │       └── LoadingState.tsx
│   ├── constants/
│   │   └── movie.ts            # Hằng số endpoint và cấu hình chung
│   ├── features/
│   │   ├── movie-detail/
│   │   │   └── components/
│   │   │       ├── EpisodeList.tsx
│   │   │       ├── MovieWatchClient.tsx
│   │   │       └── ServerSelector.tsx
│   │   ├── movie-list/
│   │   │   ├── components/
│   │   │   │   ├── FilterSummary.tsx
│   │   │   │   ├── MovieCard.tsx
│   │   │   │   ├── MovieGrid.tsx
│   │   │   │   ├── MovieListClient.tsx
│   │   │   │   └── Pagination.tsx
│   │   │   └── hooks/
│   │   │       └── useMovieList.ts
│   │   └── player/
│   │       └── components/
│   │           └── VideoPlayer.tsx
│   ├── hooks/                  # Hook dùng chung nếu cần mở rộng
│   ├── lib/
│   │   └── cn.ts               # Helper tiện ích className merge
│   ├── services/
│   │   ├── movieApi.ts         # API facade cho app
│   │   └── providers/
│   │       ├── index.ts        # Provider manager + fallback
│   │       ├── ophim.provider.ts
│   │       ├── phimapi.provider.ts
│   │       └── types.ts
│   └── types/
│       └── movie.ts            # Interface và type dữ liệu phim
├── package.json                # Scripts và dependency
├── next.config.ts              # Cấu hình Next.js
├── tsconfig.json               # Cấu hình TypeScript
├── eslint.config.mjs           # Cấu hình lint
├── README.md                   # Hướng dẫn chạy dự án
├── PROJECT_OVERVIEW.md         # Tài liệu phân tích dự án
└── ...
```

---

## 5. Mô hình kiến trúc hiện tại

### 5.1. App Router của Next.js
Dự án đang dùng App Router của Next.js với các route chính:
- `/` : trang chủ, hiển thị danh sách phim
- `/xem-phim/[slug]` : trang xem phim theo slug

### 5.2. Tách module theo feature
Mỗi tính năng có không gian riêng trong `src/features/`:
- `movie-list` : UI, filter, pagination, hook danh sách phim
- `movie-detail` : UI chi tiết phim, server, tập phim
- `player` : thành phần phát video

Điều này giúp dễ dàng mở rộng mà không làm sài logic giữa các module.

### 5.3. Service layer và provider layer
- `src/services/movieApi.ts` đóng vai trò luồng dữ liệu chính của ứng dụng
- `src/services/providers/` quản lý kết nối dữ liệu từ các nguồn bên ngoài
- Mỗi provider có thể bổ sung hoặc thay thế mà không làm ảnh hưởng trực tiếp đến UI

### 5.4. Type layer
- File `src/types/movie.ts` chứa interface cho:
  - `Movie`
  - `Episode`
  - `EpisodeServer`
  - `MovieFilters`
  - `MovieListResult`

Điều này giúp giảm lỗi type khi mở rộng chức năng.

---

## 6. Luồng dữ liệu chính

### 6.1. Luồng danh sách phim
1. Người dùng mở trang chủ
2. `HomePage` render `MovieListClient`
3. `useMovieList` đọc filter, keyword và page hiện tại
4. `buildMoviesEndpoint()` tạo URL phù hợp
5. `getMovieList()` gọi provider manager
6. Dữ liệu được trả về và render thành `MovieGrid`

### 6.2. Luồng xem phim
1. Người dùng click vào phim
2. URL truy cập theo slug, ví dụ `/xem-phim/slug-phim`
3. `WatchPage` gọi `getMovieDetail(slug)`
4. Nếu provider lỗi, ứng dụng dùng dữ liệu mock fallback
5. `MovieWatchClient` render video player và danh sách server/tập

---

## 7. Điểm mạnh của kiến trúc hiện tại

- Tách rõ UI và logic nghiệp vụ
- Có module feature riêng cho từng phần
- Có abstraction cho provider API
- Dễ bổ sung provider mới hoặc thay đổi nguồn dữ liệu
- Next.js App Router giúp routing rõ ràng
- TypeScript hỗ trợ phát triển và giảm lỗi runtime

---

## 8. Các điểm cần mở rộng trong tương lai

### 8.1. Quản lý người dùng
- Đăng nhập / đăng ký
- Lưu profile người dùng
- Theo dõi lịch sử xem
- Yêu thích / phim đã lưu

### 8.2. Tăng tốc và tối ưu hiệu năng
- Cache API theo thời gian
- Sử dụng React Query / SWR cho dữ liệu server
- Lazy load hình ảnh
- Skeleton loading tốt hơn

### 8.3. Cải thiện tìm kiếm và lọc
- Tìm kiếm theo nhiều tiêu chí
- Gợi ý phim liên quan
- Bộ lọc nâng cao theo độ phân giải, ngôn ngữ, trạng thái

### 8.4. Quản trị nội dung
- Dashboard admin cho quản lý phim, server, danh mục
- Cập nhật metadata từ nhiều nguồn dữ liệu
- Quản lý whitelist/blacklist provider

### 8.5. Nâng cấp trải nghiệm phát video
- Playback history
- Đa server ưu tiên
- Hỗ trợ subtitles, quality selection, resume watching
- Tối ưu trên mobile và tablet

---

## 9. Kế hoạch mở rộng đề xuất

### Giai đoạn 1: ổn định nền tảng
- Tạo lại cấu trúc service rõ hơn: `api/`, `domain/`, `features/`
- Thêm test cơ bản cho provider và mapper dữ liệu
- Cải thiện error handling và fallback UX

### Giai đoạn 2: mở rộng user experience
- Thêm lịch sử xem
- Thêm wishlist và đánh dấu phim yêu thích
- Tối ưu giao diện trên mobile

### Giai đoạn 3: mở rộng dữ liệu và quản trị
- Hỗ trợ nhiều provider cùng lúc
- Tạo admin dashboard
- Thêm cache và monitoring API

### Giai đoạn 4: nâng cấp sản phẩm
- Hệ thống recommendation
- Tăng tốc độ tải trang
- Hỗ trợ nhiều ngôn ngữ và theme

---

## 10. Kết luận

Dự án hiện tại đã có nền tảng đủ mạnh để phát triển thành một ứng dụng xem phim tương đối hoàn chỉnh, với cấu trúc module rõ ràng và khả năng mở rộng cao. Nếu tiếp tục phát triển theo hướng API-driven, modular feature, và tích hợp thêm trải nghiệm người dùng, dự án có thể phát triển thành một sản phẩm có khả năng vận hành lâu dài và dễ bảo trì.

---

## 11. Gợi ý lưu ý khi mở rộng

- Luôn giữ logic gọi API ở service layer, không lẫn trực tiếp vào component
- Dùng `types/movie.ts` làm nguồn dữ liệu type thống nhất cho toàn app
- Cần chuẩn hóa dữ liệu từ nhiều provider để tránh lệch định dạng
- Hãy bổ sung provider mới dưới dạng module riêng thay vì sửa trực tiếp logic hiện có
- Nên tách tiến độ phát triển theo từng feature để dễ kiểm soát và test
