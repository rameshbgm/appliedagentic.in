# Database Schema Overview

Primary schema is defined in `prisma/schema.prisma`.

Key models and important indexes:
- `User` — auth users (unique index on `email`).
- `Article` — main content; indexes: `slug`, `status`, `publishedAt`, `authorId`, `isFeatured`.
- `Module` / `Topic` — navigation and categorization; `slug`, `order` indexes.
- `Tag` / `ArticleTag` — tags with unique `slug` and join table.
- `MediaAsset` — media metadata; indexed by `type` and `createdAt`.

Recommended additional indexes for search performance:
- `Article(title)` - full-text or specific indexing depending on search strategy.
- `Article(content)` - consider a full-text index or external search index (Elasticsearch, MeiliSearch) for large content.

See the canonical schema: [prisma/schema.prisma](prisma/schema.prisma#L1-L400)
