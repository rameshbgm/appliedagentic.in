# Transit application verification

25 October 2026. The Transit changes are integrated into `main`. Local validation leaves production data and schema unchanged.

## Restored operation

- Started Docker/MySQL and copied a read-only source snapshot into the empty local database: 114 articles (113 published), 211 sections, four paths and 32 zones. Media metadata is local; original bytes are read on demand from the source in development. New content and media are written locally.
- Search supports multiple terms across articles, section content, tags and zones; invalid pagination is bounded, all result pages are accessible, stale requests are cancelled, URLs and Back/Forward state stay synchronized, and failures offer retry.
- Draft pages and metadata require admin authentication. Editing and republishing preserve existing publication dates.
- Site name, tagline, description and site URL settings persist and affect the public site. Profile/settings load/save failures are surfaced.
- Newsletter forms persist subscribers in MySQL. Admins can review/export active subscriptions. Token-based unsubscribe is functional. Campaign delivery requires an email service; the application does not claim to send emails.
- Narration supports playback, pause, seeking, speed, mute, section advancement and error recovery. HTTP range responses handle suffix/open-ended ranges correctly.
- Reader state resets when moving between articles; text controls stay synchronized, Resume updates immediately, and contents navigation can reveal collapsed sections.
- Public dialogs and the admin drawer use native modal focus isolation and restore focus. Sign-out returns to `/login`. Quick sign-in is development-only.
- Text agents retain OpenAI as their primary provider and fall back to configured Gemini after quota/service failures; the fallback can be disabled.

## Evidence

- Production webpack build and TypeScript checks passed.
- 25 unit tests passed: ten learning-path tests, ten AI transport/fallback tests, five search/media/image-rendering tests.
- Ten live integration groups passed: database readiness; search/pagination; auth/admin routes; image upload/crop; article/menu/zone lifecycle; settings; article image visibility; newsletter; audio range/source reads; deletion.
- Real Gemini requests succeeded for a three-point section summary, a seven-point article summary, an original generated image and newly generated narration. Generated test media and integration records were removed.
- Browser checks covered quick/full search, result pagination, lesson navigation, real audio playback with duration, reader font controls, contents navigation, nested summary dialogs, admin sign-in/menu and sign-out.
- Mechanical design check returned no findings for the changed reader/search/dialog/form surfaces.

OpenAI returned an enforced organization spending-limit error during live testing. Gemini is working. OpenAI-specific image/audio requests will remain unavailable until the account limit is raised; the editor exposes Gemini image and voice choices.

Before deploying the code, apply the additive Prisma schema changes for `SiteSettings.siteUrl`, `SiteSettings.showArticleImages` and `NewsletterSubscriber` using the intended database release workflow. Local verification never applies changes to production. See [SCRIPTS.md](../SCRIPTS.md) for reproducible setup and checks.

The dependency upgrade and clean production build procedure are recorded in [SCRIPTS.md](../SCRIPTS.md#dependency-baseline-25-october-2026).
