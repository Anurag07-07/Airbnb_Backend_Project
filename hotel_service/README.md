# Hotel Service

The Hotel Service is an Express and TypeScript API for managing hotel listings. It exposes versioned HTTP endpoints and persists hotel records in MySQL through Sequelize.

## What it does

- Creates a hotel with its name, address, and location; rating fields are optional in request validation.
- Retrieves one hotel by ID or lists hotels that have not been soft-deleted.
- Updates hotel information.
- Soft-deletes a hotel by setting its `deletedAt` timestamp rather than removing its database row.
- Exposes ping and health-check routes.

## Technology

- Node.js, Express 5, and TypeScript
- MySQL through Sequelize 6 and `mysql2`
- Sequelize CLI migrations
- Zod request validation
- Winston for application logging

## Requirements

- Node.js and npm
- A MySQL server and a database for hotel records

## Run locally

From this directory:

```bash
npm install
npm run migrate
npm run dev
```

The migration command applies the Sequelize migrations. The configured MySQL database must already exist. The server listens on port `3001` by default; set `PORT` in `.env` to use another port. `npm start` starts the service with `ts-node`; `npm run dev` uses `nodemon`.

Create a `.env` file in this service directory:

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | `3001` | HTTP port |
| `DB_HOST` | `localhost` | MySQL host |
| `DB_USER` | `root` | MySQL user |
| `DB_PASSWORD` | `root` | MySQL password |
| `DB_NAME` | `test_db` | MySQL database name |

Example (replace the credentials/database with local values):

```dotenv
PORT=3003
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your-local-password
DB_NAME=airbnb_hotels_dev
```

On startup, the service listens for HTTP requests and authenticates its Sequelize connection. Migration commands are available through `npm run migrate` and `npm run rollback`.

## HTTP API

All routes are mounted below `/api/v1`. The `/api/v2` router is currently empty.

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/v1/ping/` | Ping handler; request validation is currently attached to this GET route |
| `GET` | `/api/v1/ping/health` | Returns plain-text `OK` |
| `POST` | `/api/v1/hotels/` | Create a hotel; body is validated with the hotel schema |
| `GET` | `/api/v1/hotels/` | List hotels whose `deletedAt` is `null` |
| `GET` | `/api/v1/hotels/:id` | Retrieve a hotel by primary key |
| `PUT` | `/api/v1/hotels/:id` | Update a hotel using the validated request body |
| `DELETE` | `/api/v1/hotels/` | Delete handler is registered without an ID in the route |
| `GET` | `/api/v1/hotels/health` | Health handler is declared, but currently follows `/:id` in route order |

Hotel creation expects a JSON body shaped like this:

```json
{
	"name": "Harbor View",
	"address": "10 Bay Street",
	"location": "San Francisco",
	"rating": 4.7,
	"ratingCount": 128
}
```

The required fields are `name`, `address`, and `location`. `rating` and `ratingCount` are optional. Successful create, read, list, update, and delete handlers return JSON with `message`, `data`, and `success` fields.

## Data and deletion behavior

The `hotels` table contains the listing fields, timestamps, and a nullable `deleted_at` column. The repository's list query excludes deleted records. Deletion is intended to be soft deletion; the database row remains available. The single-record lookup currently does not filter soft-deleted hotels.

## Request flow

1. Express attaches a correlation ID and dispatches to the versioned router.
2. Zod validates create and update bodies.
3. Controllers call the hotel service.
4. The service delegates persistence work to the hotel repository.
5. Sequelize reads or writes MySQL, and the response is returned as JSON.

## Project layout

```text
src/
	config/       Environment, database, Sequelize CLI, and logging configuration
	controllers/  HTTP handlers for hotels and ping
	db/           Sequelize models and migrations
	dto/          Hotel create/update data types
	middlewares/  Correlation IDs and error handling
	repo/         Hotel persistence operations
	routers/      Versioned route registration
	services/     Hotel business operations
	validators/   Zod request schemas
```

## Current limitations

- The delete route is mounted at `/hotels/`, but its handler reads `req.params.id`; no ID parameter is defined, so deletion is not currently addressable as intended.
- The `/hotels/health` handler is registered after `GET /:id`, so `health` can be interpreted as an ID. Use `/api/v1/ping/health` for a reliable health check.
- There are no test or build scripts in `package.json`.