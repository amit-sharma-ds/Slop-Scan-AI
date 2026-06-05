<div align="center">

# 🔍 SlopScan AI

### GitHub PR Review Analyzer — Real Signals. No Noise. Zero Tolerance for Slop.

[![Next.js](https://img.shields.io/badge/Framework-Next.js%2015-black?style=flat-square&logo=nextdotjs)](https://nextjs.org/)
[![Stack](https://img.shields.io/badge/Stack-Full%20Stack-blueviolet?style=flat-square)](#tech-stack)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](./LICENSE)
[![Hackathon](https://img.shields.io/badge/Open%20Source%20Hackathon-2026-orange?style=flat-square)](#open-source-hackathon-2026)
[![Live App](https://img.shields.io/badge/Live%20App-Vercel-cyan?style=flat-square&logo=vercel)](https://pull-request-analyzer.vercel.app/)

<br/>

**Point it at any public GitHub PR. Get the truth.**  
*An AI-powered pull request analyzer that detects low-quality reviews, scores reviewer credibility, and surfaces real engineering signal — in seconds.*

<br/>

[![Live App](https://img.shields.io/badge/🚀%20Try%20It%20Live-pull--request--analyzer.vercel.app-cyan?style=flat-square)](https://pull-request-analyzer.vercel.app/)
[![SlopScan Demo](https://img.shields.io/badge/▶%20Watch%20Demo-Google%20Drive-red?style=flat-square)](https://drive.google.com/file/d/1zOsdyz5BG1Vwe_ts2Lc9bhSfRHUxY9EK/view?usp=drive_link)

<br/>

<img src="https://raw.githubusercontent.com/amit-sharma-ds/Slop-Scan-AI/main/Screenshots/App_View.png" alt="SlopScan App View" width="100%"/>

<br/>

<img src="https://raw.githubusercontent.com/amit-sharma-ds/Slop-Scan-AI/main/Screenshots/Graph-Analysis.png" alt="SlopScan Graph Analysis" width="100%"/>

</div>

---

## What is SlopScan AI?

Most code review tools tell you *what* was said. SlopScan tells you *whether it's worth listening to*.

**The problem**: AI-generated reviews, vague LGTM comments, and low-effort feedback are flooding modern PRs — making it harder for developers to know which feedback actually matters.

**SlopScan fixes this**: paste any public GitHub PR URL and get an instant Slop Score, reviewer credibility breakdown, flagged comments, and an engineering quality brief — all from real PR data.

### The Real-World Problem It Solves

| Problem | How SlopScan Fixes It |
|---|---|
| AI-generated reviews look legitimate but add no value | NLP heuristics detect patterns of low-signal, templated review language |
| Developers waste time parsing noise from real feedback | Flagged comments panel isolates the slop so you can ignore it faster |
| No visibility into reviewer credibility or history | Per-reviewer Slop Score + credibility insight surfaced per PR |
| Code review quality is invisible and unmeasured | Radar chart + detection mix visualize review health at a glance |
| Rate-limited or blocked GitHub APIs break tooling | Demo fallback mode keeps the app functional even without API access |

---

## 🏆 Open Source Hackathon 2026

> *Submitted for Open Source Hackathon 2026.*

**SlopScan AI** is an open-source developer tool built to solve a real and growing problem: the degradation of code review quality in the age of AI-generated everything. It uses real GitHub API data, a custom NLP scoring engine, and a full analytics dashboard — no black-box APIs, no subscription required.

**The core thesis**: a PR review should be scored the same way we score any information source — by specificity, actionability, and signal-to-noise ratio. SlopScan operationalizes that.

---

## Scoring Pipeline: From PR to Slop Score

> No GPT calls. No paid APIs. No magic black box.  
> This is **heuristic NLP scoring built from first principles** on real GitHub metadata.

### The Full Pipeline

```
┌─────────────────────────────────────────────────────────────────────┐
│                     SLOPSCAN SCORING PIPELINE                       │
└─────────────────────────────────────────────────────────────────────┘

  USER INPUT (public GitHub PR URL)
       │
       ▼
┌──────────────────┐
│  FETCH           │  GitHub REST API
│                  │  → PR metadata (title, description, labels)
│  "Data Pull"     │  → Review comments + inline comments
│                  │  → Commit messages + diff summary
└────────┬─────────┘
         │  raw PR data
         ▼
┌──────────────────┐
│  PARSE           │  Comment Extractor
│                  │  → Normalize text per reviewer
│  "Pre-process"   │  → Strip markdown, code blocks, formatting
│                  │  → Segment by comment type (review / inline / reply)
└────────┬─────────┘
         │  cleaned comment corpus
         ▼
┌──────────────────┐
│  SCORE           │  Heuristic Scoring Engine
│                  │  → Vagueness signals (LGTM, looks good, nice, +1)
│  "Slop Engine"   │  → Template pattern detection (generic AI phrasing)
│                  │  → Specificity score (line refs, function names, context)
│                  │  → Actionability check (does it suggest a concrete change?)
│                  │  → Length/depth ratio (thin praise vs substantive critique)
└────────┬─────────┘
         │  per-comment scores
         ▼
┌──────────────────┐
│  AGGREGATE       │  PR-Level Rollup
│                  │  → Weighted Slop Score (0–100) per reviewer
│  "Rollup"        │  → Overall PR review health score
│                  │  → Detection mix breakdown (% each slop type)
│                  │  → Flagged comment list with reason tags
└────────┬─────────┘
         │  structured analytics object
         ▼
┌──────────────────┐
│  VISUALIZE       │  Dashboard Renderer
│                  │  → Radar chart (6 review quality dimensions)
│  "Dashboard"     │  → Flagged comments panel with highlight + tag
│                  │  → AI intelligence brief (natural language summary)
│                  │  → Activity feed (real-time PR event timeline)
└──────────────────┘
```

### Slop Score Breakdown

| Signal | What It Detects | Weight |
|---|---|---|
| **Vagueness** | "LGTM", "looks good", "+1", "nice work" with no elaboration | High |
| **Template Patterns** | Generic AI-style phrasing, boilerplate structure | High |
| **Low Specificity** | No line references, no function/variable names, no file context | Medium |
| **Non-Actionability** | Observations without suggested changes or next steps | Medium |
| **Depth Ratio** | Comment length vs. information density | Low |
| **Reviewer History** | Credibility score derived from comment patterns across the PR | Low |

```
SlopScore(reviewer) = Σ  weight(signal) × score(signal, comment)
                     signal ∈ {vagueness, template, specificity, ...}

Normalized to 0–100. Higher = more slop. Under 30 = trustworthy reviewer.
```

---

## Architecture

```
slopscan-ai/
│
├── app/                        Next.js App Router
│   ├── page.tsx                Root — URL input + dashboard shell
│   ├── api/
│   │   ├── github/route.ts     GitHub REST API proxy + rate limit handler
│   │   └── analyze/route.ts    Scoring engine endpoint
│   └── layout.tsx
│
├── components/
│   ├── Dashboard.tsx           Top-level dashboard with tab navigation
│   ├── RadarChart.tsx          6-axis review quality radar (Recharts)
│   ├── FlaggedComments.tsx     Annotated comment list with slop tags
│   ├── DetectionMix.tsx        Donut/bar breakdown of slop signal types
│   ├── ActivityFeed.tsx        Real-time PR event timeline
│   ├── IntelBrief.tsx          AI-generated natural language summary
│   └── Sidebar.tsx             Left command panel + navigation
│
├── lib/
│   ├── scorer.ts               Core heuristic NLP scoring engine
│   ├── github.ts               GitHub API client + demo fallback
│   ├── patterns.ts             Slop pattern dictionaries + regexes
│   └── aggregator.ts           Per-reviewer + PR-level score rollup
│
└── public/
    └── demo/                   Static demo fixtures (fallback data)
```

### 3-State App Flow

```
         ┌─────────────────────────────────────┐
         │              HOME                    │
         │   Paste PR URL → Analyze             │
         └─────────────────┬───────────────────┘
                           │ fetch + score
                           ▼
         ┌─────────────────────────────────────┐
         │           DASHBOARD                  │
         │   Tabs: Overview / Flagged / Chart   │
         └─────────────────┬───────────────────┘
                           │ select reviewer
                           ▼
         ┌─────────────────────────────────────┐
         │           DEEP DIVE                  │
         │   Per-reviewer breakdown + export    │
         └─────────────────────────────────────┘
```

---

## Dashboard Features

### Flagged Comments Panel
Each flagged comment shows the original text, the reviewer, and a tag explaining *why* it was flagged — `[VAGUE]`, `[TEMPLATE]`, `[NO_ACTION]`, `[THIN]`. Not just a score — a reason.

### Radar Chart — 6 Review Dimensions
Plots each reviewer across: Specificity · Actionability · Depth · Originality · Context · Tone. Makes it visually obvious who's doing real work and who's generating noise.

### AI Intelligence Brief
A short natural language summary of the PR's review health — generated locally from the scored data. No LLM API call. Template-driven synthesis from aggregated signals.

### Detection Mix
Donut chart showing the proportion of each slop signal type found in the PR. Useful for spotting patterns: is this a vagueness problem? A template problem? Something else?

### Activity Feed
Chronological timeline of PR events — comments, commits, approvals, change requests — pulled from real GitHub API data.

### Demo Fallback
When the GitHub API is rate-limited or blocked, SlopScan loads realistic static fixture data so the full dashboard remains interactive and demonstrable.

---

## Getting Started

### Prerequisites
- Node.js 18+
- No external API keys required for demo mode

### Run Locally

```bash
# Clone
git clone https://github.com/yourusername/slopscan-ai.git
cd slopscan-ai

# Install
npm install

# Start
npm run dev
```

Open `http://localhost:3000`

### Optional: GitHub Token (Higher Rate Limits)

Create a `.env.local` file:

```env
GITHUB_TOKEN=your_personal_access_token_here
```

Without this, the app uses unauthenticated GitHub API (60 req/hr) and falls back to demo data when needed.

### How to Use

1. **Paste a public GitHub PR URL** into the input field
2. Click **Analyze** — real PR data is fetched and scored instantly
3. Review the **Slop Score** and **AI Intelligence Brief**
4. Explore **Flagged Comments** to see which reviews got tagged and why
5. Check the **Radar Chart** for per-reviewer quality breakdown
6. View the **Detection Mix** to understand what types of slop dominate
7. Scroll the **Activity Feed** for the full PR timeline

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend / UI** | Next.js 15, React, HTML5, CSS3 |
| **Backend / API Layer** | Next.js API Routes, Node.js |
| **Data Source** | GitHub REST API |
| **AI & Analysis** | Natural Language Processing (NLP), Custom Heuristic Scoring Engine, Slop Score Detection |
| **Visualization** | Radar Charts, Analytics Dashboard (Recharts) |
| **Deployment** | Vercel |

---

## License

MIT — use it, fork it, improve it, submit it.

---

<div align="center">

**Built for Open Source Hackathon 2026** · Next.js · GitHub API · NLP from Scratch

*"The best code review is the one that says something real."*

</div>
