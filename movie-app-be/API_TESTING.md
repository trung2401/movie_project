# API Testing Guide

Base URL for the local server:

```text
http://localhost:4000
```

The API does not use an `/api` prefix. For protected routes, send this HTTP header after logging in:

```http
Authorization: Bearer <accessToken>
```

Use a unique email every time the registration flow is tested, for example `api-test-20260817@example.com`. Passwords must have 8 to 72 characters. Movie and episode slugs must contain lowercase letters, numbers, and hyphens only.

## 1. Register

```http
POST /auth/register
Content-Type: application/json
```

```json
{
  "email": "api-test-20260817@example.com",
  "password": "MovieAppTest123"
}
```

Expected status: `201 Created`

```json
{
  "accessToken": "eyJ...",
  "refreshToken": "eyJ...",
  "user": {
    "id": "uuid",
    "email": "api-test-20260817@example.com",
    "role": "user",
    "createdAt": "2026-08-17T00:00:00.000Z"
  }
}
```

Save `accessToken` and `refreshToken` for the next requests. The response must not contain `password`.

Duplicate registration with the same email should return `409 Conflict`.

## 2. Login

```http
POST /auth/login
Content-Type: application/json
```

```json
{
  "email": "api-test-20260817@example.com",
  "password": "MovieAppTest123"
}
```

Expected status: `200 OK`, with `accessToken`, `refreshToken`, and a `user` object. A wrong password should return `401 Unauthorized`.

## 3. Refresh Access Token

```http
POST /auth/refresh
Content-Type: application/json
```

```json
{
  "refreshToken": "<refreshToken from register or login>"
}
```

Expected status: `200 OK`

```json
{
  "accessToken": "eyJ..."
}
```

An expired, malformed, or access token used as a refresh token should return `401 Unauthorized`.

## 4. Confirm Auth Protection

```http
GET /favorites
```

Do not send an `Authorization` header for this request.

Expected status: `401 Unauthorized`. All Favorites and Watch History routes require a valid access token. `POST /ratings` also requires one.

## 5. Create Favorite

```http
POST /favorites
Authorization: Bearer <accessToken>
Content-Type: application/json
```

```json
{
  "movieSlug": "inception",
  "movieName": "Inception"
}
```

Expected status: `201 Created`

```json
{
  "id": "uuid",
  "movieSlug": "inception",
  "movieName": "Inception",
  "addedAt": "2026-08-17T00:00:00.000Z"
}
```

Sending the same `movieSlug` for the same user again should return `409 Conflict`.

## 6. List Favorites

```http
GET /favorites
Authorization: Bearer <accessToken>
```

Expected status: `200 OK`

```json
[
  {
    "id": "uuid",
    "movieSlug": "inception",
    "movieName": "Inception",
    "addedAt": "2026-08-17T00:00:00.000Z"
  }
]
```

The list only includes favorites created by the JWT owner.

## 7. Delete Favorite

```http
DELETE /favorites/inception
Authorization: Bearer <accessToken>
```

Expected status: `204 No Content`, with an empty response body. Repeat `GET /favorites` to verify that `inception` is absent. Deleting it a second time should return `404 Not Found`.

## 8. Create Watch History

```http
POST /watch-history
Authorization: Bearer <accessToken>
Content-Type: application/json
```

```json
{
  "movieSlug": "inception",
  "movieName": "Inception",
  "episodeSlug": "inception-tap-1",
  "progressSeconds": 120
}
```

Expected status: `201 Created`

```json
{
  "id": "uuid",
  "movieSlug": "inception",
  "movieName": "Inception",
  "episodeSlug": "inception-tap-1",
  "progressSeconds": 120,
  "updatedAt": "2026-08-17T00:00:00.000Z"
}
```

## 9. Update Watch History (Upsert)

Send the same route and `episodeSlug`, changing only progress:

```http
POST /watch-history
Authorization: Bearer <accessToken>
Content-Type: application/json
```

```json
{
  "movieSlug": "inception",
  "movieName": "Inception",
  "episodeSlug": "inception-tap-1",
  "progressSeconds": 480
}
```

Expected status: `201 Created`. The response must keep the same `id` as the previous request, return `progressSeconds: 480`, and have a newer `updatedAt` value.

## 10. List Continue Watching

```http
GET /watch-history/continue-watching
Authorization: Bearer <accessToken>
```

Expected status: `200 OK`

```json
[
  {
    "id": "uuid",
    "movieSlug": "inception",
    "episodeSlug": "inception-tap-1",
    "progressSeconds": 480,
    "updatedAt": "2026-08-17T00:00:00.000Z"
  }
]
```

Only records with `progressSeconds > 0` are returned, sorted by most recently updated first.

## 11. Create Rating

```http
POST /ratings
Authorization: Bearer <accessToken>
Content-Type: application/json
```

```json
{
  "movieSlug": "inception",
  "score": 8,
  "comment": "Nhip phim tot va y tuong rat thu vi."
}
```

Expected status: `201 Created`

```json
{
  "id": "uuid",
  "movieSlug": "inception",
  "score": 8,
  "comment": "Nhip phim tot va y tuong rat thu vi.",
  "userId": "uuid",
  "createdAt": "2026-08-17T00:00:00.000Z",
  "updatedAt": "2026-08-17T00:00:00.000Z"
}
```

`score` must be an integer from `1` to `10`. A score of `0`, `11`, or a non-integer should return `400 Bad Request`.

## 12. Update Rating (Upsert)

Use the same user and `movieSlug`:

```http
POST /ratings
Authorization: Bearer <accessToken>
Content-Type: application/json
```

```json
{
  "movieSlug": "inception",
  "score": 9,
  "comment": "Da xem lai va van rat hay."
}
```

Expected status: `201 Created`. The response must keep the existing rating `id`, change `score` to `9`, and update `updatedAt`. It must not create a second rating for the same user and movie.

## 13. List Public Ratings

```http
GET /ratings/inception
```

Expected status: `200 OK`. This route needs no token.

```json
[
  {
    "id": "uuid",
    "movieSlug": "inception",
    "score": 9,
    "comment": "Da xem lai va van rat hay.",
    "userId": "uuid",
    "createdAt": "2026-08-17T00:00:00.000Z",
    "updatedAt": "2026-08-17T00:00:00.000Z"
  }
]
```

No password or other private user data is returned.

## 14. Get Public Rating Average

```http
GET /ratings/inception/average
```

Expected status: `200 OK`

```json
{
  "movieSlug": "inception",
  "averageScore": 9,
  "totalRatings": 1
}
```

For a movie with no ratings, the expected response is:

```json
{
  "movieSlug": "movie-without-ratings",
  "averageScore": null,
  "totalRatings": 0
}
```

## Validation Checks

All request DTOs reject unrecognized properties. For example:

```http
POST /favorites
Authorization: Bearer <accessToken>
Content-Type: application/json
```

```json
{
  "movieSlug": "inception",
  "userId": "another-users-id"
}
```

Expected status: `400 Bad Request`. The API always derives the user from the verified JWT and never accepts a client-supplied `userId`.
