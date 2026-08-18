# Movie App

Ứng dụng xem phim trực tuyến được xây dựng bằng Next.js, React và TypeScript. Dự án hỗ trợ danh sách phim, lọc theo thể loại/quốc gia/năm, xem chi tiết phim, và phát video từ các nguồn phim bên ngoài.

## Mục tiêu dự án

- Hiển thị danh sách phim theo nhiều tiêu chí
- Tìm kiếm phim theo từ khóa
- Xem chi tiết phim và danh sách tập
- Chọn server phát/nguồn video để xem phim
- Giao diện tối giản, dễ sử dụng trên máy tính và thiết bị di động

## Công nghệ sử dụng

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Axios
- ESLint

## Yêu cầu hệ thống

Trước khi chạy dự án, hãy đảm bảo máy tính của bạn đã cài đặt:

- Node.js 20+ (khuyến nghị)
- npm 10+
- Git (nếu clone từ GitHub)

Kiểm tra phiên bản:

```bash
node -v
npm -v
```

## 1. Clone dự án

Nếu bạn clone từ GitHub:

```bash
git clone <URL_REPOSITORY>
cd movie-app
```

Nếu bạn tải file zip về máy:

```bash
unzip movie-app.zip
cd movie-app
```

Nếu thư mục được giải nén có tên khác, hãy vào thư mục chứa dự án trước khi thực hiện các lệnh tiếp theo.

## 2. Cài đặt dependencies

Trong thư mục dự án, chạy:

```bash
npm install
```

Nếu đang dùng Node.js 20+ và npm ổn định, lệnh trên sẽ tự cài đặt toàn bộ package cần thiết cho dự án.

## 3. Chạy dự án ở chế độ development

Sau khi cài đặt xong, chạy:

```bash
npm run dev
```

Mặc định Next.js sẽ chạy trên:

```text
http://localhost:3000
```

Mở trình duyệt và truy cập địa chỉ trên để xem ứng dụng.

Nếu muốn chạy ở hostname khác hoặc cổng khác, bạn có thể dùng:

```bash
npx next dev -H 0.0.0.0 -p 3000
```

## 4. Build ứng dụng cho production

Khi cần build bản production:

```bash
npm run build
```

Sau khi build thành công, chạy phiên bản production:

```bash
npm run start
```

Ứng dụng sẽ chạy trên cổng 3000 như mặc định.

## 5. Kiểm tra lỗi lint

```bash
npm run lint
```

Lệnh này giúp phát hiện các lỗi code và cảnh báo trên dự án.

## 6. Cấu trúc thư mục chính

```text
movie-app/
├── public/                     # tài nguyên tĩnh
├── src/
│   ├── app/                   # routes và layout của Next.js
│   ├── components/            # component chung
│   ├── constants/             # hằng số, endpoint
│   ├── features/              # feature theo module
│   ├── hooks/                 # custom hooks
│   ├── services/              # service, API provider
│   ├── types/                 # types TypeScript
│   └── ...
├── package.json               # scripts và dependencies
├── next.config.ts             # cấu hình Next.js
├── tsconfig.json              # cấu hình TypeScript
├── eslint.config.mjs          # cấu hình lint
├── README.md                  # tài liệu dự án
└── ...
```

## 7. Lưu ý quan trọng

- Dự án sử dụng dữ liệu phim từ các nguồn API bên ngoài, do đó cần có kết nối Internet khi chạy.
- Nếu bạn chạy ở môi trường LAN hoặc máy chủ khác, có thể cần chỉnh lại `allowedDevOrigins` trong file `next.config.ts`.
- Nếu port 3000 đang bị chiếm, hãy đổi cổng hoặc dừng tiến trình đang sử dụng trước đó.

## 8. Các lệnh thường dùng nhanh

```bash
npm install
npm run dev
npm run build
npm run start
npm run lint
```

## 9. Khắc phục sự cố cơ bản

### Lỗi: `command not found: npm`

Cài đặt Node.js và npm trước khi chạy dự án.

### Lỗi: module not found / dependencies chưa được cài đặt

Chạy lại:

```bash
npm install
```

### Lỗi: port 3000 đã được sử dụng

```bash
npx next dev -p 3001
```

### Lỗi khi chạy trên máy khác hoặc LAN

Sửa cấu hình trong `next.config.ts` hoặc chạy với hostname rõ ràng:

```bash
npx next dev -H 0.0.0.0 -p 3000
```

## 10. Giới thiệu ngắn

Dự án này phù hợp nếu bạn muốn xây dựng một website xem phim đơn giản nhưng có cấu trúc rõ ràng, dễ mở rộng theo từng module như danh sách phim, chi tiết phim, tìm kiếm và phát video.

Nếu cần, bạn có thể tiếp tục phát triển dự án bằng cách thêm:

- hệ thống đăng nhập
- lưu lịch sử xem
- tìm kiếm nâng cao
- tối ưu giao diện mobile
- cache dữ liệu và lazy loading
