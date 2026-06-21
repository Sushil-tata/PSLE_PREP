# DSA Prep — Interview Preparation Web App

A clean, production-ready starter for DSA interview preparation, built with **React + Vite + TypeScript + Tailwind CSS v4**.

## Features

- 📊 **Dashboard** — Stats overview, topic progress cards, recent activity
- 📂 **Topic Practice** — Browse problems by DSA topic with progress tracking
- 🔍 **Problem Detail** — Full problem view with attempt history, notes, status management
- 📅 **Revision Planner** — Schedule and track problems for spaced revision
- ⏱ **Mock Tests** — Timed interview simulations with scoring

## Tech Stack

| Tool | Purpose |
|------|---------|
| React 19 | UI framework |
| Vite 8 | Build tool & dev server |
| TypeScript 6 | Type safety |
| Tailwind CSS v4 | Styling |
| React Router v7 | Client-side routing |
| useReducer + Context | Lightweight state management |

## Project Structure

```
src/
├── components/
│   ├── layout/       # AppLayout, Sidebar
│   ├── problem/      # FilterBar, ProblemTable, TopicProgressCard
│   └── ui/           # Badge, Button, ProgressBar, StatCard
├── context/          # AppContext (global state via useReducer)
├── data/             # Sample JSON: problems, topics, mockTests, revisionPlan
├── hooks/            # useProblems, useFilters, useStats
├── pages/            # DashboardPage, TopicPracticePage, ProblemDetailPage,
│                     #   RevisionPlannerPage, MockTestsPage
├── types/            # Shared TypeScript types
└── utils/            # problemUtils (filtering, formatting, color helpers)
```

## Getting Started

```bash
npm install
npm run dev        # Start dev server at http://localhost:5173
npm run build      # Production build
npm run lint       # ESLint check
npm run type-check # TypeScript check
npm run preview    # Preview production build
```

## Problem Data Schema

Each problem follows this schema (see `src/data/problems.ts`):

```ts
type Problem = {
  id: string;
  title: string;
  slug: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  status: 'Not Started' | 'In Progress' | 'Solved' | 'Needs Review';
  tags: string[];
  companies: string[];
  frequency: number;     // 0–100 interview frequency score
  acceptance: number;    // acceptance percentage
  attempts: Attempt[];   // history of attempts
  notes: string;
  leetcodeUrl?: string;
  isPremium: boolean;
  isBookmarked: boolean;
};
```

## Routes

| Route | Page |
|-------|------|
| `/` | Dashboard |
| `/topics` | Topic Practice (all topics) |
| `/topics/:topicId` | Topic Practice (single topic) |
| `/problems/:slug` | Problem Detail |
| `/revision` | Revision Planner |
| `/mock-tests` | Mock Tests |
