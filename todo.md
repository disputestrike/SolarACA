# Solar Recruiting Portal - Project TODO

## Phase 1: Database Schema & Design System
- [x] Define database schema (applicants, interviews, offers, training modules, testimonials)
- [x] Create Drizzle migrations for all tables
- [x] Set up design system and color palette (Tailwind config)
- [x] Configure global styles and typography
- [x] Set up project structure and routing

## Phase 2: Landing Page
- [x] Design high-impact hero section with solar imagery
- [x] Build localized landing pages (Tampa, Miami, Fort Lauderdale)
- [x] Create testimonials section with success stories
- [x] Implement income potential showcase ($100k-$300k+)
- [x] Build leadership pathways section
- [x] Add emotional appeal messaging (financial freedom, team building, autonomy, impact)
- [x] Create call-to-action buttons linking to application funnel

## Phase 3: Candidate Application Funnel
- [x] Build multi-step form component (4 steps)
- [x] Step 1: Basic info (Name, Phone, Email, City)
- [x] Step 2: Experience level dropdown
- [x] Step 3: Motivation text field
- [x] Step 4: Resume upload with drag-and-drop
- [x] Implement form validation and error handling
- [x] Add progress indicator
- [x] Create success confirmation page
- [x] Integrate S3 storage for resume uploads

## Phase 4: Owner Dashboard
- [x] Build dashboard layout with sidebar navigation
- [x] Create Kanban board component (New, Screened, Interviewed, Offered, Hired)
- [x] Implement applicant card with key info
- [x] Add filtering by experience level and status
- [x] Create applicant detail view with full profile
- [x] Add search functionality
- [ ] Implement drag-and-drop between columns (future enhancement)
- [x] Create analytics/metrics section

## Phase 5: Communication Hub & Offers
- [ ] Build communication hub interface
- [ ] Create templated SMS message composer
- [ ] Create templated email composer
- [ ] Implement send functionality
- [ ] Build offer management section
- [ ] Create digital offer template
- [ ] Integrate e-signature capability (placeholder for DocuSign/HelloSign)
- [ ] Track offer status (sent, viewed, signed, accepted, rejected)

## Phase 6: Scheduling, Notifications & Onboarding
- [ ] Integrate Calendly API for interview scheduling
- [ ] Build scheduling UI in candidate funnel
- [ ] Implement SMS reminder system (Twilio integration)
- [ ] Implement email reminder system (SendGrid integration)
- [x] Create onboarding portal section
- [ ] Build training video player component
- [x] Create leadership development module structure
- [ ] Implement role-specific content delivery

## PHASE 7: Testing & Optimization
- [x] Write Vitest tests for core procedures (7 tests passing)
- [x] Test candidate funnel end-to-end
- [x] Test dashboard functionality
- [x] Mobile responsiveness testing
- [x] Performance optimization
- [x] Security review (data handling, authentication)
- [x] Create checkpoint and prepare for delivery

## PHASE 8: Interview Scheduling & Automated Reminders
- [x] Integrate Calendly API for interview scheduling (backend ready)
- [ ] Add scheduling UI to applicant detail modal
- [x] Create interview confirmation page (backend ready)
- [ ] Implement SMS reminder system (Twilio integration - placeholder ready)
- [ ] Implement email reminder system (SendGrid integration - placeholder ready)
- [x] Add reminder templates (backend ready)
- [x] Track interview attendance and no-shows
- [ ] Create interview feedback form

## PHASE 9: Communication Hub with Templated Messaging
- [ ] Build communication hub interface in dashboard
- [x] Create templated SMS message composer (backend ready)
- [x] Create templated email composer (backend ready)
- [ ] Implement send functionality with Twilio/SendGrid (placeholder ready)
- [x] Create message template library (5 templates created)
- [ ] Track message delivery and read receipts
- [ ] Build message history view
- [ ] Implement bulk messaging capability

## PHASE 10: Candidate Qualification Scoring System
- [x] Create scoring algorithm based on experience, motivation, and cultural fit
- [x] Add scoring calculation to applicant submission
- [ ] Display score on applicant cards in dashboard
- [ ] Create scoring breakdown in applicant detail view
- [ ] Add filtering by score range
- [ ] Create scoring insights and analytics
- [ ] Build candidate ranking system
- [x] Implement auto-prioritization based on score

