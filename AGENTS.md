# Development guidance for Codex

## Voice delivery (mandatory)
- All current and future characters must use clear, projected, expressive speech. Normal conversation should sound lively; never default to mumbling, whispering, ASMR, or breathy low-volume delivery, including inner monologues, flirtation, and sad scenes.
- Preserve scene-appropriate emotion and character identity through acting, without sacrificing intelligibility. Do not make tragic scenes cheerful.
- Apply this rule to new voice profiles and per-line repair overrides. Existing recordings require explicit scoped regeneration; changing settings alone does not update their audio.
- When replacing a reported recording, set `repairReview: true` and add a concise, factual `repairComment` to its voice manifest entry. This routes the repaired audio to rechecking even without the old local report; acceptance is tied to the current audio fingerprint. Do not mark historic mastering as a new repair or claim listening approval before the user confirms it.
- The audio review tool must open on initial unreviewed audio only, excluding accepted, reported, waiting-for-repair and repaired-awaiting-recheck recordings. Keep repaired-awaiting-recheck audio in the separate one-click repair review with correction comments. Preserve saved decisions and keep both queues separate after reopening.
- Voice review GitHub sync must use the dedicated private `Alicetel-u/FeralLife-voice-review` repository. Merge per-line decisions instead of replacing a PC's state wholesale. Never put review data or authentication credentials into public game assets; browser-entered tokens must remain in memory only. See `docs/voice-review-sync.md`.

## Story canon (mandatory)
- Before writing or modifying narrative, character dialogue, chapter events, memory/flashback sequences, or endings, read `docs/story/master-plot.md`.
- Treat that document as the **internal story bible**. Its **確定設定** are canon. Its **未確定** and **有力な構想** are not canon; do not silently turn them into facts.
- Protect late-game reveals from early chapters: the current landlord is the former landlord; his memory loss followed his voluntary use of a fictional drug to flee guilt over wrongdoing as a low-ranking member of an organization; Moku knows the full truth from the beginning.
- Keep the original opening letter's double meaning intact, and preserve Moku's comedic behavior and characteristic speech.
- New resident incidents should gradually prompt fragmented memories, without prematurely revealing the core mystery.
- Preserve already-implemented scenes, save compatibility, and player-facing pacing unless the user explicitly requests a change.
- When proposing a new plot point, label it a proposal and obtain the user's decision before incorporating it as established canon.

## Narrative presentation (mandatory)
- After a failed trouble, rewind to the beginning of that same trouble, preserving earlier resolved incidents. Keep the clock target and resumed dialogue consistent with that point; use this policy for future trouble implementations.
- After the dedicated post-loop dialogue, resume directly at the failed trouble's choices. Do not replay its opening, consultation, or battle introduction. Apply this to every future chapter (including acts three and four).
- Use `resumeStoryRewind` in `src/story-checkpoints.js` for this handoff; chapter-specific code must reconstruct the real unanswered incident before it returns. Preserve prior resolved incidents, failed-choice history, save compatibility, and the trouble's clock target. For multi-round battles, reset that trouble to its first round and initial meter.
- Keep post-loop portrait dialogue separate from minigame dialogue. Write it to end naturally before the choice screen; do not insert an opponent's battle lines into the portrait conversation. Verify direct choices after reload and repeated loops, and keep debug loop/choice destinations aligned.
- Keep dialogue and narration inside the story world. Do not describe chapter starts, checkpoints, choice branches, screen fades, or other implementation/staging instructions as narrative text. Describe what characters perceive instead.
- Developer menus may use technical labels, but their scene names must match their actual destinations and current scenario definitions.
- Keep debug scene-select destinations for each trouble's opening, post-rewind dialogue, and immediate pre-choice state. Build these through the real scenario/rewind logic, preserve normal saves, and paginate menus to fit one mobile screen as points grow.

## Screen presentation (mandatory)
- Do not add decorative top/bottom mastheads, English slogans, footer captions, or corner serial numbers to title/chapter/result/cinematic screens. The user explicitly rejected the shared KEMONOSOU/CHAPTER header and English footer framing.

## Mobile presentation (mandatory)
- The mobile game must fit within one visible screen without scrolling. This is a standing user preference.
- Use the dynamic viewport and safe-area insets; fit titles, chapter cards, endings, text, and action buttons together. Do not merely hide overflow while leaving content or buttons off-screen.
- For content that cannot fit, use pagination or explicit screen changes instead of requiring scrolling.

## Implementation hygiene
- Preserve the existing message-window UI, nameplate, speaker colors, and dialogue controls when changing scene direction or backgrounds. Reuse the standard dialogue renderer; redesign the message-window UI only when the user explicitly asks for that change.
- Keep secrets, API keys, and spoiler-heavy developer documents out of player-facing assets and dialogue.
- Note: this is a **public** GitHub repository; files under `docs/story/` can be read by anyone, even if they aren't linked from the game.
- Run the existing build and tests for gameplay changes whenever possible.

## Landlord sprite consistency
- Use the matched landlord observation set described in `docs/manager-sprite.md`. Do not mix the old 160px/daily generations with the new expression master or try to disguise different proportions with runtime pose-specific scale multipliers.
- New poses must match the reference face, head/body proportions, line style and camera, then use consistent frame/pivot preparation. Review idle, sweeping, all gait frames and every speech reaction together at actual game size.
- Walking must be a coherent cycle with a stable head/torso and opposing foot phases, advanced by actual movement distance. Verify both travel directions, stop/start, pauses and sprite loading; never validate walking from isolated stills alone.

## Production deployment
- The user requests production deployment after each completed change. After building and passing the existing tests, commit the intended task changes and push to `main` to trigger `.github/workflows/deploy-pages.yml`.
- Verify the GitHub Pages workflow succeeds and report the production URL. If deployment fails, investigate and report the actual state.
- Exclude unrelated local files, credentials, and preview-only output from commits.
