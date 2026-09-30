# Movie App Backend

NestJS API only for Movie App user-owned data. Movie lists, details, and playback URLs remain the frontend's responsibility through its existing public providers. The API stores only `movieSlug` and `episodeSlug` references.

## Setup

```bash
npm install
npm run migration:run
npm run start:dev
```

The local defaults in `.env` use the supplied MySQL connection and run the API on port `4000`:

```dotenv
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=dev
DB_PASS=devpass
DB_NAME=movie_app
PORT=4000
```

Create the `movie_app` database and ensure the configured MySQL user can create tables before running migrations. Replace both JWT secrets before deployment. The server runs at `http://localhost:4000` and allows `http://localhost:3000` as its frontend origin. `PORT` and `FRONTEND_ORIGIN` are required environment variables; the server does not silently fall back when they are missing.

## API

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| POST | `/auth/register` | No | Register and return tokens |
| POST | `/auth/login` | No | Log in and return tokens |
| POST | `/auth/refresh` | No | Exchange a refresh token for an access token |
| POST | `/favorites` | Bearer access token | Add a movie slug to favorites |
| GET | `/favorites` | Bearer access token | List current user's favorites |
| DELETE | `/favorites/:movieSlug` | Bearer access token | Remove a favorite |
| POST | `/watch-history` | Bearer access token | Upsert episode progress |
| GET | `/watch-history/continue-watching` | Bearer access token | List episodes with progress |
| POST | `/ratings` | Bearer access token | Create or update a rating |
| GET | `/ratings/:movieSlug` | No | List public ratings for a movie |
| GET | `/ratings/:movieSlug/average` | No | Get rating aggregate |

Protected routes derive the user from the verified JWT. Clients must not send `userId`.

## Database Changes

`synchronize` is deliberately disabled. The initial migration is checked into `src/database/migrations`; run it with `npm run migration:run`. Generate later migrations after changing entities with `npm run migration:generate`.
