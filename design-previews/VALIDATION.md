# Preview verification

25 October 2026. Isolated local static preview, no production build or database access.

- All five JavaScript entry files pass `node --check`.
- All five CSS stylesheets parse successfully with PostCSS.
- All local HTML asset and file links resolve.
- All six font families are self-hosted, with SIL Open Font License notices included.
- Desktop and mobile screenshots captured for Orbit, Forma, and Current at 1280×900 and 390×844.
- All three concepts inspected at 320px and 768px. Final 320px document widths are no larger than the viewport.
- Exercised Current's reason/retrieve/act sequence, path switching, lesson opening, bookmark add/remove, local note entry/clearing, larger reading text, next/back navigation, saved shelf, search results, and empty search state.
- All three concepts open the selected AI Evals lesson, update the selected-path descriptions, and render the full-screen reader at mobile width.
- Verified inert background attributes and the lesson-only accessibility tree while the reader is open. The reader restores background interaction and return focus on close.
- Gallery concept selection, desktop/mobile framing, and transition-plan dialog exercised.
- No console errors observed during the completed interaction checks.
- Reduced-motion behavior checked in source: the Orbit loop is suppressed, Current's staged delays are removed, and animated transitions are disabled in each theme.

An independent review identified three bounded issues: reader background focus, narrow-phone flow overlap/touch controls, and stale path summaries. All three were fixed in one batch and independently scored resolved. This is a review of the prototype scope, not production accessibility certification or integration testing.

The previews use illustrative content excerpts and browser-local state. Real account state, API integration, full curricula, audio files, administrative editing, backend errors, SEO parity, and deployment are future implementation work.
