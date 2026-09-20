# Job Hunt Companion

A web application that helps job seekers track applications and prepare for technical interviews through spaced-repetition flashcard review.

## Overview

Job Hunt Companion combines two workflows that are usually handled in separate tools: a Kanban-style board for tracking job applications through their lifecycle, and a Leitner-system flashcard library for retaining technical knowledge ahead of interviews. Data for both is scoped per account, so each signed-in user works with their own independent set of jobs and cards.

## Features

**Job tracking**
- Kanban board with four stages: Applied, Interview, Offer, Rejected
- Drag-and-drop between stages, with click-to-edit on any card
- Structured job records: company, role, tags, applied date, interview date, notes

**Flashcard review**
- Leitner spaced-repetition system across five boxes, each with its own review interval
- A daily due-cards queue that updates automatically based on each card's next review date
- Full flashcard library with tag-based filtering and progress tracking
- A flip-card review interface for going through due cards one at a time

**Dashboard**
- A single overview combining application stats, upcoming interviews, and today's due flashcards

**Accounts**
- Email/password signup and login, plus a guest mode
- Each account's data is isolated in local storage; new accounts start empty
- Data persists across sessions for returning users under the same email

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript |
| Build tool | Vite |
| Styling | Tailwind CSS |
| State management | Zustand |
| Routing | React Router |
| Drag and drop | dnd-kit |
| Icons | Lucide |
| Testing | Vitest |

## Project Structure

src/
├── components/
│ ├── ui/ Reusable primitives (Modal, Button, Input)
│ ├── jobs/ Job board components (JobCard, KanbanColumn, JobModal)
│ ├── flashcards/ Flashcard components (Flashcard, CardModal, ProgressDots)
│ ├── dashboard/ Dashboard-specific components (StatCard, InterviewListItem)
│ ├── layout/ Header, Sidebar, AppLayout
│ └── auth/ Route protection
├── pages/ Route-level page components
├── store/ Zustand stores (jobs, flashcards, auth, toasts)
├── hooks/ Custom hooks (Leitner algorithm)
├── types/ Shared TypeScript types
└── constants/ Design tokens


## Getting Started

### Prerequisites

- Node.js 18 or later
- npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app runs locally with hot module reload.

### Testing

```bash
npm run test
```

Runs the unit test suite, including the Leitner algorithm's core scheduling logic.

### Build

```bash
npm run build
```

Produces a production build in `dist/`.

## The Leitner System

Flashcards move between five boxes based on review outcomes:

| Box | Review interval |
|---|---|
| 1 | 1 day |
| 2 | 3 days |
| 3 | 7 days |
| 4 | 14 days |
| 5 | 30 days |

A correct answer moves a card up one box (capped at box 5). An incorrect answer resets it to box 1. A card is due for review once its next review date has passed, and the due-cards queue reflects this automatically each day without any manual scheduling.

## Notes

This project is a working prototype. Authentication is simulated locally and does not connect to a backend service; data lives entirely in the browser's local storage, scoped per account by email.
