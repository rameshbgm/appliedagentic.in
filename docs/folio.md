# Folio design system

Folio treats the site as a reading room. The course is a book: modules are
**chapters** (numbered I, II, III…), sub-menus are **sections**, and articles are
**essays**. Everything is tuned for long, comfortable reading sessions.

## Where things live

| Concern | File |
|---|---|
| Tokens (Paper, Sepia, Night), typography, components, admin layer | `styles/globals.css` |
| Fonts: Fraunces (headlines), Spectral (reading), Manrope (interface) | `app/layout.tsx` |
| Module colours (`--m1`…`--m8`), roman numerals, catalog data | `lib/catalog.ts` |
| Reader's personal library (progress, bookmarks, highlights; localStorage) | `lib/library.ts` |
| Masthead, Contents drawer, search, auto-hiding toolbars | `components/folio/FolioShell.tsx` |
| Reader: progress, resume, margins, highlighter, focus mode, Aa panel, toolbar | `components/folio/Reader.tsx` |
| Library page (saved, highlights, history) | `app/(public)/library/page.tsx`, `components/folio/LibraryClient.tsx` |

## Reading features

- **Continue where you left off.** The reader's position is saved per essay. The front page shows a "Continue reading" shelf, and the essay offers to jump back.
- **Highlights.** Select text to highlight it or copy it as a quote. Highlights reappear on the page, show in the right margin on desktop, and collect in the Library.
- **Bookmarks** save essays to the Library. **History** shows what was read and how far.
- **Aa panel.** Readers can pick a theme (Paper, Sepia, Night), a typeface (serif or sans), text size, line spacing and column width. Choices are remembered per device.
- **Focus mode** dims everything except the passage being read.
- Header and toolbars tuck away while scrolling down and return on any upward scroll.

All personal data stays in the reader's browser. Nothing is sent to the server.

## Motion

Calm and editorial. Headlines rise in word by word, the highlighter sweeps under key words, contents rows expand smoothly, cover images drift with scroll, and pages fade in. Everything respects `prefers-reduced-motion`.
