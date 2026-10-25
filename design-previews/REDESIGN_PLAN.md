# Applied Agentic: public site redesign plan

Three design concepts are in this folder. Each file is a self-contained, mobile-first prototype
with three linked screens (Home, Module, Article reader), light and dark themes, and working
navigation, search/command palette, audio control and reading progress. Figures in them are sample data.

| File | Concept | Navigation | Personality |
|---|---|---|---|
| `concept-a-transit.html` | **Agentic Transit**: the course drawn as a transit network | Bottom dock on mobile, pill links on desktop, search sheet | Confident, playful, very clear wayfinding |
| `concept-b-trace.html` | **Agent Trace**: the site behaves like a live agent run | Command palette (⌘K or `/`) + bottom bar with a central command button | Technical, dark-first, for engineers |
| `concept-c-pulse.html` | **Agentic Pulse**: kinetic poster type and colour blocks | Floating pill tab bar, full-screen module menu | Bold, social-app energy, the most visual |

To view one locally, open the file in a browser. The files skip `<!doctype>` and `<head>` because the
artifact host adds them, so a local open renders in quirks mode. It still works.

---

## 1. What exists today (and why a clean break makes sense)

- `styles/globals.css` is about 3,300 lines and loads **15 Google font families** in one `@import`
  (Inter, DM Sans, Lora, Literata, Newsreader, Playfair and others). That is slow on mobile and gives the site no single typographic voice.
- Pages mix Tailwind classes, inline `style={{…}}` objects and hard-coded gradient arrays
  (for example `FILE_NAME_GRADIENTS` and `CARD_GRADIENTS` in `app/(public)/page.tsx`). There is no token system to re-theme.
- `components/public/Navbar.tsx` (558 lines) and `MenuContentLayout.tsx` follow a classic
  "blog header + side menu" structure.
- **Keep:** Prisma schema, `lib/`, every `app/api/*` route, `agents/`, `content/*.ts` copy, and all
  public URLs (`/`, `/[menuSlug]`, `/[menuSlug]/[subMenuSlug]`, `/articles/[id]`, `/topics/[id]`,
  `/modules`, `/search`, `/privacy`, `/terms`). SEO and inbound links must not break.
- **Replace completely:** `app/(public)/**` page markup, `components/public/**`, `styles/globals.css`,
  `tailwind.config.ts`, the shared loaders and the theme provider UI.

## 2. How the data maps onto each concept

| Data | A · Transit | B · Trace | C · Pulse |
|---|---|---|---|
| NavMenu (module) | Line with its own colour | Plan step with a status pill | Colour-block card, stacked |
| SubMenu | Zone along the line | Collapsible span group | Filter chip |
| Article | Stop, with ETA = reading time | Span on a waterfall | Numbered lesson row |
| ArticleSection | Stops on the sticky ride bar | Trace steps with markers | Contents sheet + progress ring |
| Tags | Interchanges | Context-window tokens | Marquee + 60-second cards |
| `public/*.html` decks | Tickets | Artifacts | Fanned deck cards |
| Article audio | "Listen on board" pill | Waveform player | Listen button in the pill nav |
| Featured articles | Departure board | Tool-result cards with metadata | Bento grid |
| Newsletter | Service updates band | `subscribe()` code form | Giant "Get the next one" |

Module colour already exists in the schema (`Module.color`). Each concept needs one colour per NavMenu.
Add an optional `color` column to `NavMenu`, or derive it from `order` with a fixed palette.

## 3. Technical foundation (same for whichever concept wins)

1. **Design tokens**: one `styles/tokens.css` with CSS custom properties for colour, type,
   radius, spacing and motion, with light and dark values. Expose them to Tailwind v4 through `@theme`.
   No hex values in components.
2. **Fonts**: load only the chosen 2 or 3 families through `next/font/google`. They are self-hosted,
   subset and preloaded, with no layout shift. Remove the 15-family `@import`.
   - A: Big Shoulders Display, Public Sans, Overpass Mono
   - B: Martian Mono (variable width), Geist
   - C: Archivo (variable width), Hanken Grotesk
3. **Mobile-first rules**: base styles target 360–420px and widen with `min-width` queries.
   Tap targets are at least 44px. Navigation sits in the thumb zone (bottom bar or pill).
   `env(safe-area-inset-*)` paddings. No horizontal scroll.
4. **Motion**: CSS-first (keyframes, `font-variation-settings`, scroll-snap) plus the View Transitions
   API for page changes. Use one hero moment per page. Respect `prefers-reduced-motion` everywhere.
   Add a JS animation library only if a specific interaction needs one.
5. **Article prose**: TipTap HTML gets one new `.prose` stylesheet built from tokens, covering
   callouts, tables, code, quotes, images and embeds.
6. **Data loaders**: move the Prisma queries out of page files into `lib/data/*.ts` (`getNavMenus`,
   `getHomeData`, `getMenuWithSubMenus`, `getArticle`…). Then the new UI never touches query code.

## 4. Phased rollout

| Phase | Work | Output |
|---|---|---|
| 0. Decide | Choose a concept, or a mix such as B's command palette inside A. Confirm module colours. | Signed-off direction |
| 1. Foundation | Tokens, fonts, theme switch, app shell: header, mobile nav, footer, search or palette | New shell behind a flag |
| 2. Data | Extract loaders into `lib/data`. Pages call loaders only. | No visual change, safer refactor |
| 3. Core screens | Home, Menu (`/[menuSlug]`), SubMenu, Article reader | Main journeys in the new UI |
| 4. Reader parity | Audio player, sections, TOC, progress, share, related, reader tools, AI summary flag | Feature parity with today |
| 5. Remaining pages | Search, Topics, Modules, Privacy, Terms, 404, error, loading states | Every public route covered |
| 6. QA | Real-device checks (iOS Safari, Android Chrome), Lighthouse mobile ≥ 90, axe a11y, both themes, metadata and sitemap unchanged | Release candidate |
| 7. Cutover | Flip the flag, delete old `components/public`, old CSS and unused fonts | Old code removed |
| 8. Admin (optional) | Re-skin `/admin` with the same tokens. The editor keeps working throughout. | Consistent look |

**Running old and new side by side:** build the new components in `components/site/` and gate
them with `NEXT_PUBLIC_FEATURE_NEW_UI` in `content/features.ts`, the same pattern as the existing
flags. Each public page renders the old or the new tree from the same loader, so you can preview
on UAT and roll back instantly. At cutover the flag and the old tree are deleted.

## 5. Risks to watch

- **URLs and SEO:** routes, `generateMetadata`, `sitemap.ts` and `robots.ts` must stay identical.
- **Existing article HTML:** inline colours or fonts saved by the TipTap editor (FontFamily, Color
  extensions) can fight the new theme. Audit published content and scope prose styles to override them.
- **Animation cost on low-end phones:** animate only `transform`, `opacity` and font variation, and test on a mid-range Android device.
- **Dark and light parity:** every token needs both values. Check each screen in both themes before sign-off.

## 6. Decisions needed

1. Which concept, A, B or C, or which pieces of each?
2. Dark-first (B) or light-first (A, C)? Both themes ship either way.
3. Should modules get their own colours in the admin (new `NavMenu.color` field)?
4. Should the admin redesign be in scope now or later?
