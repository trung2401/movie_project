---
trigger: manual
---

# Rules Xây Dựng Backend NestJS cho Movie App

Mục tiêu: **Không đụng vào business logic & API call phim hiện có ở FE** — BE chỉ phụ trách dữ liệu riêng của người dùng (đăng nhập, yêu thích, lịch sử xem, đánh giá). FE tiếp tục gọi thẳng provider phim (phimapi/ophim) như hiện tại.

---

## 1. Tech Stack

| # | Công nghệ | Ghi chú |
|---|---|---|
| 1 | NestJS (v10.x) | Kiến trúc module hoá theo feature |
| 2 | TypeORM | ORM chính, migration-based (không dùng synchronize khi lên production) |
| 3 | MySQL (v8.x) | Database chính |
| 4 | Passport + JWT | `@nestjs/jwt`, `@nestjs/passport`, access token + refresh token |
| 5 | bcrypt | Hash password |
| 6 | class-validator + class-transformer | Validate DTO đầu vào |

> **Không đổi**: nguồn dữ liệu phim vẫn là các provider public hiện tại của FE. BE không gọi lại provider để lấy danh sách/chi tiết phim ở giai đoạn 1–2 — chỉ lưu tham chiếu (`movieSlug`) tới phim đó.

---

## 2. Nguyên tắc phát triển (đọc trước khi code)

1. **Auth làm trước tiên** — mọi module khác (favorites, watch-history, ratings) đều phụ thuộc vào user đã đăng nhập, không làm module nào trước khi `auth` hoàn chỉnh.
2. **Không lưu dữ liệu phim đầy đủ trong DB** — chỉ lưu `movieSlug` làm khóa tham chiếu, tránh trùng lặp dữ liệu với provider ngoài và tránh lệch dữ liệu khi provider cập nhật.
3. **Entity trước, migration sau** — viết entity xong, generate migration, không dùng `synchronize: true` một khi đã có dữ liệu thật trong DB.
4. **Mỗi module một trách nhiệm rõ ràng** — controller mỏng, business logic nằm ở service, không xử lý logic trong entity.
5. Build lại từng module một (Auth → Favorites → Watch History → Ratings), test xong module nào chốt module đó, không code song song nhiều module để tránh vỡ luồng auth giữa chừng.

---

## 3. Cấu trúc thư mục (feature-based)

```
movie-app-be/
├── src/
│   ├── auth/
│   │   ├── auth.module.ts
│   │   ├── auth.service.ts
│   │   ├── auth.controller.ts
│   │   ├── dto/                        # RegisterDto, LoginDto
│   │   ├── strategies/                 # jwt.strategy.ts, jwt-refresh.strategy.ts
│   │   └── guards/                     # jwt-auth.guard.ts
│   │
│   ├── users/
│   │   ├── entities/user.entity.ts
│   │   ├── users.module.ts
│   │   ├── users.service.ts
│   │   └── users.controller.ts
│   │
│   ├── favorites/
│   │   ├── entities/favorite.entity.ts
│   │   ├── dto/                        # CreateFavoriteDto
│   │   ├── favorites.module.ts
│   │   ├── favorites.service.ts
│   │   └── favorites.controller.ts
│   │
│   ├── watch-history/
│   │   ├── entities/watch-history.entity.ts
│   │   ├── dto/                        # UpsertWatchHistoryDto
│   │   ├── watch-history.module.ts
│   │   ├── watch-history.service.ts
│   │   └── watch-history.controller.ts
│   │
│   ├── ratings/
│   │   ├── entities/rating.entity.ts
│   │   ├── dto/                        # CreateRatingDto, UpdateRatingDto
│   │   ├── ratings.module.ts
│   │   ├── ratings.service.ts
│   │   └── ratings.controller.ts
│   │
│   ├── movies-proxy/                   # optional, giai đoạn sau (cache provider bằng Redis)
│   ├── admin/                          # optional, giai đoạn sau (quản lý whitelist provider)
│   │
│   ├── common/                         # guard/interceptor/filter/decorator dùng chung
│   │   ├── decorators/current-user.decorator.ts
│   │   └── filters/http-exception.filter.ts
│   │
│   ├── config/                         # typeorm.config.ts, env validation
│   ├── database/
│   │   └── migrations/
│   └── app.module.ts
│
├── .env                                 # DB_HOST, DB_PORT, DB_USER, DB_PASS, DB_NAME, JWT_SECRET, JWT_REFRESH_SECRET
├── package.json
├── tsconfig.json
└── nest-cli.json
```

**Quy tắc đặt DTO vs Entity:**
- `entity/` là shape lưu trong DB (TypeORM decorator).
- `dto/` là shape nhận từ request/trả về response, luôn validate bằng `class-validator`, không expose trực tiếp entity ra ngoài API (đặc biệt là field `password`).