## Additional Features (Future)
- [ ] Advanced analytics and reporting
- [ ] Bulk email/SMS campaigns
- [ ] Interview feedback forms
- [ ] Team management and sub-accounts
- [ ] Integration with payroll/commission tracking

## REDESIGN PHASE: Branding, Content & Visual Improvements
- [x] Rebrand from "Dave's Solar Academy" to "Florida Solar Academy"
- [x] Strengthen color palette (move to deeper, more professional solar/energy colors)
- [x] Add solar industry education content (panels, efficiency, ROI, sustainability)
- [x] Integrate sustainability impact messaging (carbon reduction, energy independence)
- [x] Add solar market context and industry trends
- [x] Include solar technology explainers on landing page
- [ ] Add solar-specific knowledge questions to application funnel
- [ ] Create solar education section in onboarding
- [x] Update all branding across all pages and components


## PHASE 2: BACKEND INFRASTRUCTURE & DATABASE INTEGRATION
- [x] Create tRPC procedures for applicant submission (createApplicant)
- [x] Create tRPC procedures for resume upload (uploadResume)
- [x] Create tRPC procedures for applicant retrieval (getApplicants, getApplicantById)
- [x] Create tRPC procedures for applicant status updates (updateApplicantStatus)
- [ ] Create tRPC procedures for interview scheduling (scheduleInterview)
- [x] Implement S3 resume storage integration
- [x] Create database helper functions in server/db.ts
- [x] Add form validation on backend
- [x] Implement error handling and logging
- [x] Create database queries for dashboard filtering

## PHASE 3: FRONTEND-BACKEND INTEGRATION
- [x] Connect Apply form to createApplicant procedure
- [x] Implement resume upload with S3 integration
- [x] Add loading states and error handling
- [x] Connect Dashboard to getApplicants procedure
- [x] Implement real-time applicant data display
- [x] Add applicant detail view with full profile
- [x] Implement status update functionality
- [x] Add search and filtering on dashboard

## EXPERT RECRUITING BEST PRACTICES INTEGRATION
- [x] Add "Why Hire Through Us?" section highlighting agency benefits (access to hidden talent, time/cost efficiency, market intelligence, reduced risk)
- [ ] Create candidate qualification scoring system (assess sales experience, motivation, cultural fit)
- [ ] Add market intelligence section (salary benchmarks, demand trends, competitive positioning)
- [x] Implement risk mitigation messaging (replacement guarantee, 60-90 day trial period)
- [ ] Build candidate pipeline management (track passive candidates, engagement history)
- [x] Add testimonials from successful team leaders showing real earnings and growth
- [x] Create "What's Next?" timeline showing interview, offer, training, and earning milestones
- [x] Add proactive outreach messaging (we find you, not just wait for applications)
- [ ] Implement candidate engagement tracking (email opens, page visits, application progress)
- [ ] Create follow-up automation for passive candidates


## PHASE 11: COMPREHENSIVE TESTING SUITE (EXTREME)
- [ ] Audit codebase for correctness and completeness
- [ ] Verify database schema matches Drizzle definitions
- [ ] Verify all tRPC endpoints are registered and reachable
- [ ] Write comprehensive unit tests for ALL backend procedures
- [ ] Write edge case tests (empty strings, null values, overflow, special chars)
- [ ] Write chaos tests (malformed JSON, missing fields, wrong types)
- [ ] Write SQL injection tests (all string inputs)
- [ ] Write XSS attack tests (script tags in all text fields)
- [ ] Write auth bypass tests (accessing protected routes without auth)
- [ ] Write data exposure tests (ensure no sensitive data leaks)
- [ ] Write load/stress tests (concurrent requests)
- [ ] Verify frontend-backend integration (all tRPC calls)
- [ ] Verify UI rendering on all pages
- [ ] Fix ALL discovered issues
- [ ] Re-run full test suite until ALL GREEN
- [ ] Push final code to GitHub
