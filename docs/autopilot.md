# PRD: Voice Report Autopilot Agent

## 1. Document Control
- Product: CivicOS Citizen Report Flow
- Feature: Voice Report Autopilot
- Owner: Product + Engineering
- Status: Approved for phased implementation
- Last Updated: 2026-03-28

## 2. Problem Statement
Citizens should be able to report civic issues by speaking naturally. Today, voice input exists only as one-shot transcription. It does not run a guided, multi-turn autopilot that collects missing required fields, confirms details, and submits safely.

## 3. Goal
Create a multi-turn voice agent that:
1. Accepts a spoken issue description.
2. Auto-extracts and fills report fields.
3. Collects location via spoken address or GPS.
4. Confirms details before submit.
5. Submits through the existing grievance pipeline.

## 4. Non-Goals
1. Voice-based image upload.
2. Replacing typed/manual reporting UI.
3. Changes to authority-side workflows.
4. Always-on/background listening.

## 5. Users
1. Primary: Citizen users filing grievances from mobile and desktop browsers.
2. Secondary: Support/admin teams reviewing submission quality.

## 6. User Stories
1. As a citizen, I can speak my issue in Hindi or English and get a structured report draft.
2. As a citizen, I can say a location or ask the app to use my current GPS.
3. As a citizen, I hear or see a final summary and explicitly confirm before submission.
4. As a citizen, I can correct fields by voice before submit.
5. As a citizen, I can still upload photo evidence manually in UI.

## 7. Success Metrics
1. Completion rate of voice-started reports.
2. Median time from first utterance to successful submission.
3. Parse success rate (valid structured output per turn).
4. Location resolution success rate.
5. Error recovery success rate after STT/parser/geo failures.
6. Duplicate submission rate (target near zero).

## 8. Functional Requirements

### 8.1 Conversation and State
1. Implement turn-based state machine with states:
	idle, listening, transcribing, extracting, resolving-location, awaiting-confirmation, submitting, success, error.
2. Voice autopilot can accept multiple fields in one utterance.
3. Agent asks only for missing required fields.
4. Agent supports correction intents: change location/category/description, cancel, repeat.

### 8.2 Field Collection
1. Required before submit:
	description, category, priority, department, ward/location text, latitude, longitude, user session.
2. Optional:
	citizen photo, raw transcript history.
3. Autopilot can infer category/priority/department via AI.

### 8.3 Location Handling
1. Spoken address path:
	use autocomplete suggestions and resolve coordinates.
2. GPS path:
	user says to use current location, browser geolocation + reverse geocode.
3. If confidence low or ambiguous address, ask explicit confirmation.

### 8.4 Submission and Confirmation
1. Before submit, show/speak final summary.
2. Require explicit confirm intent before creating grievance.
3. Block submit while already submitting.
4. Keep manual image upload unchanged and clearly communicated.

### 8.5 Error Handling
1. Microphone denied: show actionable fallback.
2. STT timeout/failure: retry prompt without losing draft.
3. Parser invalid output: fallback question, preserve safe state.
4. Geocode timeout/failure: fallback to manual location selection.
5. Submission failure: show reason and keep draft for retry.

## 9. Non-Functional Requirements
1. Security: prompt-injection-resistant parsing, strict schema validation.
2. Reliability: bounded retries and stable fallbacks.
3. Performance: responsive turn latency with visible progress states.
4. Accessibility: text + optional speech prompts, clear controls.
5. Compatibility: keep current route structure and action contracts.

## 10. Technical Design

### 10.1 Existing Components to Reuse
1. STT and TTS actions.
2. AI issue analysis patterns.
3. Geo autocomplete + reverse geocode actions.
4. Existing grievance creation path with rate-limit/validation/sanitization.

### 10.2 New Additions
1. Voice draft data model and intent model.
2. Parser schema for AI structured output.
3. New server action for parsing each voice turn.
4. Report page state machine orchestration.
5. Event logging/telemetry hooks for each stage.

### 10.3 Data Contracts
1. `VoiceTurnInput`:
	transcript, currentDraft, languageHint, userContext.
2. `VoiceTurnOutput`:
	draftPatch, missingFields, nextPrompt, intents, confidence.
3. `VoiceDraft`:
	description, category, priority, department, locationText, lat, lng, ward, wantsGps, wantsSubmit, confirmationState.

