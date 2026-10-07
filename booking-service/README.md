# Booking Service

The Booking Service is an Express and TypeScript API for creating and confirming hotel bookings. It stores bookings and idempotency keys in MySQL through Prisma, and uses Redis with Redlock to coordinate requests that target the same hotel.

## What it does

- Accepts booking details: user ID, hotel ID, guest count, and booking amount.
- Creates a booking in the `PENDING` state and associates a generated idempotency key.
- Confirms a booking using its idempotency key, marking both the booking and key as confirmed/finalized in a database transaction.
- Exposes ping and health-check routes for basic service checks.

Hotel and user records belong to other services; this service stores their IDs and does not look those records up itself.

## Technology

- Node.js, Express 5, and TypeScript
- Prisma 7 with the MariaDB adapter and a MySQL-compatible database
- Redis and Redlock for booking resource locks
- Zod for request validation
- Winston for application logging

## Requirements

- Node.js and npm
- A MySQL-compatible database
- Redis

## Run locally

From this directory:

```bash
npm install
npm run dev
```

The server listens on port `3001` by default. Set `PORT` in `.env` to choose another port. `npm start` starts the service with `ts-node`; `npm run dev` starts it with `nodemon`.

Create a `.env` file in this service directory. The server reads the following settings:

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | `3001` | HTTP port |
| `REDIS_SERVER_URL` | `redis://localhost:6379` | Redis connection URL used by Redlock |
| `REDLOCK_TTL` | `5000` | Lock lifetime in milliseconds |
| `DATABASE_URL` | No default | Prisma CLI connection string used by the migration configuration |

Example local values (use credentials appropriate for your machine):

```dotenv
PORT=3002
REDIS_SERVER_URL=redis://localhost:6379
REDLOCK_TTL=5000
DATABASE_URL=mysql://root:password@localhost:3306/airbnb_booking_dev
```

The database named by `DATABASE_URL` must exist before migrations are run. Apply migrations with:

```bash
npx prisma migrate dev --config src/prisma7.config.ts
```

**Runtime database configuration:** the current Prisma client in `src/prisma/client.ts` constructs its adapter with `localhost`, user `root`, and database `airbnb_booking_dev`; it does not read `DATABASE_URL` or provide a password. Update that adapter configuration if your local database differs. `DATABASE_URL` is currently used by the Prisma CLI configuration.

## HTTP API

All routes are mounted below `/api/v1`. The `/api/v2` router is currently empty.

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/v1/ping/` | Ping handler; request validation is currently attached to this GET route |
| `GET` | `/api/v1/ping/health` | Returns plain-text `OK` |
| `GET` | `/api/v1/bookings/health` | Returns plain-text `OK` |
| `GET` | `/api/v1/bookings/` | Currently wired to the booking creation handler and validates the request body |
| `GET` | `/api/v1/bookings/confirm/:idempotencyKey` | Attempts to confirm a booking by idempotency key |

The booking routes currently use `GET` for operations that change state. This is the behavior in the code today, but clients should not treat it as a stable REST contract; creation would normally use `POST` and confirmation would normally use `POST` or `PATCH`.

The creation body is validated against this shape:

```json
{
	"userId": 42,
	"hotelId": 7,
	"totalGuests": 2,
	"bookingAmount": 350
}
```

Each value must be a number. `totalGuests` and `bookingAmount` must be at least `1`. Successful creation is intended to return a booking ID and an idempotency key. Confirmation updates the booking state from `PENDING` to `CONFIRMED` and finalizes the associated key.

## Booking flow

1. The router validates the submitted booking fields.
2. The service acquires a Redis lock for `hotel:<hotelId>`.
3. A `PENDING` booking is inserted, then a UUID idempotency key is stored against it.
4. Confirmation looks up and locks the idempotency-key row within a Prisma transaction.
5. The booking is updated to `CONFIRMED` and the key is marked finalized in that transaction.

## Project layout

```text
src/
	config/          Environment, logging, and Redis/Redlock configuration
	controllers/     HTTP request handlers
	DTO/             Booking and notification data types
	helpers/         Idempotency-key generation
	middlewares/     Correlation IDs and error handling
	prisma/          Schema, generated client, and database migrations
	repo/            Prisma persistence operations
	routers/         Versioned API route registration
	services/        Booking creation and confirmation logic
	validators/      Zod request schemas
```

## Current limitations

- The create and confirm endpoints are currently registered as `GET` routes, despite changing database state.
- The create handler reads `idempotencyKey` from the wrong level of the service result, so its booking ID and idempotency-key response fields are currently undefined.
- The confirmation response currently uses the booking status as its `idempotencyKey` response value.
- The idempotency-key lookup and UUID validation in the repository need correction before confirmation can be relied on; a valid UUID is currently treated as invalid.
- There are no test or build scripts in `package.json`. The generated Prisma client is present in the repository.

These notes describe the implementation as it currently exists and are not guarantees that each workflow succeeds end to end.