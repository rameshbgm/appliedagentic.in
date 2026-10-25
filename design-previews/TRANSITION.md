# Applied Agentic AI — redesign transition brief

These are three independent working concepts, created for local preview on 25 October 2026. They use fresh HTML, CSS, JavaScript, navigation, responsive composition, original geometric visuals, and locally hosted fonts. They do not import the application's components, styles, templates, or assets. The current application is unchanged.

Open http://127.0.0.1:4176/ to compare concepts. The gallery provides desktop/mobile framing, direct links, and this transition plan. Start the preview again from the repository root with:

```sh
python3 -m http.server 4176 --bind 127.0.0.1 --directory design-previews
```

## Three directions

| | Orbit | Forma | Current |
|---|---|---|---|
| Core experience | Connected knowledge atlas | Personal learning atelier | Builder's playground |
| Navigation | Discovery → path → connected lessons | Studio → collection → focused practice | Explore → live flow → sequential lessons |
| Palette | Midnight plum #17131F, lavender #B6A0F5, soft white #F3EFF9, dusk #211B2C | Paper #F6F2DF, oxblood #4F2029, butter #E6BD54, sage #D4DCB7, apricot #EFCEBD | Cobalt #2450E8, white #FFFFFF, cloud #F4F7FC, lime #C8F788, ink #203253 |
| Typography | Syne display; Manrope body | Fraunces display/reading; Plus Jakarta Sans controls | Barlow Condensed display; Albert Sans body |
| Signature visual | Rotating particle constellation with connected ideas | Illustrated-by-geometry field guide and collection booklets | Interactive reason → retrieve → act flow |
| Motion | Slow, pausable constellation; restrained directional hover | Booklet lifts and slight rotation; quiet reading | User-triggered flow, active stages, sequential result |
| Mobile composition | Intro → constellation → 2×2 path picker → lesson sequence | Intro → tactile field guide → stacked collections → reading sheet | Intro → interactive flow → 2×2 path tabs → vertical steps |
| Reading | Dark, spacious knowledge document | Warm paper and large serif text | Bright, direct typography and blue visual diagrams |
| Tradeoff | Atmospheric visuals need careful performance budgeting | Expressive display serif needs disciplined long-title handling | Strong color and condensed headings require controlled use on dense screens |

All previews include path selection, local full-screen lesson excerpts, next/back navigation, search with empty states, bookmarks, larger reading text, and local reading notes. Read-aloud uses the browser's speech feature where supported. Current's flow is a local illustration, not a connected AI agent. Learning progress and lesson excerpts are illustrative; the previews do not represent a full import of the production curriculum.

## Recommended transition sequence

### 1. Review and lock one direction

Review at 320, 390, 768, and 1280+ pixels. Compare the first visit, path selection, searching, saving, and reading. Choose one primary direction and identify any carefully bounded elements to borrow from the others. Confirm whether discovery or returning to an active learning path should be the default entry. This decision precedes a production rebuild.

Deliverable: chosen visual language, mobile navigation, page inventory, content hierarchy, and acceptance criteria.

### 2. Establish a new frontend boundary

Build a separate application shell and fresh components in an isolated namespace or branch. Do not import current Navbar, Footer, article components, Tailwind recipes, or globals.css. Build new tokens, layout primitives, font loading, icons, motion rules, and accessibility patterns. Use existing content and API contracts through explicit data adapters; sharing data is independent of sharing UI implementation. If a fully new backend is desired too, plan that separately.

Deliverable: new design system with working mobile navigation, loading, empty, error, focus, selected, and reduced-motion states. Establish page-weight and animation budgets before adding heavier media.

### 3. Rebuild the reader journey

Implement discovery, learning-path overview, module overview, lesson reading, search/results, related content, bookmarks, audio, share controls, and legal/newsletter surfaces. Reuse the factual curriculum and media through the data boundary. Preserve current published URLs, canonical links, SEO metadata, and sitemap behavior, or define tested redirects where a change is unavoidable.

Deliverable: an end-to-end journey with real content, long titles, code, tables, diagrams, references, audio, and next/previous navigation.

### 4. Rebuild the administrative experience

Create a fresh publishing workspace with top-level work areas and contextual controls rather than a persistent sidebar. Cover dashboard/analytics, menus and modules, topics, articles and editing, media, publishing, AI-assisted tasks, profile, and settings. Preserve permissions and validation. Confirm the mobile editor's essential tasks and use focused, full-width editing screens.

Deliverable: route and state parity checklist for the admin surface, with real create/edit/review/publish flows connected in staging.

### 5. Validate the complete system

Check phone/tablet/desktop layouts, keyboard and screen-reader operation, visible focus, color contrast, 200% zoom, touch targets, preferred reduced motion, and content overflow. Test real audio lifecycle, search, authentication, publishing, and error recovery. Measure performance on mobile; pause ambient animation offscreen and when the tab is hidden.

Deliverable: staging review and a documented parity/performance/accessibility acceptance report.

### 6. Transition after review

Release the new shell with a feature flag or controlled route cutover. Keep the previous frontend available for rollback until production checks pass. Verify content ordering, access, SEO, analytics events, media, and bookmarks against the acceptance checklist. Retire the old UI only after the new experience is approved.

## Current scope and untouched work

Only `design-previews/` was created for this request. The production application, its database, environment configuration, installed dependencies, and existing user edits are outside this preview. No commits, publication, deployment, or backend writes are part of this work.

These are samples of the discovery-to-reading experience. A full admin prototype, real API integration, complete lesson imports, production account state, and release work remain future implementation tasks.
