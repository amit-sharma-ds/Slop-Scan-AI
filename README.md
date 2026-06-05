<div align="center">

# 🔍 SlopScan AI

### GitHub PR Review Analyzer — Real Signals. No Noise. Zero Tolerance for Slop.

[![Next.js](https://img.shields.io/badge/Framework-Next.js%2015-black?style=flat-square&logo=nextdotjs)](https://nextjs.org/)
[![Lines](https://img.shields.io/badge/Stack-Full%20Stack-blueviolet?style=flat-square)](#tech-stack)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](./LICENSE)
[![Hackathon](https://img.shields.io/badge/Open%20Source%20Hackathon-2026-orange?style=flat-square)](#hackathon-2026)
[![Demo](https://img.shields.io/badge/Demo-Live%20Preview-cyan?style=flat-square)](https://drive.google.com/file/d/1zOsdyz5BG1Vwe_ts2Lc9bhSfRHUxY9EK/view?usp=drive_link)

<br/>

**Point it at any public GitHub PR. Get the truth.**  
*An AI-powered pull request analyzer that detects low-quality reviews, scores reviewer credibility, and surfaces real engineering signal — in seconds.*

<br/>

[![SlopScan Demo](https://img.shields.io/badge/▶%20Watch%20Demo-Google%20Drive-red?style=flat-square)](https://drive.google.com/file/d/1zOsdyz5BG1Vwe_ts2Lc9bhSfRHUxY9EK/view?usp=drive_link)

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
