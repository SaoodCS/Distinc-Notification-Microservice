# DistInc Notification Microservice

A TypeScript Firebase service that stores user reminder preferences and delivers recurring income-distribution prompts through Firebase Cloud Messaging.

## Links

| Resource | Link |
|---|---|
| Live application | [distinc.co.uk](https://www.distinc.co.uk) |
| Demo video | [Watch on YouTube](https://youtu.be/xbIUeWg9SuI) |
| Public API entry point | [DistInc API Gateway](https://github.com/SaoodCS/DistInc-API-Gateway) |
| React PWA | [DistInc Frontend](https://github.com/SaoodCS/DistInc-PWA-React-TypeScript-Front-End) |
| Data service | [DistInc Data Microservice](https://github.com/SaoodCS/DistInc-Data-Microservice) |
| User service | [DistInc User Microservice](https://github.com/SaoodCS/DistInc-User-Microservice) |

## Tech Stack

| Area | Technology | Purpose |
|---|---|---|
| Runtime | Node.js 20, TypeScript 5.4 | Strictly typed server-side implementation |
| API | Express, Firebase Cloud Functions | Settings routes and serverless execution |
| Scheduling | Firebase scheduled functions | Hourly processing of due reminders |
| Persistence | Cloud Firestore | Per-user schedules, tokens, and badge counts |
| Messaging | Firebase Cloud Messaging | Device-targeted push delivery |
| Authentication | Firebase Authentication | ID-token verification and user-scoped access |
| Testing | Jest, `ts-jest` | TypeScript unit tests |
| Delivery | GitHub Actions, Firebase CLI | Branch-based CI/CD |

## Key Features

- Stores each authenticated user's FCM token, badge count, and optional reminder schedule.
- Supports daily, weekly, monthly, and yearly recurrence values in the notification domain model.
- Runs an hourly scheduled function that queries Firestore for reminders whose next date is due.
- Sends data messages that direct the client to the income-distribution area of the application.
- Advances each successfully processed reminder to its next recurrence date.
- Increments and persists the application badge count after delivery.
- Removes Firestore records associated with invalid FCM tokens to prevent repeated failed sends.
- Protects deployed HTTP requests with a gateway API key and verifies Firebase ID tokens for user-specific settings.

## Getting Started

### Prerequisites

- Node.js 20
- npm
- Firebase CLI 13.7.2 for emulation or deployment
- A Firebase project with Authentication, Firestore, Cloud Messaging, and scheduled functions configured

The repository uses `package-lock.json`, so npm is the supported package manager.

```bash
git clone https://github.com/SaoodCS/Distinc-Notification-Microservice.git
cd Distinc-Notification-Microservice
npm install
```

The root install script installs dependencies in `functions/`.

### Environment

Environment files are gitignored, and the repository does not currently include a `.env.example`. Create `functions/.env` with the internal key shared with the API gateway:

```dotenv
API_KEY=replace-with-shared-gateway-key
```

Firebase Admin uses the active Firebase project or `GOOGLE_APPLICATION_CREDENTIALS`. Deployed HTTP requests are expected to include:

- `Content-Type: application/json`
- `api-key: <shared key>`
- `Authorization: Bearer <Firebase ID token>`

Start the development-project Functions emulator:

```bash
npm run serve-dev
```

The emulator serves the HTTP function on port `9000`. Scheduled delivery is exported separately as `sendScheduledNotif` and runs hourly when deployed.

## Available Scripts

| Command | Description |
|---|---|
| `npm run build` | Removes generated output and compiles TypeScript |
| `npm run serve-dev` | Builds and emulates functions against `distinc-dev` |
| `npm run serve-prod` | Builds and emulates functions against `distinc-9ad9d` |
| `npm run test` | Runs the Jest test suite |
| `npm run test-watch` | Runs Jest in watch mode |
| `npm run lint-ts` | Runs ESLint and TypeScript checks concurrently |
| `npm run lint-fix` | Applies supported ESLint fixes |
| `npm run prettify` | Formats TypeScript source with Prettier |
| `npm run deploy-dev` | Deploys the HTTP and scheduled functions to development |
| `npm run deploy-prod` | Deploys the HTTP and scheduled functions to production |

## Architecture

The service has two entry paths: an Express application for notification settings and an hourly scheduled function for delivery.

```text
functions/src/
├── index.ts                 # HTTP and scheduled function exports
├── getNotifSettings/        # Reads the authenticated user's settings
├── setNotifSettings/        # Validates and persists token/schedule data
├── deleteNotifSettings/     # Removes the saved schedule
├── sendNotif/               # Queries due reminders and sends FCM messages
└── global/
    ├── middleware/          # API-key and request-header checks
    ├── helpers/             # Date, validation, Firebase, and error helpers
    └── utils/               # Firestore, messaging, and response-code clients
```

For HTTP requests, middleware validates the gateway contract before the route verifies the Firebase token and accesses the UID-keyed Firestore document. Independently, the scheduler queries due records, sends each message, and persists the next date and badge count.

## API Overview

The settings routes are mounted beneath the deployed `notification` HTTPS function and are normally called through the API gateway.

| Method | Route | Purpose |
|---|---|---|
| `GET` | `/getNotifSettings` | Returns the authenticated user's saved token and schedule data |
| `POST` | `/setNotifSettings` | Creates or updates the FCM token, badge count, and optional schedule |
| `POST` | `/deleteNotifSettings` | Removes the user's saved notification schedule |

The `sendScheduledNotif` function runs every hour. It selects records where `notifSchedule.nextDate` is earlier than or equal to the current time, sends an FCM data message, and calculates the next due date from the saved recurrence.

## Testing and Quality

- TypeScript is configured with `strict: true`.
- ESLint checks type-aware rules, imports, unused code, formatting, and selected security concerns.
- Jest currently covers number-generation and object-lookup helpers.
- GitHub Actions runs type checking, linting, and tests before deployment.
- Firebase Functions logging records empty schedules, successful sends, invalid tokens, and processing errors.

Automated coverage does not yet exercise the HTTP endpoints, Firestore queries, recurrence processing, or FCM delivery path.

## Deployment

Two Firebase functions are deployed:

| Function | Trigger |
|---|---|
| `notification` | HTTPS request |
| `sendScheduledNotif` | Pub/Sub schedule: every hour |

The GitHub Actions workflow uses Node.js 20.12.2 and Firebase CLI 13.7.2. Pushes to `dev` deploy both functions to `distinc-dev`; pushes to `prod` deploy them to `distinc-9ad9d`. Environment data and service-account credentials are supplied through repository secrets.

## Engineering Decisions

- Notification settings are keyed by Firebase UID so device and schedule data remain scoped to the authenticated user.
- HTTP preference management and scheduled delivery are separate function exports, allowing each trigger to scale independently.
- Firestore performs the due-date filter before records reach the sender, reducing unnecessary scheduled-function work.
- Recurrence calculation is isolated in a date helper, while the delivery workflow remains focused on messaging and persistence.
- Invalid-token cleanup prevents the hourly job from repeatedly attempting delivery to known unusable registrations.

## Known Limitations and Roadmap

- Add endpoint and Firestore integration tests; current tests cover only shared helpers.
- Add a sanitized `.env.example` and documented Firebase emulator configuration.
- Add rate limiting and operational alerting.
