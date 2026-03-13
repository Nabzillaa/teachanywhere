Use this as your single Claude prompt:

```text
I want you to act as a world-class product manager, business analyst, workflow architect, systems designer, operations strategist, and implementation planner.

Your task is to take the SOP below and turn it into a complete, build-ready operational system design for managing Manila client visits from end to end.

This is not a summarisation task.
This is not a rewrite task.
This is a systems design and implementation planning task.

I want you to think like someone designing a real internal business system that an ops team, client services team, admin team, finance team, and leadership team will actually use.

The system should support repeatable, high-quality client visits to Manila and should be robust enough to scale across multiple clients, multiple internal teams, and future process complexity.

I want you to turn the SOP into:
1. a full business process architecture
2. a workflow and lifecycle design
3. a data model
4. detailed entities and field definitions
5. statuses and state transitions
6. role-based permissions
7. automation logic
8. forms and dashboards
9. communication templates
10. expense and reimbursement logic
11. client-specific exceptions handling
12. implementation recommendations
13. an MVP build plan
14. a phased roadmap
15. a build backlog with priorities
16. acceptance criteria
17. a QA/UAT checklist
18. an admin operating guide
19. example records and example workflows

You must be concrete, specific, structured, and practical.

DO NOT stay high level.
DO NOT just repeat the SOP back to me.
DO NOT give generic advice.
DO NOT assume humans will “figure it out later.”
DO define actual objects, fields, statuses, workflows, rules, and automations.

The output must be rigorous enough that:
- a no-code builder could build it
- a systems admin could configure it
- a software engineer could implement it
- an ops manager could run it
- a leadership team could approve it

Design principles:
- simple enough for operations staff to use daily
- premium client experience at the front
- rigorous operations at the back
- scalable as the company grows
- strong accountability and ownership
- minimal ambiguity
- minimal duplicate data entry
- template-driven
- audit-friendly
- supports exceptions cleanly
- suitable for repeatable use

Business context:
This system is for Tech Anywhere’s Manila client visit operations.
It needs to support client visits involving:
- visiting client stakeholders
- Manila office coordination
- internal team attendance
- travel and accommodation logistics
- transport booking
- office readiness
- client communications
- hospitality
- expenses and reimbursements
- post-visit review and continuous improvement

There are also client-specific policy differences. For example, some clients may have different reimbursement rules or different assumptions about whether remote staff travel is covered. The system must support account-specific policy overrides without becoming messy.

I want your response in the exact structure below.

======================================================================
SECTION 1 — EXECUTIVE SUMMARY
======================================================================

Provide a concise but intelligent executive summary of the system being proposed, including:
- what the system is
- what business problem it solves
- who uses it
- why it matters
- what good looks like

======================================================================
SECTION 2 — END-TO-END WORKFLOW MAP
======================================================================

Map the full lifecycle from visit initiation to closeout.

Break the workflow into clear phases such as:
- visit initiation
- pre-arrival planning
- travel and logistics coordination
- office and team preparation
- client communications
- developer attendance coordination
- hospitality management
- live visit execution
- expense/reimbursement handling
- post-visit wrap-up
- retrospective and process improvement

For each phase define:
- trigger
- inputs
- activities
- outputs
- owner
- dependencies
- failure risks

======================================================================
SECTION 3 — CORE SYSTEM OBJECTS / DATA ENTITIES
======================================================================

Define the core objects the system should contain.

At minimum, assess and define whether the system should include these objects:
- Visit
- Client Account
- Client Attendee
- Internal Attendee
- Travel Requirement
- Transport Booking
- Accommodation Booking
- Office Readiness Checklist
- Communication Log
- Visit Task
- Expense Claim
- Reimbursement Policy
- Exception Approval
- Daily Operations Log
- Post-Visit Review
- Template Library
- Vendor / Supplier Record

If you think there should be more objects, add them.

For each object explain:
- what it represents
- why it exists
- how it relates to other objects

======================================================================
SECTION 4 — DETAILED FIELD DEFINITIONS FOR EVERY OBJECT
======================================================================

For every object, define:
- field name
- field type
- description
- required vs optional
- validation logic
- default values where relevant
- relationship to other objects
- example value

Be exhaustive.

I want this to be detailed enough that it could become a schema and field dictionary.

Examples of the kind of precision I expect:
- Visit Status: single-select enum
- Client Arrival DateTime: datetime
- Receipt Attached: boolean
- Driver Contact Number: string
- Policy Override Reason: long text
- Office WiFi Confirmed: boolean
- Attendance Confirmed At: datetime
- Expense Currency: enum
- Client Dietary Requirements: long text

Also clearly identify:
- mandatory MVP fields
- nice-to-have future fields

======================================================================
SECTION 5 — STATUS MODEL / STATE TRANSITIONS
======================================================================

Design the lifecycle states for the major objects.

At minimum define state models for:
- Visit
- Visit Task
- Transport Booking
- Accommodation Booking
- Expense Claim
- Post-Visit Review

For each, define:
- valid statuses
- what each status means
- what causes status transitions
- what transitions are blocked
- what automations/reminders should fire on transition
- who can change the status

Example for Visit:
- Draft
- Proposed
- Awaiting Confirmation
- Confirmed
- In Planning
- Ready for Arrival
- Active
- Completed
- Closed
- Cancelled

But refine this if needed.

======================================================================
SECTION 6 — USER ROLES AND PERMISSIONS
======================================================================

Define the roles that should exist in the system.

At minimum assess:
- Super Admin
- Operations Admin
- Visit Lead
- Department Lead
- Finance Approver
- Office Support/Admin
- Client-Facing Coordinator
- Leadership / Read-only Stakeholder

For each role define:
- purpose
- what they can create
- what they can edit
- what they can approve
- what they can close
- what they can override
- what they can only view
- access restrictions

Then provide a permission matrix.

======================================================================
SECTION 7 — BUSINESS RULES AND EXCEPTIONS
======================================================================

Define the explicit business rules.

I want precise policy logic, not vague commentary.

Include rules for:
- visit readiness
- mandatory planning fields
- communications deadlines
- internal attendance confirmation
- travel support eligibility
- accommodation approval rules
- transport booking requirements
- receipt and reimbursement rules
- per diem caps
- client-specific policy overrides
- escalation logic
- closure requirements
- audit requirements

Include examples such as:
- No visit can move to Ready for Arrival unless all mandatory pre-arrival items are complete.
- No final itinerary communication can be sent unless transport details and office details are populated.
- No expense claim can be approved without receipt unless an exception approval record exists.
- Certain clients may override standard remote travel reimbursement rules.
- Interact-style exceptions should be handled via policy configuration, not ad hoc behaviour.

Then define the exception-handling model:
- what counts as an exception
- who can approve it
- how it is logged
- how it impacts reporting
- how it expires or persists

======================================================================
SECTION 8 — AUTOMATION DESIGN
======================================================================

Design the system automations in detail.

Categorise each automation as:
- Must-have for MVP
- Important for V1
- Nice-to-have for V2

For each automation define:
- name
- trigger
- conditions
- action
- owner notified
- fallback if automation fails

Examples of automation areas:
- create default planning checklist when visit is created
- generate tasks based on visit type
- remind owner to confirm attendees
- alert if arrival is within X days and no transport is booked
- alert if office readiness is incomplete 48 hours before office day
- generate itinerary draft from visit data
- generate client communication drafts
- remind internal attendees to confirm
- escalate missing approvals
- trigger post-visit wrap-up tasks
- create retrospective tasks after visit end date
- flag receiptless expense claims
- surface repeated problems across visits

======================================================================
SECTION 9 — FORMS, SCREENS, VIEWS, AND DASHBOARDS
======================================================================

Design the user experience structure.

I want you to define:
- what forms are needed
- what key screens/pages are needed
- what list views are needed
- what dashboards each role should see

At minimum include design thinking for:
- new visit intake form
- client attendee form
- internal attendee form
- transport booking form
- accommodation booking form
- office readiness checklist view
- visit command centre / operations dashboard
- expense submission form
- exception approval form
- post-visit review form
- template management screen

Define recommended views such as:
- upcoming visits
- arrivals in next 7 days
- missing transport assignments
- visits at risk
- internal attendance not confirmed
- expenses pending approval
- post-visit reviews overdue
- client-specific visit history

For dashboards, define what each role needs to see daily.

======================================================================
SECTION 10 — COMMUNICATION DESIGN
======================================================================

Design the communication model.

I want:
- required communication touchpoints
- send timing
- owner
- dependencies
- delivery method
- whether it should be manual, automated, or generated-as-draft

At minimum include templates for:
- initial planning email
- itinerary confirmation email
- day-before arrival message
- driver details message
- office information pack email
- internal attendance confirmation request
- internal logistics confirmation message
- post-visit thank-you email
- post-visit follow-up summary

Make the templates polished, professional, warm, and operationally clear.

======================================================================
SECTION 11 — EXPENSES, REIMBURSEMENTS, AND POLICY ENGINE
======================================================================

Design the reimbursement logic in a structured way.

Define:
- standard reimbursement categories
- eligibility rules
- receipt requirements
- approval flow
- exception flow
- meal/per diem logic
- transport claim logic
- accommodation claim logic
- audit requirements
- policy override handling by client account or visit type

Show how the system should support both:
- standard company-wide policy
- client/account-specific exceptions

Provide a practical model for:
- no receipt, no reimbursement
- approved exception pathways
- configurable per diem caps
- approval thresholds
- finance visibility
- reporting on policy breaches or exceptions

======================================================================
SECTION 12 — REPORTING AND METRICS
======================================================================

Define what reporting leadership and operations would care about.

Include reports such as:
- visits by status
- visits by client
- upcoming visits
- logistics readiness score
- office readiness completion
- attendance confirmation rates
- number of exceptions by client
- reimbursement totals by visit
- policy breach counts
- transport issues
- post-visit review completion rate
- recurring operational issues
- vendor performance

Also include KPI recommendations.

======================================================================
SECTION 13 — MVP RECOMMENDATION
======================================================================

Now define the MVP.

I want you to decide:
- what absolutely must exist in version 1
- what can stay manual initially
- what should be deferred
- what the leanest usable system looks like

Make this practical for a lean ops team.

Clearly label:
- MVP scope
- V1 enhancement scope
- V2 future-state scope

======================================================================
SECTION 14 — PLATFORM RECOMMENDATIONS
======================================================================

Recommend the best implementation approaches.

Compare options such as:
- Airtable
- Notion + forms + automations
- ClickUp
- Monday.com
- HubSpot custom objects
- Asana + forms
- a custom internal web app
- CRM-integrated custom workflow solution

For each option assess:
- speed to launch
- cost
- flexibility
- ease of admin
- automation power
- reporting
- permissions
- long-term scalability
- overall suitability for this use case

Then recommend:
- best fast-start option
- best long-term option
- best low-cost option
- best option if integrated deeply with CRM/ops/finance later

======================================================================
SECTION 15 — IMPLEMENTATION ROADMAP
======================================================================

Create a phased roadmap.

At minimum include:
- discovery/finalisation
- MVP build
- testing/UAT
- launch
- training
- post-launch iteration
- phase 2 improvements

For each phase define:
- objectives
- outputs
- risks
- dependencies
- owners
- timeline assumptions

======================================================================
SECTION 16 — BUILD BACKLOG
======================================================================

Break the solution into:
- epics
- features
- user stories
- tasks
- acceptance criteria

Structure it in a way that a builder, PM, or engineer could work from directly.

Prioritise everything as:
- P0
- P1
- P2

======================================================================
SECTION 17 — QA / UAT TEST PLAN
======================================================================

Provide a practical QA and user acceptance testing plan.

Include:
- critical test scenarios
- happy paths
- exception paths
- policy override tests
- late-booking tests
- receipt-missing tests
- permission tests
- dashboard visibility tests
- communication trigger tests
- closure validation tests

======================================================================
SECTION 18 — ADMIN OPERATING GUIDE
======================================================================

Write a concise but usable admin guide for whoever runs the system internally.

Include:
- how to create a visit
- how to manage templates
- how to configure policy rules
- how to handle exceptions
- how to update dashboards
- how to maintain data quality
- how to close visits properly
- how to review operational issues over time

======================================================================
SECTION 19 — EXAMPLE RECORDS AND EXAMPLE WORKFLOWS
======================================================================

Create realistic example records showing how the system works in practice.

Include sample examples for:
- a confirmed client visit
- client attendees
- internal attendees
- travel coordination
- transport bookings
- office readiness
- communications log
- expenses
- exception approval
- post-visit review

Then walk through at least two full example workflows:
1. a standard client visit
2. a client visit with policy exceptions and remote staff travel support

======================================================================
SECTION 20 — RISKS, FAILURE POINTS, AND DESIGN WATCHOUTS
======================================================================

Identify:
- likely operational failure points
- system adoption risks
- data quality risks
- automation risks
- policy ambiguity risks
- overengineering risks
- underbuilding risks

Then explain how to mitigate them.

======================================================================
SECTION 21 — FINAL RECOMMENDATION
======================================================================

End with:
- the best recommended operating model
- the best recommended MVP
- the best platform recommendation
- the best rollout approach

Now here is the SOP you must use as the source operating logic.

==================================================
SOP: TECH ANYWHERE MANILA CLIENT VISIT SOP
==================================================

Title:
Tech Anywhere Manila Client Visit SOP
Delivering a seamless, high-touch onsite experience for visiting client teams

1. Purpose

This SOP sets the standard for how Tech Anywhere plans, coordinates, and delivers client visits to Manila. Its purpose is to ensure every client visit is smooth, professional, well-communicated, and valuable for both the client and our local teams.

The process is designed to create a consistent experience across all visits, while allowing flexibility for individual client needs, team structures, and business objectives.

2. Experience Standard

Every Manila client visit should feel:
- Prepared — no ambiguity around schedules, transport, or logistics
- Welcoming — clients feel looked after from arrival to departure
- Efficient — time onsite is purposeful and well organised
- Connected — clients have meaningful engagement with their teams
- Professional — every touchpoint reflects care, quality, and control

Our goal is not simply to host a visit.
Our goal is to create a high-confidence client experience that strengthens trust, relationships, and long-term partnership value.

3. Scope

This SOP applies to all client visits involving:
- client stakeholders travelling to Manila
- onsite meetings with dedicated developers or support teams
- internal team coordination for client-facing office days
- travel, accommodation, transport, hospitality, and visit logistics

This SOP can also be adapted for:
- leadership visits
- partner visits
- internal strategy visits involving Manila-based teams

4. Guiding Principles

When planning a client visit, the following principles apply:

4.1 Be proactive
Clients should never have to chase basic information such as office address, driver details, or daily schedules.

4.2 Remove uncertainty
The more clearly we communicate before arrival, the more comfortable and confident the client will feel.

4.3 Sweat the details
Wi-Fi access, umbrellas, transport buffers, coffee runs, and attendee coordination all matter. Small details shape the overall experience.

4.4 Respect people’s time
Meetings, office days, and logistics should be tightly coordinated and clearly communicated.

4.5 Design for repeatability
Every visit should improve the next one. Processes, templates, and learnings should be reusable.

5. Roles and Responsibilities

5.1 Visit Lead
The Visit Lead is the single point of accountability for the client visit.

Responsible for:
- overall visit coordination
- client communications
- itinerary management
- internal task ownership
- issue resolution
- post-visit review

5.2 Operations / Logistics Coordinator
Supports the Visit Lead with planning and execution.

Responsible for:
- travel and hotel coordination
- transport bookings
- office readiness
- daily hospitality support
- receipt tracking and reimbursements

5.3 Client Team Manager / Department Lead
Ensures the relevant internal team is ready and aligned.

Responsible for:
- confirming staff attendance
- preparing developers for onsite engagement
- identifying client-specific requirements
- ensuring team professionalism during the visit

5.4 Office Support / Admin Support
Supports the onsite experience during visit days.

Responsible for:
- refreshments
- room readiness
- visitor comfort
- ad hoc onsite support
- coordinating meal and coffee runs if required

6. Visit Workflow Overview

The Manila client visit process is divided into six phases:
1. Visit Initiation
2. Pre-Arrival Planning
3. Travel and Logistics Coordination
4. Office and Team Preparation
5. Onsite Delivery
6. Post-Visit Wrap-Up

7. Phase 1: Visit Initiation

This phase begins once a client confirms they are visiting Manila, or once a likely visit window is identified.

7.1 Confirm visit basics
Capture the following as early as possible:
- client company name
- names and roles of visitors
- purpose of visit
- preferred visit dates
- expected office days
- any planned social / team engagement
- any high-priority meetings or objectives

7.2 Define visit goals
The Visit Lead should clarify:
- What does success look like for this visit?
- Who needs to meet whom?
- What needs to happen onsite?
- Are there strategic conversations, workshops, or team sessions required?
- Are there any sensitive or high-priority topics to prepare for?

8. Phase 2: Pre-Arrival Planning

8.1 Pre-arrival checklist

The following must be confirmed no later than 7 calendar days before arrival, or sooner where possible:

Client details
- full names of all visitors
- mobile numbers / WhatsApp numbers
- flight details
- hotel details
- dietary requirements
- accessibility requirements
- meeting preferences
- any special requests

Internal coordination
- internal owner for the visit
- confirmed internal attendees
- confirmed leadership attendance
- confirmed developer attendance
- confirmed office location and working space
- confirmed meeting rooms or breakout space

Visit planning
- draft itinerary prepared
- airport pickup plan confirmed
- office access details ready
- Wi-Fi details ready
- contingency contacts prepared
- hospitality plan confirmed

9. Phase 3: Travel and Logistics Coordination

9.1 Airport pickup and transport
A dedicated transport plan must be arranged for the client from arrival to departure.

Standard
- pre-book suitable vehicle(s) for the number of guests and luggage
- confirm whether a driver is retained for the full visit or per day
- ensure tolls, parking, driver allowances, and related costs are prepaid or otherwise resolved in advance
- ensure the client is never placed in a position where they must negotiate or manage local transport logistics themselves unless explicitly preferred

9.2 Driver communications
The client must receive driver details in advance, including:
- driver name
- vehicle type
- vehicle registration if available
- contact number
- pickup instructions
- timing and meeting point

Where different drivers are used across multiple days, those details should be sent day-by-day in advance.

9.3 Arrival plan
The Visit Lead should prepare a clear arrival plan that answers:
- who is collecting the client?
- where will they be met?
- how will the client identify the driver or host?
- where are they going first?
- who is the first point of contact if there is a delay?

9.4 Guest comfort items
Recommended standard inclusions for Manila visits:
- umbrellas available in vehicle or office
- bottled water available in vehicle and office
- local emergency contact details
- office map / arrival instructions
- weather-aware guidance where relevant

10. Phase 4: Office and Team Preparation

10.1 Office preparation checklist

At least 48 hours before the first office day, confirm:
- office address is correct and communicated
- office floor / unit details are accurate
- reception or building access instructions are available
- meeting rooms are reserved
- seating plan is ready
- Wi-Fi name and password are tested and documented
- screens / AV / video conferencing equipment are tested
- power access and adapters are available if needed
- bathrooms / pantry / shared spaces are presentable
- coffee, tea, water, and refreshments are stocked
- signage or welcome naming is prepared where appropriate

10.2 Team readiness
Developers and internal attendees should know:
- which days they must attend onsite
- arrival time
- dress expectations
- who they are meeting
- purpose of the visit
- expected level of participation
- any client sensitivities or discussion priorities

The onsite team should present as organised, engaged, and client-ready.

11. Phase 5: Client Communications Standard

Client communication should feel warm, confident, and highly organised.

11.1 Pre-arrival communication timing
Recommended cadence:
- 10–14 days before: initial coordination email
- 5–7 days before: confirmed itinerary and logistics summary
- 1–2 days before: final welcome note with day-one reminder
- Day of arrival: live check-in / arrival support

11.2 Client communications template

Initial coordination email
Subject: Your Manila Visit – Planning and Logistics

Hi [Client Name],

We’re looking forward to welcoming you to Manila.

To make sure everything is organised ahead of your visit, we’ll coordinate the key logistics with you in advance, including airport transfers, office attendance, itinerary planning, and any preferences or requirements you’d like us to account for.

To help us prepare, could you please confirm the following when convenient:
- names of all attendees
- flight details
- hotel details
- any dietary or accessibility requirements
- any specific meetings or objectives you’d like included during the visit
- any preferences for team sessions, social dinners, or one-on-one time with the team

Once we have the above, we’ll send through a consolidated visit plan.

Looking forward to hosting you.

Best,
[Name]

Confirmed itinerary email
Subject: Your Manila Visit – Confirmed Itinerary and Arrival Details

Hi [Client Name],

Ahead of your visit, please find below your current Manila itinerary and support details.

Arrival
- Arrival date/time:
- Airport:
- Pickup contact:
- Driver name:
- Driver contact:
- Vehicle details:

Accommodation
- Hotel:
- Address:

Office Details
- Office address:
- Floor / suite:
- Wi-Fi:
- Primary contact onsite:

Visit Schedule
- [Day / time / activity]
- [Day / time / activity]

Support
If you need anything at any point during the visit, please contact:
- [Primary contact]
- [Secondary contact]

We’re looking forward to seeing you soon.

Best,
[Name]

Day-before arrival message
Hi [Client Name], just a quick note to say we’re all set for your arrival tomorrow. Your driver details are below for convenience:

[Insert details]

Safe travels, and please message us anytime if you need support en route.

12. Phase 6: Developer Attendance and Logistics

12.1 Developer attendance checklist
For each developer or internal attendee, confirm:
- full name
- location
- whether they are Manila-based or require travel
- required office dates
- transport requirements
- accommodation requirements
- manager confirmation
- attendance confirmation received

12.2 Travel support rules
For client visits, remote staff may be supported with transport and accommodation where attendance in Manila is required for business purposes.

Support may include:
- flights or long-distance travel
- hotel accommodation near office
- local transport
- meals within agreed daily limits

All support must be pre-approved by the Visit Lead or relevant manager.

12.3 Attendance expectations
Internal attendees are expected to:
- arrive on time
- present professionally
- participate constructively
- remain available during agreed onsite hours
- communicate promptly if delayed or unable to attend

13. Hospitality Standards

Hospitality is part of the client experience, not an afterthought.

13.1 Office hospitality standard
Minimum standard:
- tea, coffee, and water available throughout the day
- regular check-ins on guest comfort
- lunch plan clear in advance
- coffee / snack runs available during longer office sessions
- clean and professional shared spaces

13.2 Hosting etiquette
The onsite team should:
- greet clients promptly
- avoid leaving visitors unattended unnecessarily
- proactively offer refreshments
- guide clients through the office environment
- introduce team members intentionally, not casually
- create a warm but professional atmosphere

13.3 Social coordination
Where dinners, drinks, or social sessions are planned:
- confirm venue in advance
- confirm attendees
- consider travel time and fatigue
- account for dietary preferences
- ensure the event supports the relationship objective of the visit

14. Reimbursement Rules

14.1 General rule
Any reimbursable expense relating to a client visit must be:
- pre-approved
- business-related
- supported by a valid receipt where possible
- submitted within the required timeframe

14.2 Receipt standard
No receipt, no reimbursement unless an explicit exception has been approved.

Accepted reimbursement categories may include:
- transport
- accommodation
- meals
- approved incidentals directly related to the visit

14.3 Per diem / meal limits
Where meal support is provided, a daily allowance or maximum claim value should be communicated in advance.

This may be handled as:
- receipt-based reimbursement up to a daily cap, or
- approved per diem with supporting documentation requirements

14.4 Submission process
Expense claims must include:
- claimant name
- date
- reason for expense
- amount
- receipt / proof of payment
- visit/client reference

Claims should be submitted through the approved internal system or interim finance process.

14.5 Client-specific exceptions
Where a client account has specific contractual or operational rules around office attendance, travel, or transport, those rules must be documented separately and followed accordingly.

15. Onsite Delivery Checklist

Each visit day should begin with a short internal readiness check:
- client schedule confirmed
- driver / transport confirmed
- office space ready
- attendees present or en route
- refreshments stocked
- meeting materials ready
- decision-makers aware of key timings
- backup contact available

At the end of each day, the Visit Lead should review:
- what was completed
- what changed
- any client requests for the next day
- any issues needing escalation
- whether tomorrow’s schedule needs adjustment

16. Post-Visit Wrap-Up

16.1 Post-visit checklist
Within 2 business days of the visit ending:
- send thank-you note to client
- confirm any follow-up actions
- capture visit outcomes and decisions
- document any issues or lessons learned
- finalise outstanding reimbursements
- store itinerary, contacts, and templates for reuse

16.2 Internal debrief
A short internal debrief should cover:
- what went well
- what could be improved
- any logistics issues
- any relationship insights
- any staffing or process implications
- updates needed for future SOP versions

16.3 Continuous improvement
Each visit should strengthen the SOP. Templates, checklists, and vendor preferences should be refined after every trip.

17. Success Measures

A Manila client visit is considered successful when:
- the client feels informed and supported throughout
- transport and logistics run without confusion
- onsite attendance is complete and well managed
- the office environment is prepared and professional
- the client has meaningful time with their team
- there are no unresolved reimbursement or coordination issues
- internal follow-up is completed promptly
- the visit strengthens client confidence in Tech Anywhere

18. Appendix A – Master Pre-Arrival Checklist

Client
- attendee names confirmed
- flight details confirmed
- hotel confirmed
- dietary requirements confirmed
- accessibility requirements confirmed
- special requests confirmed

Logistics
- airport transfer booked
- driver details received
- driver details sent to client
- umbrellas arranged
- local contact sheet prepared
- emergency fallback plan prepared

Office
- office address confirmed
- room bookings confirmed
- Wi-Fi tested
- signage / welcome setup prepared
- refreshments stocked
- AV tested

Internal team
- attendee list confirmed
- developers notified
- travel needs confirmed
- hotels booked if required
- managers aligned
- key leaders briefed

Communications
- initial coordination email sent
- itinerary email sent
- day-before reminder sent
- day-of arrival contact active

19. Appendix B – Post-Visit Checklist

- thank-you email sent
- actions captured
- reimbursements submitted
- receipts collected
- lessons learned documented
- templates updated
- vendor notes updated
- next steps assigned

Important final instruction:
Wherever possible, present information in structured tables and clearly-labelled sections. Make the result detailed, build-ready, and highly practical.

If you need to make assumptions, make them explicit and sensible.
If there are trade-offs, explain them clearly.
If something should be configurable rather than hard-coded, say so.
If something should stay manual in MVP, say so.
If something is risky, flag it.

Now produce the complete system design.
```
