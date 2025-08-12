# Contributing

Follow Surus context standards in `Context Files/` and `Claude-context.md`.

## Pre-commit checklist
- [ ] No mock data or placeholder alerts in `js/` (e.g., `onclick="alert(...)"`).
- [ ] Money/fees computed with decimal-safe arithmetic per guidelines.
- [ ] Blog/Podcast content sourced from `content/` (not hardcoded arrays).
- [ ] If you add or edit markdown in `content/`, run the generator.
- [ ] Update `memory.md` with progress and pitfalls.

## Commands
```bash
npm run generate-content
```

## Notes
- Podcast links must only render when a corresponding URL field exists in front matter (see `admin/config.yml`).
- Financial values should display with defined rounding (currency 0 decimals here; bps to 1 decimal).
