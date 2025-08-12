Hi Claude, this is your working memory document.

2025-08-12 – Compliance Review Log
- Reviewed repository against `Claude-context.md` and Context Files.
- Findings: Hardcoded mock data in `js/blog.js` and `js/podcast.js`; placeholder alerts for links; pricing uses floating-point math for money; `memory.md` previously empty.
- Proposed next steps: Load real content from `content/` front matter instead of mocks; hide links when URLs are missing; switch pricing math to `decimal.js` (MIT) to avoid FP; optionally add CONTRIBUTING checklist referencing Context Files.
- Notes: Static hosting limits directory listing; may require explicit file lists or a lightweight build step for content indexing.

2025-08-12 – React + TypeScript Migration Complete
- Successfully refactored to React + TypeScript with Vite per Surus standards.
- Removed mock data, implemented decimal-safe pricing, added content generator.
- Build passes locally, committed and pushed to GitHub.
- Issue: Netlify site (https://aug5-surus-website.netlify.app/) loading empty/blank.
- Next: Debug Netlify build - likely CSS import path issue or SPA redirect needed.

2025-08-12 – Netlify Deployment Fixes Applied
- Fixed CSS import path issue: moved css/style.css → public/css/style.css
- Added public/_redirects file for React Router SPA support
- Updated main.tsx CSS import to relative path: '../public/css/style.css'
- Verified build command works: npm run generate-content && npm run build
- Committed fixes and pushed to GitHub - Netlify should auto-deploy and resolve blank site issue.

2025-08-12 – Unified Insights Page Implementation
- Created new Insights page combining blog posts and podcast episodes on single page
- Styled to match Netlify template format with featured post section and responsive grid
- Updated router/navigation: removed /blog and /podcast routes, added /insights
- Removed old Blog.tsx and Podcast.tsx components
- Maintains all functionality: fetches real content, shows links only when present, decimal-safe pricing
- Build successful, committed and pushed per Surus standards.
