## ApronHanger — Candidate Portal (Frontend Only)

A premium, light-mode UI for healthcare professionals (Doctors, Dentists, Nurses, Technicians) to discover jobs, apply through a structured multi-step form, generate a CV, and track applications. Mirrors the recruiter portal's clean design language using a refined navy + premium blue palette.

### Design System

- **Palette (light only):** Background `#F7F9FC` / pure white surfaces, primary deep navy `#0B1E3F`, accent premium blue `#2563EB`, soft blue tints for chips/badges, muted slate text. No teal, no green.
- **Typography:** Inter for body, tight tracking on headings. Strong hierarchy, generous spacing.
- **Components:** Card-based with subtle 1px borders + soft shadow `shadow-[0_1px_3px_rgba(15,23,42,0.06)]`, 12–16px radius, rounded chips/pills, ghost+solid button variants.
- **Iconography:** Lucide, 1.5 stroke, muted slate.
- **Verified badge:** Small navy shield + "Verified" used on hospitals and candidate.

### Information Architecture & Routes

```
/                      → Opportunities (landing, main screen)
/jobs/$jobId           → Job details + Similar jobs
/apply/$jobId          → Apply flow chooser (Quick / Detailed / Upload CV)
/apply/$jobId/form     → Multi-step dynamic form (15 steps)
/cv-preview            → Generated CV preview screen
/applications          → Applications tracking with status timeline
/profile               → Full professional profile + completeness
/profile/edit          → Edit profile
/messages              → Conversations list + chat window
```

Top nav (persistent in `__root.tsx`): Logo · Opportunities · Applications · Messages · Profile · Notifications dropdown · Avatar menu. Sticky, white, hairline border.

### Page-by-Page

**1. Opportunities (`/`)**

- Hero search bar (role · specialty · location) with subtle gradient backdrop.
- Horizontal scrollable category rail: Doctors, Dentists, Nurses, Technicians, Admin/Hospital Ops, Internships/Observership, Locum/Temporary. Sub-chips appear when Doctors/Dentists selected (General Physician, Radiology, Cardiology, Orthopedics, Dental Surgeon).
- Categories driven by a single typed config array (`src/data/categories.ts`) so adding a new category/specialty = one entry.
- Two-column body: left filter sidebar (Location, Experience, Salary, Job type, Sort) · right job feed.
- "Recommended for you" carousel above main feed with match % rings (e.g. 92% match).
- Job cards: Hospital + Verified badge, Role, Specialty, Location pin, ₹ salary range, Experience, Job type pill, "View Details" CTA, Save (bookmark) icon.

**2. Job Details (`/jobs/$jobId`)**

- Sticky right rail with Apply Now (primary) + Save Job, salary, type, posted date.
- Main: hospital header card, full description, role requirements, responsibilities, perks, hospital "About" block.
- Bottom: "Similar Jobs" horizontal scroll cards.

**3. Apply Flow (`/apply/$jobId`)**

- Three large choice cards: **Quick Apply** (uses saved profile preview), **Fill Detailed Form**, **Upload CV** (drag-and-drop UI).

**4. Multi-Step Form (`/apply/$jobId/form`)** — core feature

- Left vertical stepper with 15 steps, progress bar at top.
- Steps: Basic Details · Professional Identity · Qualifications (add-more) · Experience (add-more) · Clinical Skills · Procedures (with counts) · Technical Skills · Certifications · Publications · Availability · Salary Expectations · Languages · Professional Summary · Document Upload · Review & Submit.
- **Role-adaptive fields** driven by selected role on Step 2:
  - Doctor → Medical Council Reg #, procedures matrix
  - Nurse → Ward experience, patient-care skills
  - Dentist → RCT/restorations counts
- Reusable inputs: text, dropdown, multi-select chips, tag input, repeater group, file upload tile, slider for salary.
- Sticky footer: Back · Save Draft · Continue.

**5. CV Preview (`/cv-preview`)**

- A4-styled preview card: profile summary, experience, skills, procedures w/ counts, certifications, education.
- Top actions: Download PDF (UI only), Edit Profile.

**6. Applications (`/applications`)**

