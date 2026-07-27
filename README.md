# PEPTO — Multi-Vendor Marketplace

PEPTO is a full-stack multi-vendor e-commerce platform: a **NestJS + PostgreSQL** API and a **Flutter** mobile app, supporting three roles — **Customer**, **Vendor**, and **Admin**.

## Monorepo layout

```
PEPTO/
├── backend/          NestJS API (TypeScript, TypeORM, PostgreSQL, Redis)
├── frontend/          Flutter app (Riverpod, go_router, clean architecture)
├── docs/              Architecture & API notes
├── docker-compose.yml Postgres + Redis + API for local dev
└── README.md
```

## Architecture

- **Multi-vendor checkout**: a customer's cart can span several vendors. `OrdersService.checkout()` splits it into one `Order` per vendor (sharing a `cartId`), inside a single DB transaction, so stock decrements and vendor fulfillment stay independent per seller.
- **Payments**: Stripe Connect (destination charges). Each vendor onboards a connected account; PEPTO takes a configurable `platformFeePercent` via `application_fee_amount`, and the rest routes directly to the vendor.
- **Auth**: JWT access + refresh tokens. The `JwtAuthGuard` is registered globally in `AppModule`; routes opt out with `@Public()`. Role-gating uses `@Roles()` + `RolesGuard`.
- **File uploads**: the API issues pre-signed S3 PUT URLs (`/uploads/presign`) so the Flutter app uploads images directly to S3, never proxying binary data through the API.
- **Frontend**: feature-first clean architecture (`data/domain/presentation` per feature), Riverpod for state, `go_router` for navigation with role-based redirects (customer/vendor/admin shells).

See `docs/ARCHITECTURE.md` for the full data model and request flow diagrams (fill in as the project grows).

## Backend — NestJS API

### Modules
`auth` · `users` · `vendors` · `products` (+ categories) · `orders` (+ order-items) · `payments` (Stripe) · `reviews` · `notifications` (event-driven) · `uploads` (S3 presign)

### Key dependencies
`@nestjs/*`, `typeorm` + `pg`, `passport-jwt`, `bcrypt`, `stripe`, `@aws-sdk/client-s3`, `bull` + `ioredis` (queues), `class-validator`, `@nestjs/swagger`, `helmet`, `joi` (env validation).

### Setup

```bash
cd backend
cp .env.example .env        # fill in DB/JWT/Stripe/AWS secrets
npm install
npm run start:dev           # http://localhost:3000/api/v1
# Swagger docs (non-prod): http://localhost:3000/docs
```

### Database

```bash
# with docker-compose (postgres + redis) running from repo root:
docker compose up -d postgres redis

npm run migration:generate -- src/database/migrations/Init
npm run migration:run
npm run seed                 # creates admin@pepto.app / ChangeMe123!
```

### Tests

```bash
npm run test        # unit
npm run test:e2e    # end-to-end (requires a running DB)
```

## Frontend — Flutter app

### Key dependencies
`flutter_riverpod`, `go_router`, `dio`, `flutter_secure_storage`, `flutter_stripe`, `firebase_messaging`, `cached_network_image`, `freezed`/`json_serializable` (codegen), `dartz` (functional `Either` for error handling).

### Setup

```bash
cd frontend
flutter pub get
flutter pub run build_runner build --delete-conflicting-outputs   # generates *.g.dart / *.freezed.dart

flutter run \
  --dart-define=API_BASE_URL=http://localhost:3000/api/v1 \
  --dart-define=STRIPE_PUBLISHABLE_KEY=pk_test_xxx
```

### Structure
Each feature (`auth`, `customer/*`, `vendor/*`, `admin/*`) follows:
```
feature/
├── data/           # models (JSON <-> entity), repository implementations (Dio calls)
├── domain/         # entities, repository interfaces, use cases — no Flutter/Dio imports
└── presentation/   # screens, widgets, Riverpod providers/controllers
```
`core/` holds cross-cutting concerns: `network/` (Dio client + auth interceptor with token refresh), `router/` (go_router config), `theme/`, `config/env.dart`.

## Running everything together

```bash
# 1. Infra + API
docker compose up -d

# 2. Migrations & seed (first run only)
cd backend && npm run migration:run && npm run seed

# 3. Flutter app
cd ../frontend && flutter run --dart-define=API_BASE_URL=http://localhost:3000/api/v1
```

## Production notes / next steps

- Generate real TypeORM migrations before deploying (`synchronize` is off by default outside dev).
- Wire `NotificationsService` events through the existing `BullModule` queue instead of inline handling.
- Complete the Stripe webhook handler (`PaymentsController.handleWebhook`) to transition `Order.status` on `payment_intent.succeeded` / `charge.refunded`, and configure a raw-body parser for that route.
- Add refresh-token rotation storage (e.g. a `refresh_tokens` table) if you need server-side revocation.
- Flutter: generate `firebase_options.dart` via FlutterFire CLI before enabling `firebase_messaging`, and swap `--dart-define` flags for a proper CI secret-injection step per environment (dev/staging/prod).
