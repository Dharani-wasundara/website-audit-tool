# Assignment submission — WebAudit

Use this checklist when turning in the project. Replace the bracketed placeholders with your real links.

---

## 1. GitHub repository

**Repository URL:**  
`[https://github.com/YOUR_USERNAME/YOUR_REPO]` *(public, or private with reviewer access granted)*

---

## 2. Deployed application

**Live URL:**  
`[https://your-deployment.vercel.app]` *(or your hosting provider)*

Deployment notes: configure the same environment variables as in `.env.example` / README (`FIRECRAWL_API_KEY`, `GEMINI_API_KEY`, etc.) on the host.

---

## 3. Prompt logs — confirmation

**Included as required.**

Prompt logging is part of every successful audit:

- **API:** `POST /api/audit` returns a `promptLog` object (`systemPrompt`, `userPrompt`, `rawModelOutput`, `model`, token counts, `timestamp`).
- **UI:** On the **Results** page, expand **Prompt log** to view the full system prompt, user prompt, and raw model output; use **Download JSON** to save the same object as a `.json` file for review.

Reviewers can confirm logs by running an audit on the deployed site (or locally) and opening the prompt log section or downloading the JSON.

---

*Project: WebAudit — deterministic metrics (Firecrawl + Cheerio) + Gemini structured insights.*
