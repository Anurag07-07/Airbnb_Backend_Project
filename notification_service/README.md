# Notification Service

The Notification Service is an Express and TypeScript application with a BullMQ email queue worker. Email jobs are intended to be queued in Redis, rendered with Handlebars templates, and delivered through Nodemailer using Gmail SMTP.

## What it does

- Starts a versioned Express API with ping and health-check routes.
- Connects a BullMQ worker to the `queue-mailer` Redis queue when the server starts.
- Renders a Handlebars template and sends its HTML through Nodemailer for each processed email job.
- Provides a queue producer helper (`addEmailToQueue`) for adding email jobs from application code.

There is currently no HTTP endpoint for submitting an email job. The producer is an internal helper, not an exposed API route.

## Technology

- Node.js, Express 5, and TypeScript
- BullMQ and Redis for queued background work
- Nodemailer for email delivery
- Handlebars for email templates
- Winston for application logging

## Requirements

- Node.js and npm
- Redis
- A Gmail account configured for SMTP use. Use an app password where required by Google; do not commit credentials.

## Run locally

From this directory:

```bash
npm install
npm run dev
```

The server listens on port `3001` by default. Set `PORT` in `.env` to choose another port. `npm start` starts the service with `ts-node`; `npm run dev` starts it with `nodemon`.

Create a `.env` file in this service directory:

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | `3001` | HTTP port |
| `REDIS_HOST` | `localhost` | Redis host |
| `REDIS_PORT` | `6379` | Redis port |
| `MAIL_USER` | Empty | Gmail account used as sender |
| `MAIL_PASS` | Empty | Gmail SMTP/app password |

Example (keep real credentials out of source control):

```dotenv
PORT=3004
REDIS_HOST=localhost
REDIS_PORT=6379
MAIL_USER=mailer@example.com
MAIL_PASS=replace-with-a-local-app-password
```

The queue worker is started by the server process. Redis and valid mail credentials are needed for successful job processing. The service's API and worker run in the same process.

## HTTP API

All routes are mounted below `/api/v1`. The `/api/v2` router is currently empty.

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/v1/ping/` | Ping handler; request validation is currently attached to this GET route |
| `GET` | `/api/v1/ping/health` | Returns plain-text `OK` |

The health route is suitable for a basic process check. There is no public endpoint for enqueueing messages at this time.

## Email job flow

1. Application code calls `addEmailToQueue` with a notification payload.
2. BullMQ stores the job in the Redis queue named `queue-mailer` under the name `payload:mail`.
3. The worker checks the job name and renders a template from `src/templetes/mailer/<templateId>.hbs` with the supplied `params`.
4. The rendered HTML is passed to Nodemailer and sent to the recipient.

The declared notification payload is:

```json
{
	"to": "guest@example.com",
	"subject": "Welcome",
	"templateId": "welcome",
	"params": {
		"name": "Guest",
		"appName": "Airbnb Backend"
	}
}
```

The existing `welcome.hbs` template uses the `name` and `appName` parameters. Template IDs are used to select `.hbs` files from the mailer templates directory.

## Project layout

```text
src/
	config/          Environment, Redis, mail transport, and logging configuration
	controllers/     HTTP ping handler
	dto/             Notification job shape
	middlewares/     Correlation IDs and error handling
	producers/       Queue producer helper
	queues/          BullMQ queue configuration
	routers/         Versioned API routes
	services/        Nodemailer send operation
	templetes/       Handlebars rendering and mail templates
	workers/         BullMQ email job processor
```

## Current limitations

- The worker and notification DTO currently disagree about property names: the DTO defines `to` and `templateId`, while the worker reads `id` and `templeteId`. Jobs using the documented DTO therefore need this mismatch fixed before delivery works reliably.
- The mail service uses the configured sender and recipient, but the worker currently passes its `id` property as the recipient.
- No API route currently calls the queue producer, so other services need an integration or endpoint before they can enqueue mail over HTTP.
- There are no test or build scripts in `package.json`.