# Development guidance for Codex

## Story canon (mandatory)
- Before writing or modifying narrative, character dialogue, chapter events, memory/flashback sequences, or endings, read `docs/story/master-plot.md`.
- Treat that document as the **internal story bible**. Its **確定設定** are canon. Its **未確定** and **有力な構想** are not canon; do not silently turn them into facts.
- Protect late-game reveals from early chapters: the current landlord is the former landlord; his memory loss followed his voluntary use of a fictional drug to flee guilt over wrongdoing as a low-ranking member of an organization; Moku knows the full truth from the beginning.
- Keep the original opening letter's double meaning intact, and preserve Moku's comedic behavior and characteristic speech.
- New resident incidents should gradually prompt fragmented memories, without prematurely revealing the core mystery.
- Preserve already-implemented scenes, save compatibility, and player-facing pacing unless the user explicitly requests a change.
- When proposing a new plot point, label it a proposal and obtain the user's decision before incorporating it as established canon.

## Implementation hygiene
- Keep secrets, API keys, and spoiler-heavy developer documents out of player-facing assets and dialogue.
- Note: this is a **public** GitHub repository; files under `docs/story/` can be read by anyone, even if they aren't linked from the game.
- Run the existing build and tests for gameplay changes whenever possible.

## Production deployment
- The user requests production deployment after each completed change. After building and passing the existing tests, commit the intended task changes and push to `main` to trigger `.github/workflows/deploy-pages.yml`.
- Verify the GitHub Pages workflow succeeds and report the production URL. If deployment fails, investigate and report the actual state.
- Exclude unrelated local files, credentials, and preview-only output from commits.
