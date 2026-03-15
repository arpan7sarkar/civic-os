# Product Requirements Document (PRD) - CivicOS

## 1. Executive Summary
CivicOS is a unified national platform for citizen grievance reporting and resolution tracking. Transitioning from a regional (Delhi) focus to a national scope, it leverages AI and spatial intelligence to bridge the gap between citizens and government administration, ensuring a cleaner, smarter India.

---

## 2. Sitemap
- **Landing Page (`/`)**: High-fidelity welcome page with AI Assistant and department overview.
- **Authentication (`/auth`)**:
    - Login via Phone (OTP)
    - Registration / Mandatory Profile Update
- **Citizen Dashboard (`/dashboard`)**: Central command center for tracking resolution progress.
- **Global Spatial Map (`/map`)**: Real-time visualization of city-wide grievances with filtering and export capabilities.
- **Grievance Reporting (`/report`)**: One-touch reporting with photo upload and AI-powered description refinement.
- **Resolution Verification (`/verification`)**: Tool for citizens to verify if a reported issue has been truly resolved.

---

## 3. Architecture
CivicOS follows a modern, serverless-first architecture:
- **Frontend Layer**: Next.js (App Router) for high-performance rendering and SEO.
- **Backend-as-a-Service (BaaS)**: Appwrite handles Authentication, JSON Databases, and Blob Storage.
- **AI Intelligence Layer**:
    - **Google Gemini**: Processes multi-lingual reports (Hindi/Bengali/etc.), translates them to English, and sanitizes descriptions.
    - **Sarvam AI**: Provides voice-to-text assistance for accessibility.
- **Spatial Intelligence**:
    - **Leaflet**: Core mapping engine for spatial visualization.
    - **Geoapify**: Reverse geocoding for precise address resolution.
- **Security & Stability**: Strict serialization sanitization in Server Actions to ensure production-grade stability.

---

## 4. Current Tech Stack
| Component | Technology |
| :--- | :--- |
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript |
| **Backend** | Appwrite (Auth, DB, Storage) |
| **Styling** | Tailwind CSS 4 |
| **Mapping** | Leaflet, React-Leaflet |
| **AI (LLM)** | Google Generative AI (Gemini) |
| **AI (Voice)** | Sarvam AI |
| **Analytics** | Vercel Analytics |
| **Document PDF** | jsPDF, html2canvas |

---

## 5. Project Structure
```text
src/
├── app/               # Next.js App Router (Routes & Layouts)
│   ├── actions/       # Server Actions (Auth, AI, DB logic)
│   ├── auth/          # Authentication flows
│   ├── dashboard/     # User command center
│   ├── map/           # Interactive map view
│   ├── report/        # Grievance submission
│   └── verification/  # Resolution checking
├── components/        # Reusable UI components (Hero, Header, Sidebar)
├── lib/               # Service clients (Appwrite, Gemini, Sarvam, Store)
├── public/            # Static assets (Logos, Icons)
└── styles/           # Global design system
```

---

## 6. Minimum Viable Product (MVP)
The MVP focus is on **"One-Touch Stability"**:
- Secure Phone + OTP login system.
- Mandatory Profile Enforcement (Name, Govt ID).
- Ability to report a grievance with image and location.
- AI-driven cleanup of reported descriptions.
- Dashboard view to track individual submission status.
- Global map to see public reports city-wide.
- PDF generation for official grievance receipts.

---

## 7. Key Features
- **Intelligent Refinement**: AI automatically translates and summarizes multi-lingual reports into professional English.
- **Spatial Command Center**: Real-time map pointers with category-specific icons (Streetlight, Garbage, etc.).
- **Mobile-First Design**: Fully responsive across iPhones, Androids, and tablets nationwide.
- **Voice Assist**: Citizens can report grievances via voice for enhanced accessibility.
- **Grievance Export**: Authorized analysis via CSV export of map data.

---

## 8. Problems & Pain Points Solved
### Problems:
- **Language Barriers**: Citizens often report in local dialects; AI translates these for administrators.
- **Data Inconsistency**: "Glitchy" registrations and orphaned profiles are managed via the Mandatory Update system.
- **Lack of Transparency**: Citizens can now see exactly where and how many issues are reported in their jurisdiction.
- **Manual Data Processing**: AI sanitizes "garbage" text and irrelevant comments automatically.

### Pain Points:
- **Redirection Loops**: Solved via refined `initDashboard` logic and serialization sanitization.
- **Delhi-Centric Limitation**: Broadened to a National Scope (Govt. of India branding).
- **Service Interruptions**: The new "Compliance Banner" ensures missing legal data is collected without breaking the user experience.
