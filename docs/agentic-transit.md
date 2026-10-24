# Agentic Transit design system

The public site and admin share one visual language: the curriculum is a transit
network. Each visible **NavMenu is a line** with its own colour, each **NavSubMenu is
a zone**, each **article is a stop**, and reading time is shown as journey time.

## Where things live

| Concern | File |
|---|---|
| Tokens, components, prose, admin compatibility layer | `styles/globals.css` |
| Fonts (Big Shoulders Display, Public Sans, Overpass Mono) and no-flash theme script | `app/layout.tsx` |
| Line colours, network data, journey helpers | `lib/transit.ts` |
| Site chrome: top bar, mobile dock, lines sheet, quick search, footer | `components/transit/` |
| Reader: progress bar, stops map, section blocks, audio dock | `components/transit/Ride.tsx`, `SectionBlock.tsx`, `components/public/ArticleAudioPlayer.tsx` |
| Admin shell | `components/admin/Sidebar.tsx`, `components/admin/AdminHeader.tsx` |

## Rules of thumb

- Use tokens (`var(--ink)`, `var(--paper)`, `var(--l1)`…`var(--l8)`), never hex values. Every token has light and dark values.
- A line's colour comes from its position: `lineColor(index)` in `lib/transit.ts`. Set it once as `--c` on a wrapper and child components pick it up.
- Buttons: `.tr-btn` plus `--primary`, `--ghost`, `--line`, `--notice`, `--sm`, `--block`. Icon buttons: `.tr-icon-btn`. Filters: `.tr-chip`.
- Display type (`.tr-display`) is uppercase Big Shoulders. Body copy is Public Sans. Data and labels (`.tr-eyebrow`, `.tr-mono`) are Overpass Mono.
- Mobile first: base styles target phones, and the layout widens at 640px and 900px. The bottom dock is the primary navigation below 900px.
- Motion is CSS-only and respects `prefers-reduced-motion`: the line draws on the home map, the departure board flips, and sections rise in as they scroll into view.
- Admin screens get the brand through `.tr-admin`, which remaps Tailwind's gray/violet palette to Transit tokens.
