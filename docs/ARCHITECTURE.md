# PEPTO Architecture Notes

## Domain model (core entities)

- **User** (`customer | vendor | admin`) — base identity/auth record.
- **Vendor** — 1:1 with a User with role `vendor`; holds store info, approval `status`, `commissionRate`, `stripeAccountId`.
- **Category** — tree structure (closure table) for nested product categories.
- **Product** — belongs to a Vendor and optionally a Category.
- **Order** / **OrderItem** — an Order belongs to exactly one Vendor. A single
  customer checkout spanning multiple vendors produces multiple Orders that
  share a `cartId`.
- **Review** — one per (customer, product) pair.

## Request flow: multi-vendor checkout

1. Client sends `POST /orders/checkout` with cart lines (productId + quantity) that may belong to several vendors.
2. `OrdersService.checkout()` opens a single DB transaction:
   - Loads all referenced products, validates stock.
   - Groups lines by `vendorId`.
   - For each vendor group: computes subtotal, platform fee, total; creates an `Order` + `OrderItem`s; decrements product stock.
3. Returns the array of created Orders (one per vendor) to the client.
4. Client creates a Stripe PaymentIntent per order (or a single PaymentIntent split via `transfer_data`, depending on chosen Stripe Connect flow) and confirms payment.
5. Stripe webhook (`POST /payments/webhook`) marks the corresponding Order `paid` and emits an `order.created`-style event for vendor notification.

## Auth & authorization

- Global `JwtAuthGuard` (opt-out via `@Public()`).
- Role checks via `@Roles(UserRole.ADMIN)` + `RolesGuard` on specific endpoints (e.g. vendor approval).
- Ownership checks are done in services (e.g. `ProductsService.update` verifies the requesting user's vendor profile owns the product) rather than guards, since they require a DB lookup tied to the resource.

## Frontend state & navigation

- `go_router` holds top-level routes for each role's shell (`/home`, `/vendor`, `/admin`).
- A `redirect` callback (to be completed) reads `authControllerProvider`'s current `AuthUser.role` and prevents cross-role access.
- Each feature's Riverpod providers wire `domain` use cases to `data` repository implementations, keeping `presentation` widgets free of Dio/HTTP details.

## Suggested next additions

- `docs/API.md` — generated/maintained alongside the Swagger spec at `/docs`.
- Admin analytics endpoints (GMV, top vendors) once reporting requirements are defined.
- Rate-limit tuning per route (checkout vs. read-heavy product listing) beyond the global `ThrottlerModule` default.
