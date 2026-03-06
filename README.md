# Florida Solar Sales Academy - Recruiting & Onboarding Platform

A comprehensive recruiting and onboarding platform for solar sales professionals in Florida, featuring a multi-step candidate funnel, owner dashboard with Kanban-style applicant tracking, automated communication via Twilio and SendGrid, and interview scheduling via Calendly.

## Features

### For Candidates
- **Multi-step application funnel** (4 steps): Basic info, experience level, motivation, resume upload
- **Resume upload** to S3 cloud storage with drag-and-drop support
- **Instant qualification scoring** (0-100 scale) based on experience and motivation keywords
- **Automated confirmation** via SMS and email upon application submission

### For Owners/Recruiters
- **Kanban-style dashboard** with applicant tracking (New → Screened → Interviewed → Offered → Hired)
- **Filtering** by city (Tampa, Miami, Fort Lauderdale), status, and experience level
- **Communication hub** with 5 pre-built SMS/email templates and variable substitution
- **Interview scheduling** with Calendly integration and automated reminders
- **Onboarding portal** with training modules organized by category

### Integrations
- **Twilio** - SMS notifications and reminders (graceful fallback when not configured)
- **SendGrid** - Email delivery and templates (graceful fallback when not configured)
- **Calendly** - Interview scheduling with available time slots (graceful fallback when not configured)
- **S3** - Resume and file storage

## Tech Stack

| Technology | Purpose |
|---|---|
| React 19 | Frontend UI |
| TypeScript | Type safety |
| tRPC 11 | Type-safe API |
| Drizzle ORM | Database ORM |
| MySQL/TiDB | Database |
| Tailwind CSS 4 | Styling |
| Express 4 | Server |
| Vitest | Testing |
| S3 | File storage |

## Environment Variables

### Required (Auto-configured by Manus)
- `DATABASE_URL` - Database connection string
- `JWT_SECRET` - Session cookie signing secret
- `VITE_APP_ID` - OAuth application ID
- `OAUTH_SERVER_URL` - OAuth backend URL

### Optional (Add when ready)

#### Twilio (SMS)
- `TWILIO_ACCOUNT_SID` - Twilio Account SID
- `TWILIO_AUTH_TOKEN` - Twilio Auth Token
- `TWILIO_PHONE_NUMBER` - Twilio phone number (E.164 format, e.g., +15551234567)

#### SendGrid (Email)
- `SENDGRID_API_KEY` - SendGrid API key
- `SENDGRID_FROM_EMAIL` - Verified sender email (default: noreply@floridasolarsalesacademy.com)
- `SENDGRID_FROM_NAME` - Sender display name (default: Florida Solar Sales Academy)

#### Calendly (Scheduling)
- `CALENDLY_API_KEY` - Calendly Personal Access Token
- `CALENDLY_SCHEDULING_URL` - Calendly scheduling page URL
- `CALENDLY_EVENT_TYPE_URI` - Calendly event type URI for API calls

> **Note:** All integrations work in "logged mode" when API keys are not configured. Messages are logged to the console but not actually sent. This allows the platform to function fully without external services.

## Database Schema

| Table | Description |
|---|---|
| `users` | Authentication and user management |
| `applicants` | Candidate applications with qualification scores |
| `interviews` | Interview scheduling and status tracking |
| `jobOffers` | Offer management and tracking |
| `communicationLog` | SMS/email communication history |
| `testimonials` | Landing page testimonials |
| `trainingModules` | Onboarding training content |

## Testing

The project includes 164 tests across 7 test files:

```bash
pnpm test
```

### Test Coverage
- **Unit tests** - All tRPC procedures and business logic
- **Security tests** - SQL injection (24 vectors), XSS (11 vectors), auth bypass
- **Load tests** - 20 concurrent requests, 50 rapid sequential calls
- **Integration tests** - Twilio, SendGrid, Calendly service modules (28 tests)
- **Edge case tests** - Input validation, boundary conditions, error recovery
- **Branding tests** - Florida Solar Sales Academy consistency

## Project Structure

```
server/
  routers/
    applicants.ts     - Applicant CRUD and submission
    communications.ts - SMS/email with templates
    interviews.ts     - Interview scheduling and reminders
  services/
    twilio.ts         - Twilio SMS service (fetch-based)
    sendgrid.ts       - SendGrid email service (fetch-based)
    calendly.ts       - Calendly scheduling service
  db.ts               - Database helpers and qualification scoring
  routers.ts          - tRPC router registry
client/src/
  pages/
    Home.tsx           - Landing page
    Apply.tsx          - 4-step application funnel
    Dashboard.tsx      - Owner dashboard with Kanban board
    Onboarding.tsx     - Training portal
drizzle/
  schema.ts           - Database schema definitions
```

## Communication Templates

| Template | SMS | Email | Variables |
|---|---|---|---|
| Application Received | ✅ | ✅ | {name} |
| Interview Scheduled | ✅ | ✅ | {name}, {date}, {time} |
| Interview Reminder | ✅ | ✅ | {name}, {time} |
| Offer Sent | ✅ | ✅ | {name} |
| Training Starting | ✅ | ✅ | {name}, {date} |

## Qualification Scoring

Candidates are automatically scored (0-100) based on:

- **Experience Level** (20-40 points): Solar sales (40), Aspiring leader (35), Outside sales (30), Entry level (20)
- **Motivation Keywords** (up to 60 points): Financial freedom (15), Build team (15), Leadership (15), Independence (10), Growth (10), Earn (5)

## License

MIT
