# Agentic Pulse design system

A colourful, poster-like, thumb-first design. Each visible **NavMenu is a
colour-blocked module**, each **NavSubMenu is a chapter**, each **article is a
lesson**. Colour comes from a module's position in the menu order.

## Where things live

| Concern | File |
|---|---|
| Tokens, components, prose, animations, admin compatibility layer | `styles/globals.css` |
| Fonts (Archivo variable width, Hanken Grotesk, JetBrains Mono) and no-flash theme script | `app/layout.tsx` |
| Module palette (`swatch`, `PALETTE`), catalog data, reading-time helpers | `lib/catalog.ts` |
| Chrome: glass header, floating pill tab bar, full-screen module menu, quick search, footer | `components/pulse/PulseShell.tsx`, `QuickSearch.tsx`, `Footer.tsx` |
| Page transition | `app/(public)/template.tsx` (`.p-page`) |
| Cursor spotlight and tilt (`data-spot`, `data-tilt`) | `components/pulse/Effects.tsx` |
| Reader: progress bar, section cards, contents, pill controls, completion burst | `components/pulse/Reading.tsx`, `SectionBlock.tsx`, `ReaderTools.tsx` |
| Admin shell | `components/admin/Sidebar.tsx`, `components/admin/AdminHeader.tsx` |

## Palette and readability

- Six brand colours, each paired with a text colour that passes contrast: cobalt, tomato and violet take white text; sun, mint and pink take ink text. Use `swatch(index)` or `swatchStyle(index)` to get the pair and set `--c` / `--fg`.
- Long-form text is always ink on a neutral background at 18px with a ~68ch measure. Colour lives in accents: heading rules, list markers, link underlines and callouts. It never lives in body text.
- Readers can change text size (15–24px) and switch between sans and serif. Both are remembered per device.
- Every token has light and dark values. The theme follows the OS until the reader picks one.

## Motion

- Hero words stretch on the Archivo width axis. Module cards stack and shrink as you scroll. Tiles follow the cursor with a spotlight and tilt. Headings rise in as they scroll into view, and the page itself fades in on navigation.
- Scroll-linked effects use CSS `animation-timeline` and only run where the browser supports it. Pages are fully readable without it.
- Everything respects `prefers-reduced-motion`.
- Avoid `transform`, `filter` or `will-change` on ancestors of `position: fixed` UI (sheets, audio player, progress bar). They break viewport anchoring. This is why `.p-page` uses `animation-fill-mode: backwards`.