---

## 4. Thiết kế 4 bảng dữ liệu

### 4.1. `users`
```ts
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string; // hash bcrypt, select: false để không lộ ra query mặc định

  @Column({ default: 'user' })
  role: 'user' | 'admin';

  @OneToMany(() => Favorite, (f) => f.user)
  favorites: Favorite[];

  @OneToMany(() => WatchHistory, (w) => w.user)
  watchHistory: WatchHistory[];

  @OneToMany(() => Rating, (r) => r.user)
  ratings: Rating[];

  @CreateDateColumn()
  createdAt: Date;
}
```

### 4.2. `favorites`
```ts
@Entity('favorites')
@Unique(['user', 'movieSlug'])
export class Favorite {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (u) => u.favorites, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  movieSlug: string;

  @CreateDateColumn()
  addedAt: Date;
}
```

### 4.3. `watch_history`
```ts
@Entity('watch_history')
@Unique(['user', 'episodeSlug'])
export class WatchHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  movieSlug: string;

  @Column()
  episodeSlug: string;

  @Column({ type: 'int', default: 0 })
  progressSeconds: number;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### 4.4. `ratings` (bảng mới)
```ts
@Entity('ratings')
@Unique(['user', 'movieSlug']) // mỗi user chỉ đánh giá 1 lần / phim, sửa thì update
export class Rating {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (u) => u.ratings, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  movieSlug: string;

  @Column({ type: 'tinyint' })
  score: number; // ràng buộc 1-10 hoặc 1-5, validate ở DTO bằng @Min/@Max

  @Column({ type: 'text', nullable: true })
  comment: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

**DTO validate cho rating:**
```ts
export class CreateRatingDto {
  @IsString()
  movieSlug: string;

  @IsInt()
  @Min(1)
  @Max(10)
  score: number;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  comment?: string;
}
```

---

## 5. Migrate API endpoint (theo module)

| Module | Endpoint | Ghi chú |
|---|---|---|
| Auth | `POST /auth/register` | hash password, tạo user |
| Auth | `POST /auth/login` | trả accessToken + refreshToken |
| Auth | `POST /auth/refresh` | cấp lại accessToken |
| Favorites | `POST /favorites` | body `{ movieSlug }`, cần JWT |
| Favorites | `DELETE /favorites/:movieSlug` | cần JWT |
| Favorites | `GET /favorites` | danh sách của user hiện tại |
| Watch History | `POST /watch-history` | upsert theo `user + episodeSlug` |
| Watch History | `GET /watch-history/continue-watching` | danh sách đang xem dở |
| Ratings | `POST /ratings` | tạo hoặc update nếu đã tồn tại (upsert theo `user + movieSlug`) |
| Ratings | `GET /ratings/:movieSlug` | danh sách đánh giá công khai của 1 phim (không cần JWT) |
| Ratings | `GET /ratings/:movieSlug/average` | điểm trung bình, có thể cache |

Tất cả endpoint trừ `GET /ratings/:movieSlug` và `GET /ratings/:movieSlug/average` đều bọc trong `JwtAuthGuard`, lấy `userId` từ token qua `@CurrentUser()` decorator — không tin tưởng `userId` client tự truyền lên.

---

## 6. Tối ưu & ràng buộc dữ liệu

- Toàn bộ 4 bảng dùng `uuid` làm khóa chính, tránh lộ số lượng record qua id tăng dần.
- `ON DELETE CASCADE` ở mọi foreign key trỏ về `users` — xóa tài khoản thì dọn sạch favorites/watch-history/ratings liên quan.
- `@Unique` composite trên `(user, movieSlug)` hoặc `(user, episodeSlug)` để chặn trùng lặp ở tầng DB, không chỉ ở tầng service.
- Index thêm cho `movieSlug` ở cả 3 bảng con (`favorites`, `watch_history`, `ratings`) vì đây là điều kiện query phổ biến nhất (lấy toàn bộ đánh giá/lịch sử của 1 phim).
- Điểm trung bình rating (`average score`) nên tính bằng query aggregate (`AVG(score)`), không lưu cột tổng hợp trừ khi lượng truy vấn lớn tới mức cần cache.

---

## 7. Checklist khi migrate xong 1 module

- [ ] Entity + migration đã generate, không còn `synchronize: true`
- [ ] DTO validate đầy đủ (`class-validator`), không expose entity thô ra response
- [ ] Route cần đăng nhập đã bọc `JwtAuthGuard`, lấy `userId` từ token
- [ ] Ràng buộc `@Unique` composite đã có ở DB, không chỉ check ở service
- [ ] Unit test service (mock repository) + e2e test endpoint chính (Supertest)
- [ ] Không còn `any`, pass ESLint không warning