## 11. Step-by-Step Execution Plan

### Step 1: Contracts and Schemas
1. Add TypeScript types for voice draft and intents.
2. Add Zod schemas for parser input/output.
3. Define required field checklist utility.
4. Deliverable: compile-safe contracts and shared validators.
5. Acceptance: lint/types pass for new contracts.
6. Approval Gate: stop and request user approval.

### Step 2: Server Parser Action
1. Add `parseVoiceReportTurnAction`.
2. Add session check and standard rate limiter.
3. Return plain serializable structured object.
4. Deliverable: callable parser action with safe fallback.
5. Acceptance: manual action call returns valid schema response.
6. Approval Gate: stop and request user approval.

### Step 3: Gemini Slot-Filling Parser
1. Implement strict JSON prompt for extraction + intents.
2. Keep shielded user-input pattern.
3. Add fallback on malformed JSON/timeout.
4. Deliverable: resilient parser utility.
5. Acceptance: sample utterances produce valid structured output.
6. Approval Gate: stop and request user approval.

### Step 4: Report Page State Machine
1. Replace one-shot voice flow with turn-based orchestration.
2. Add deterministic merge logic for draft patches.
3. Add visual status indicators per state.
4. Deliverable: UI can progress across voice turns.
5. Acceptance: no regression in typed/manual report flow.
6. Approval Gate: stop and request user approval.

### Step 5: Location Resolution Branch
1. Implement spoken-address resolution with confirmation.
2. Implement GPS intent branch.
3. Add low-confidence fallback prompts.
4. Deliverable: resolved lat/lng before submit gate.
5. Acceptance: both address and GPS paths work.
6. Approval Gate: stop and request user approval.

### Step 6: Confirmation and Submit Gate
1. Build final summary prompt.
2. Require explicit confirm intent.
3. Prevent duplicate submits with lock/debounce.
4. Deliverable: safe end-to-end submission path.
5. Acceptance: single grievance created per confirmed submit.
6. Approval Gate: stop and request user approval.

### Step 7: Voice UX Polish (Optional TTS)
1. Add optional TTS for next prompt and final summary.
2. Add mute/silent toggle.
3. Keep clear manual-image guidance in voice prompts.
4. Deliverable: hands-free UX improvements.
5. Acceptance: toggle works, no blocking errors when TTS fails.
6. Approval Gate: stop and request user approval.

### Step 8: Observability and Recovery Paths
1. Add stage-level telemetry markers.
2. Add user-safe recovery messages for all known failures.
3. Preserve draft through recoverable failures.
4. Deliverable: debuggable and resilient production behavior.
5. Acceptance: error scenarios recover without data loss.
6. Approval Gate: stop and request user approval.

### Step 9: Verification and Sign-off
1. Run lint and fix introduced issues.
2. Execute full manual test matrix.
3. Document known limitations and next iteration items.
4. Deliverable: release-ready feature with evidence.
5. Acceptance: all critical paths pass.
6. Approval Gate: final go/no-go from user.

## 12. Test Matrix
1. Happy path: issue + location + confirm.
2. GPS path: issue + use current location + confirm.
3. Ambiguous location path requiring confirmation.
4. Correction path: change location/category/description.
5. Cancel path before submit.
6. Mic denied path.
7. STT timeout path.
8. Parser malformed output path.
9. Geocode timeout path.
10. Submit failure path with retry.
11. Duplicate confirm clicks/taps.
12. Voice request to attach image returns manual-upload guidance.

## 13. Risks and Mitigations
1. AI parser drift or malformed output.
	Mitigation: strict schema validation and fallback prompts.
2. Location ambiguity.
	Mitigation: confidence thresholds + explicit confirmation.
3. Abuse/spam on parser endpoints.
	Mitigation: session checks + rate limiting.
4. Regression in current report flow.
	Mitigation: preserve existing submit action and typed flow tests.

## 14. Rollout Strategy
1. Internal enablement first.
2. Limited user rollout.
3. Observe error and completion metrics.
4. Full rollout after threshold validation.

## 15. Execution Protocol with User Approval
1. Engineering executes exactly one numbered step at a time.
2. After each step, provide:
	completed changes, files touched, verification output, and pending risks.
3. Pause and ask for explicit permission before starting the next step.

---

## Immediate Next Action
Step 1 is ready to execute now.