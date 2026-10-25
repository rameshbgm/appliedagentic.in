# Aurora design system

Aurora is built for reading at night. A slow aurora drifts behind frosted-glass
surfaces, and the reading column stays plain and high-contrast so the effects
never get in the way. The course is a set of **paths** (modules, numbered 01, 02…).
Each path has **milestones** (sub-menus), and each milestone has **essays** (articles).

## Where things live

| Concern | File |
|---|---|
| Tokens (Night, Dusk, Day), typography, components, admin layer | `styles/globals.css` |
| Fonts: Instrument Serif (display), Atkinson Hyperlegible Next (reading and interface), Atkinson Hyperlegible Mono | `app/layout.tsx` |
| Path colours (`--m1`…`--m8`), catalog data | `lib/catalog.ts` |
| Reader's personal library (progress, bookmarks, highlights; localStorage `aa-*`) | `lib/library.ts` |
| Animated sky (pointer parallax) and the star logo mark | `components/aurora/Sky.tsx` |
| Capsule header, phone dock with search orb, Paths overlay, quick search | `components/aurora/AuroraShell.tsx` |
| Topic constellation on the home page | `components/aurora/Constellation.tsx` |
| Path timeline that fills as you scroll | `components/aurora/Timeline.tsx` |
| Reader: progress, resume, "What you'll learn", margins, highlighter, ruler, focus, navigator, settings | `components/aurora/Reader.tsx` |

## Why these fonts

Atkinson Hyperlegible Next was designed by the Braille Institute so similar letters (I, l, 1; O, 0; b, d) never blur together. It is used at 19px with a 1.72 line height and a 68-character column. Readers who prefer a serif can switch to Charter in the settings. Instrument Serif is a condensed display face, so headlines feel elegant while staying short. It is used only for display text, never for paragraphs.

## Reading features

- **Navigator.** A glowing progress orb sits bottom-right. Tap it to see time left and the contents, and to switch the ruler, focus mode and text settings. Listen, bookmark and text settings sit beside the orb for one-tap access.
- **Reading ruler.** A clear band follows the mouse on desktop and stays at eye level on phones. The rest of the page is softly dimmed. Esc turns it off.
- **Focus mode** dims every paragraph except the one being read.
- **What you'll learn.** Essays with sections open with a numbered outline that jumps to each section.
- **Continue where you left off**, **highlights**, **bookmarks** and **history** work as before. All of this stays in the reader's browser.
- **Settings.** Sky (Night, Dusk, Day), typeface, text size, line spacing and column width are remembered per device.
- **The sky responds.** It dims while an essay is open and brightens when you reach the end.

## Motion

- Headlines blur in word by word.
- Stats count up when they come into view.
- Path cards scale into focus as the carousel scrolls.
- Cards light up with a rotating gradient border on hover.
- Sections reveal with a soft blur as you scroll.
- Cover images drift with the scroll.
- Constellation stars pulse, and their links light up on hover.

Scroll effects use CSS scroll-driven animations where the browser supports them. Everything respects `prefers-reduced-motion`.
