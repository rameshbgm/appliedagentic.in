# Applied Agentic AI — alternative prototype systems

Recorded 25 October 2026. These are three **unselected alternatives** for comparing a future product direction. They are functioning, isolated previews, not an approved production identity or a complete application migration. The original application is untouched. No commit, publication, deployment, or backend write is part of this work.

Each alternative uses fresh HTML, CSS, JavaScript, locally hosted fonts, and original geometric visuals. The shared subject is structured learning about agentic AI; none uses a traditional blog layout or persistent sidebar.

## Orbit

- **Palette:** midnight plum `#17131F` background, soft white `#F3EFF9` foreground, lavender `#B6A0F5` accent, dusk `#211B2C` surfaces, and muted lavender `#B0A7BE` supporting text.
- **Typography:** Syne for the brand and display hierarchy; Manrope for navigation, controls, body text, and reading.
- **Navigation and composition:** Discover, Learning paths, Saved, and search lead from a split introduction/constellation to a grouped path selector, connected lesson rows, and a question-led search invitation. The reader continues the dark knowledge-atlas atmosphere.
- **Signature visual and motion:** a canvas particle sphere, orbital linework, and named memory/tools/reasoning nodes. Slow rotation has an explicit pause/play control, respects reduced motion, and pauses when the document is hidden. Directional hover movement is restrained.
- **Mobile:** introduction precedes the constellation; four paths form a 2×2 selector; route introduction and lesson rows become a single reading sequence. Compact navigation retains paths, saved lessons, and search.

## Forma

- **Palette:** paper `#F6F2DF`, oxblood `#4F2029`, action oxblood `#6E2937`, butter `#E6BD54`, sage `#D4DCB7`, apricot `#EFCEBD`, and warm white `#FFFDF4`. Supporting text uses `#765F5C`.
- **Typography:** Fraunces supplies expressive display headings and generous serif lesson reading; Plus Jakarta Sans handles navigation, controls, and supporting copy.
- **Navigation and composition:** The studio, The collection, My bookmarks, and search organize a learning atelier. A field guide introduces the product; collection booklets lead into a workbench with a tabbed paper lesson preview and subsequent lessons. Organizational Transformation is a separate collection link.
- **Signature visual and motion:** a tilted field guide, geometric cover artwork, a paper note, and distinct booklet covers. Booklets lift on hover and the guide gently changes angle; the reading experience stays quiet. Reduced motion removes transitions.
- **Mobile:** introduction and field guide stack, collection booklets become full-width choices, and the workbench becomes a vertical paper reading composition. Selecting a collection moves to its practice area.

## Current

- **Palette:** cobalt `#2450E8`, white `#FFFFFF`, cloud `#F4F7FC`, lime `#C8F788`, and ink `#203253`; pale blue supports the closing invitation and reader diagrams.
- **Typography:** Barlow Condensed provides the uppercase display voice; Albert Sans carries body text, controls, and lesson content.
- **Navigation and composition:** Explore, Playground, Your shelf, and search introduce a builder's playground. A goal input and reason → retrieve → act demonstration sit beside the introduction. Path tabs lead to sequential learning steps and a direct closing action.
- **Signature visual and motion:** an interactive local flow highlights stages and returns an illustrative next step. Run/reset, active/completed states, dashed connector motion, and reduced-motion timing are implemented. The demonstration does not call an AI service.
- **Mobile:** introduction precedes the flow; path tabs become 2×2; numbered lessons become vertical steps. Below 370px navigation uses two rows. Side nodes size proportionally; the goal input is 16px and Run/Reset controls have 44px minimum dimensions. “HANDS-ON” remains together.

## Shared behavior and accessibility

All alternatives support four learning paths, three illustrative lesson excerpts per path, full-screen reading, next/back navigation, search and empty results, local bookmarks, larger reading text, and browser-local notes. Read-aloud uses browser speech synthesis when available and exposes an unavailable state otherwise. Bookmarks and notes are separated by concept in local storage.

Controls have visible themed focus states and selected/pressed states. Skip links, labelled search fields, semantic buttons, reduced-motion rules, themed selection/caret/scrollbar surfaces, and responsive readers are implemented. Opening the reader makes the background header, main content, footer, and skip link inert; closing restores them and returns focus. These previews demonstrate the interaction direction, not production accessibility certification.

## Verification and resolved review findings

Rendered layouts were checked at **1280px, 390px, and 320px** viewport widths. Saved desktop and phone home captures, plus mobile reader captures, are in `screenshots/`. The 320px browser checks confirmed no horizontal document overflow in all three concepts; Current's side nodes remain separated.

The bounded independent finish review identified three issues, all subsequently marked **resolved**:

1. Reader background controls remained accessible: inert background handling now isolates the visible reader and restores the underlying page on exit.
2. Current's narrow-phone flow nodes overlapped and its goal controls were too small: proportional side nodes, a 16px mobile input, and 44px Run/Reset controls address the issue.
3. Path changes left agent-specific summaries behind: lesson summaries, stage labels, and Forma's diagram now update with the selected path.

The reviewed disposition is **ready for preview comparison**. Selecting a direction, importing the full curriculum, rebuilding administration, connecting real services, and production validation remain later work described in `TRANSITION.md`.
