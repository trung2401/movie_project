# Movie App

Ứng dụng xem phim gồm:

- **Frontend:** Next.js, React, TypeScript, Tailwind CSS.
- **Backend:** NestJS API, MySQL, TypeORM và JWT.

Frontend lấy dữ liệu phim từ API bên ngoài. Backend quản lý tài khoản, yêu thích, lịch sử xem và đánh giá phim.

## Chiến lược workspace

Frontend và backend là hai ứng dụng độc lập, mỗi ứng dụng giữ `package.json` và `package-lock.json` riêng. `package.json` ở thư mục gốc chỉ chứa các lệnh điều phối chung như chạy đồng thời frontend/backend, không phải npm workspace để quản lý dependency của hai app.

Vì vậy, cài dependency bằng `npm install --prefix movie-app` và `npm install --prefix movie-app-be`; CI nên dùng `npm ci --prefix` tương ứng với từng app. Frontend đã cấu hình `turbopack.root` về thư mục `movie-app` để Next.js không phải tự suy luận root từ lockfile ở thư mục gốc.

## Yêu cầu

- Node.js 20 trở lên và npm 10 trở lên
- Git nếu clone bằng command line
- MySQL đang chạy trên máy

## Clone hoặc tải dự án

Clone từ Git:

```bash
git clone <URL_REPOSITORY>
cd movie-project
```

Hoặc giải nén source vào máy rồi mở terminal tại thư mục `movie-project`.

## Cài đặt

```bash
npm install
npm install --prefix movie-app
npm install --prefix movie-app-be
```

Tạo file môi trường:

```bash
cp movie-app/.env.example movie-app/.env.local
cp movie-app-be/.env.example movie-app-be/.env
```

Trong `movie-app-be/.env`, kiểm tra và cập nhật thông tin MySQL:

```env
PORT=4000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=USERNAME_MYSQL
DB_PASS=PASSWORD_MYSQL
DB_NAME=movie_app
```

Tạo database `movie_app` trước khi chạy migration. Có thể thực hiện trong MySQL:

```sql
CREATE DATABASE movie_app;
```

Giá trị `NEXT_PUBLIC_USER_API_BASE` của frontend phải trỏ đến cùng port backend, mặc định là `http://localhost:4000`.

Chạy migration:

```bash
npm run migration:run --prefix movie-app-be
```

## Chạy dự án

Sau khi cài đặt và cấu hình xong, chạy cả frontend và backend bằng một lệnh tại thư mục gốc:

```bash
npm run dev
```

Truy cập:

- Frontend: http://localhost:3000
- Backend API: http://localhost:4000

Hoặc chạy riêng trong hai terminal:

```bash
npm run dev --prefix movie-app
npm run start:dev --prefix movie-app-be
```

## Lệnh thường dùng

```bash
# Frontend
npm run build --prefix movie-app
npm run start --prefix movie-app
npm run lint --prefix movie-app

# Backend
npm run build --prefix movie-app-be
npm run lint --prefix movie-app-be
npm test --prefix movie-app-be
```

Backend có các nhóm API chính cho đăng ký/đăng nhập, favorites, watch history và ratings. Không commit các file `.env` hoặc secrets thật lên repository.