- Tabs: All · Applied · Shortlisted · Contacted · Rejected.
- Each application card: job title, hospital, applied date, status pill, mini horizontal timeline (Applied → Reviewed → Shortlisted → Interview → Decision).
- Empty state: friendly illustration + "Start applying to opportunities" CTA.

**7. Profile (`/profile`)**

- Header card: avatar, name, headline, Verified Doctor badge, completeness ring (e.g. 80%), Edit button.
- Sections (cards): Basic Details, Professional Identity, Qualifications, Experience, Skills, Certifications, Summary.
- Right rail: Resume preview thumbnail + Download.

**8. Messages (`/messages`)**

- Two-pane layout: conversations list (recruiter avatars, last message, unread dot) · chat window with message bubbles, hospital header, input bar (UI only).

**9. Notifications dropdown**

- Grouped: Job recommendations · Application updates · Recruiter messages. "Mark all as read".

### Mock Data (`src/data/`)

Realistic Indian healthcare data: Apollo (Kolkata, Chennai), Fortis (Mumbai, Bengaluru), AIIMS (Delhi), Manipal, Narayana Health, Max Healthcare, Medanta. ~20 jobs across roles, ~6 applications in varied statuses, ~5 conversations, fully populated profile for "Dr. Ananya Sengupta — Consultant Cardiologist".

### States

- **Empty states**: Applications, Saved Jobs, Messages — illustrated card + CTA.
- **Loading skeletons**: Job cards, profile sections, applications list (shown briefly via mounted timer for demo polish).

### Footer (mandatory)

Slim footer on every page: "ApronHanger acts as a professional networking and hiring facilitation platform and is not responsible for employment decisions." + small links (About, Privacy, Terms, Contact).

### File Structure (high level)

```
src/
  routes/                 → root, index, jobs.$jobId, apply.$jobId,
                            apply.$jobId.form, cv-preview, applications,
                            profile, profile.edit, messages
  components/
    layout/               → TopNav, Footer, NotificationsDropdown
    jobs/                 → JobCard, FilterSidebar, CategoryRail, RecommendedRail
    apply/                → ApplyChooser, Stepper, step components, repeaters
    profile/              → ProfileHeader, CompletenessRing, SectionCard
    applications/         → ApplicationCard, StatusTimeline
    messages/             → ConversationList, ChatWindow
    cv/                   → CVPreview
    common/               → VerifiedBadge, EmptyState, SkeletonCard, MatchRing
  data/                   → categories.ts, jobs.ts, applications.ts,
                            messages.ts, profile.ts, notifications.ts
  styles.css              → updated tokens (premium navy/blue, light only)
```

### Out of Scope

No backend, no auth, no real PDF generation, no dark mode, no API calls. All interactions are UI-only with in-memory mock data.  
  
4️⃣ ❗ Profile Completeness → Make It Actionable

You added:

- 80% completeness ✔

Add:  
👉 “Improve profile” suggestions:

- Add certifications
- Add experience

This increases realism A LOT

---

## 5️⃣ ❗ Search Behavior (Currently Underspecified)

You wrote:

- Hero search bar ✔

Add:  
👉 Should search:

- Role
- Specialty
- Location

Also:  
👉 Add recent searches dropdown

---

## 6️⃣ ❗ Job Card Differentiation

Right now all jobs look same.

Add:

- “Urgent Hiring” tag
- “Actively Hiring” tag

👉 Small thing, big UX improvement

---

## 7️⃣ ❗ Notifications Interaction

You wrote dropdown ✔

Add:

- Click → navigates to:
  - job
  - application
  - message

---

## 8️⃣ ❗ Mobile Behavior (Missing)

Explicitly add:

- Filters → bottom sheet
- Job cards → stacked
- Stepper → horizontal scroll

---

## 9️⃣ ❗ CV Preview → Add Share Option

You have:

- Download PDF ✔

Add:  
👉 “Share Profile Link”

👉 Very LinkedIn-like → high value

---

## 🔟 ❗ Error / Edge States (Advanced but Important)

Add:

- Invalid form input states
- Upload error UI (even if fake)