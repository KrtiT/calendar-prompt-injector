# Deploy with clasp (optional)

1. Install clasp: `npm i -g @google/clasp`
2. Login: `clasp login`
3. Create a new Apps Script project or get an existing `scriptId`.
4. In `.clasp.json`, set `"scriptId"` to your project’s ID.
5. Push files: `clasp push` (accept prompts)
6. In the Apps Script UI:
   - **Services → + → Calendar API (Advanced)** → Add
   - Run `installTriggers()` once and authorize.
