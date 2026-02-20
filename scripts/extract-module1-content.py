#!/usr/bin/env python3
"""
Extract plain-text content from Module 1 .mhtml files and generate
SQL DDL (schema) and DML (seed data) scripts for the AppliedAgentic database.

Usage:
    python3 scripts/extract-module1-content.py

Output:
    scripts/module1-ddl.sql  - DDL (CREATE TABLE) statements from Prisma schema
    scripts/module1-dml.sql  - DML (INSERT) statements with extracted Module 1 content
"""

import email
import re
import os
from html.parser import HTMLParser

# ─────────────────────────────────────────────────────────────────────────────
# HTML → Plain-text extraction
# ─────────────────────────────────────────────────────────────────────────────

class TextExtractor(HTMLParser):
    """Strips HTML tags and returns clean readable text."""

    SKIP_TAGS = {"script", "style", "noscript"}
    BLOCK_TAGS = {
        "h1", "h2", "h3", "h4", "h5", "h6",
        "p", "li", "div", "section", "article",
        "blockquote", "tr", "td", "th",
    }

    def __init__(self):
        super().__init__()
        self._parts: list[str] = []
        self._skip_depth = 0

    def handle_starttag(self, tag, attrs):
        if tag in self.SKIP_TAGS:
            self._skip_depth += 1
        if tag == "br" and self._skip_depth == 0:
            self._parts.append("\n")

    def handle_endtag(self, tag):
        if tag in self.SKIP_TAGS:
            self._skip_depth -= 1
        if tag in self.BLOCK_TAGS and self._skip_depth == 0:
            self._parts.append("\n")

    def handle_data(self, data):
        if self._skip_depth == 0:
            self._parts.append(data)

    def get_text(self) -> str:
        raw = "".join(self._parts)
        lines = [ln.strip() for ln in raw.split("\n")]
        return "\n".join(ln for ln in lines if ln)


# Patterns that are navigation chrome, not content
_NAV_PATTERNS = re.compile(
    r"^(Skip to content|Home|Menu|Previous|Next|Resources|Help|Navigation|Close)\s*$"
)


def _clean(text: str) -> str:
    lines = [ln for ln in text.split("\n") if not _NAV_PATTERNS.match(ln)]
    return "\n".join(lines)


def extract_text_from_mhtml(filepath: str) -> str:
    """Return clean plain-text content extracted from an .mhtml file."""
    with open(filepath, "rb") as fh:
        msg = email.message_from_bytes(fh.read())

    html = None
    for part in msg.walk():
        if part.get_content_type() == "text/html":
            payload = part.get_payload(decode=True)
            if payload:
                html = payload.decode("utf-8", errors="replace")
                break

    if not html:
        return ""

    parser = TextExtractor()
    parser.feed(html)
    return _clean(parser.get_text())


# ─────────────────────────────────────────────────────────────────────────────
# HTML content builder (wraps plain text in <p> tags)
# ─────────────────────────────────────────────────────────────────────────────

def _escape(s: str) -> str:
    return (
        s.replace("&", "&amp;")
         .replace("<", "&lt;")
         .replace(">", "&gt;")
         .replace('"', "&quot;")
    )


def plain_to_html(text: str) -> str:
    """Wrap each non-empty paragraph of *text* in <p> tags."""
    parts = []
    for line in text.split("\n"):
        line = line.strip()
        if line:
            parts.append(f"<p>{_escape(line)}</p>")
    return "\n".join(parts)


# ─────────────────────────────────────────────────────────────────────────────
# SQL helpers
# ─────────────────────────────────────────────────────────────────────────────

def sql_escape(s: str) -> str:
    """Escape a string value for use in a MySQL SQL statement."""
    return s.replace("\\", "\\\\").replace("'", "\\'")


# ─────────────────────────────────────────────────────────────────────────────
# Module 1 file → topic mapping (ordered)
# ─────────────────────────────────────────────────────────────────────────────

MODULE1_DIR = os.path.join(
    os.path.dirname(__file__),
    "..",
    "docs",
    "learningmoduls",
    "Module 1 Foundations of Generative and Agentic AI",
)

# (filename, article_title, slug, topic_slug_or_None)
# topic_slug matches the Topic slugs already seeded in seed.ts for Module 1
MODULE1_FILES = [
    (
        "Module 1. Foundations of Generative and Agentic AI.mhtml",
        "Module 1 Overview: Foundations of Generative and Agentic AI",
        "module-1-overview",
        None,  # not linked to a specific topic
    ),
    (
        "1. Introduction.mhtml",
        "Introduction",
        "module-1-introduction",
        None,
    ),
    (
        "2. Table of Contents.mhtml",
        "Table of Contents",
        "module-1-table-of-contents",
        None,
    ),
    (
        "3. Learning Objectives.mhtml",
        "Learning Objectives",
        "module-1-learning-objectives",
        None,
    ),
    (
        "1. Generative AI Fundamentals.mhtml",
        "Generative AI Fundamentals",
        "generative-ai-fundamentals",
        "module-1-generative-ai-fundamentals",
    ),
    (
        "2. AI Chatbots- Past, Present, and Future.mhtml",
        "AI Chatbots: Past, Present, and Future",
        "ai-chatbots-past-present-and-future",
        "module-1-ai-chatbots-past-present-and-future",
    ),
    (
        "3. Cost-Optimized Models and Performance Trade-Offs.mhtml",
        "Cost-Optimized Models and Performance Trade-Offs",
        "cost-optimized-models-and-performance-trade-offs",
        "module-1-cost-optimized-models-and-performance-trade-offs",
    ),
    (
        "4. Exploring Multimedia and Language Interaction Models.mhtml",
        "Exploring Multimedia and Language Interaction Models",
        "exploring-multimedia-and-language-interaction-models",
        "module-1-exploring-multimedia-and-language-interaction-models",
    ),
    (
        "5. Advanced Applications of Generative AI Tools.mhtml",
        "Advanced Applications of Generative AI Tools",
        "advanced-applications-of-generative-ai-tools",
        "module-1-advanced-applications-of-generative-ai-tools",
    ),
    (
        "6. References and Resources.mhtml",
        "References and Resources",
        "module-1-references-and-resources",
        None,
    ),
    (
        "4. Assignments Preview.mhtml",
        "Assignments Preview",
        "module-1-assignments-preview",
        None,
    ),
    (
        "Assignment 1 - Evaluating the Cost of AI Systems.mhtml",
        "Assignment 1: Evaluating the Cost of AI Systems",
        "assignment-1-evaluating-the-cost-of-ai-systems",
        None,
    ),
]


# ─────────────────────────────────────────────────────────────────────────────
# DDL generation (mirrors the Prisma-generated migration.sql)
# ─────────────────────────────────────────────────────────────────────────────

DDL = """\
-- =============================================================================
-- Module 1 DDL: AppliedAgentic Database Schema
-- Generated from prisma/schema.prisma
-- =============================================================================

-- CreateTable
CREATE TABLE IF NOT EXISTS `User` (
    `id`           INTEGER       NOT NULL AUTO_INCREMENT,
    `email`        VARCHAR(191)  NOT NULL,
    `passwordHash` VARCHAR(191)  NOT NULL,
    `name`         VARCHAR(191)  NOT NULL,
    `role`         ENUM('ADMIN','SUPERADMIN') NOT NULL DEFAULT 'ADMIN',
    `createdAt`    DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt`    DATETIME(3)   NOT NULL,
    UNIQUE INDEX `User_email_key` (`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `Module` (
    `id`          INTEGER      NOT NULL AUTO_INCREMENT,
    `name`        VARCHAR(191) NOT NULL,
    `slug`        VARCHAR(191) NOT NULL,
    `order`       INTEGER      NOT NULL DEFAULT 0,
    `description` TEXT         NULL,
    `icon`        VARCHAR(191) NULL,
    `color`       VARCHAR(191) NULL,
    `coverImage`  VARCHAR(191) NULL,
    `isPublished` BOOLEAN      NOT NULL DEFAULT true,
    `createdAt`   DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt`   DATETIME(3)  NOT NULL,
    `createdBy`   INTEGER      NULL,
    `updatedBy`   INTEGER      NULL,
    UNIQUE INDEX `Module_slug_key` (`slug`),
    INDEX `Module_slug_idx` (`slug`),
    INDEX `Module_order_idx` (`order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `Topic` (
    `id`          INTEGER      NOT NULL AUTO_INCREMENT,
    `moduleId`    INTEGER      NOT NULL,
    `name`        VARCHAR(191) NOT NULL,
    `slug`        VARCHAR(191) NOT NULL,
    `order`       INTEGER      NOT NULL DEFAULT 0,
    `description` TEXT         NULL,
    `icon`        VARCHAR(191) NULL,
    `color`       VARCHAR(191) NULL,
    `coverImage`  VARCHAR(191) NULL,
    `isPublished` BOOLEAN      NOT NULL DEFAULT true,
    `createdAt`   DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt`   DATETIME(3)  NOT NULL,
    `createdBy`   INTEGER      NULL,
    `updatedBy`   INTEGER      NULL,
    UNIQUE INDEX `Topic_slug_key` (`slug`),
    INDEX `Topic_slug_idx` (`slug`),
    INDEX `Topic_moduleId_idx` (`moduleId`),
    INDEX `Topic_order_idx` (`order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `Article` (
    `id`                 INTEGER      NOT NULL AUTO_INCREMENT,
    `title`              VARCHAR(191) NOT NULL,
    `slug`               VARCHAR(191) NOT NULL,
    `summary`            TEXT         NULL,
    `content`            LONGTEXT     NOT NULL,
    `status`             ENUM('DRAFT','SCHEDULED','PUBLISHED','ARCHIVED') NOT NULL DEFAULT 'DRAFT',
    `publishedAt`        DATETIME(3)  NULL,
    `scheduledAt`        DATETIME(3)  NULL,
    `isFeatured`         BOOLEAN      NOT NULL DEFAULT false,
    `coverImageId`       INTEGER      NULL,
    `audioUrl`           VARCHAR(191) NULL,
    `readingTimeMinutes` INTEGER      NULL,
    `viewCount`          INTEGER      NOT NULL DEFAULT 0,
    `seoTitle`           VARCHAR(191) NULL,
    `seoDescription`     TEXT         NULL,
    `seoCanonicalUrl`    VARCHAR(191) NULL,
    `ogImageUrl`         VARCHAR(191) NULL,
    `authorId`           INTEGER      NOT NULL,
    `createdAt`          DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt`          DATETIME(3)  NOT NULL,
    `createdBy`          INTEGER      NULL,
    `updatedBy`          INTEGER      NULL,
    UNIQUE INDEX `Article_slug_key` (`slug`),
    INDEX `Article_slug_idx` (`slug`),
    INDEX `Article_status_idx` (`status`),
    INDEX `Article_publishedAt_idx` (`publishedAt`),
    INDEX `Article_authorId_idx` (`authorId`),
    INDEX `Article_isFeatured_idx` (`isFeatured`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `TopicArticle` (
    `id`         INTEGER NOT NULL AUTO_INCREMENT,
    `topicId`    INTEGER NOT NULL,
    `articleId`  INTEGER NOT NULL,
    `orderIndex` INTEGER NOT NULL DEFAULT 0,
    INDEX `TopicArticle_topicId_idx` (`topicId`),
    INDEX `TopicArticle_articleId_idx` (`articleId`),
    UNIQUE INDEX `TopicArticle_topicId_articleId_key` (`topicId`, `articleId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `Tag` (
    `id`   INTEGER      NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    UNIQUE INDEX `Tag_name_key` (`name`),
    UNIQUE INDEX `Tag_slug_key` (`slug`),
    INDEX `Tag_slug_idx` (`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `ArticleTag` (
    `id`        INTEGER NOT NULL AUTO_INCREMENT,
    `articleId` INTEGER NOT NULL,
    `tagId`     INTEGER NOT NULL,
    UNIQUE INDEX `ArticleTag_articleId_tagId_key` (`articleId`, `tagId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `MediaAsset` (
    `id`              INTEGER      NOT NULL AUTO_INCREMENT,
    `filename`        VARCHAR(191) NOT NULL,
    `url`             VARCHAR(191) NOT NULL,
    `type`            ENUM('IMAGE','AUDIO','VIDEO','OTHER') NOT NULL,
    `mimeType`        VARCHAR(191) NULL,
    `altText`         VARCHAR(191) NULL,
    `caption`         VARCHAR(191) NULL,
    `width`           INTEGER      NULL,
    `height`          INTEGER      NULL,
    `sizeBytes`       INTEGER      NULL,
    `aiPrompt`        TEXT         NULL,
    `createdByUserId` INTEGER      NULL,
    `createdAt`       DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    INDEX `MediaAsset_type_idx` (`type`),
    INDEX `MediaAsset_createdAt_idx` (`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `AIUsageLog` (
    `id`            INTEGER      NOT NULL AUTO_INCREMENT,
    `userId`        INTEGER      NULL,
    `articleId`     INTEGER      NULL,
    `type`          ENUM('TEXT_GENERATION','IMAGE_GENERATION','AUDIO_GENERATION') NOT NULL,
    `model`         VARCHAR(191) NOT NULL,
    `inputTokens`   INTEGER      NULL,
    `outputTokens`  INTEGER      NULL,
    `promptSnippet` TEXT         NULL,
    `status`        VARCHAR(191) NOT NULL DEFAULT 'success',
    `createdAt`     DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    INDEX `AIUsageLog_type_idx` (`type`),
    INDEX `AIUsageLog_createdAt_idx` (`createdAt`),
    INDEX `AIUsageLog_userId_idx` (`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `SiteSettings` (
    `id`                 INTEGER      NOT NULL DEFAULT 1,
    `siteName`           VARCHAR(191) NOT NULL DEFAULT 'Applied Agentic AI',
    `tagline`            VARCHAR(191) NULL,
    `logoUrl`            VARCHAR(191) NULL,
    `faviconUrl`         VARCHAR(191) NULL,
    `metaDescription`    TEXT         NULL,
    `footerText`         VARCHAR(191) NULL,
    `socialTwitter`      VARCHAR(191) NULL,
    `socialLinkedin`     VARCHAR(191) NULL,
    `socialYoutube`      VARCHAR(191) NULL,
    `defaultOgImage`     VARCHAR(191) NULL,
    `analyticsId`        VARCHAR(191) NULL,
    `openaiTextModel`    VARCHAR(191) NOT NULL DEFAULT 'gpt-4o',
    `openaiImageModel`   VARCHAR(191) NOT NULL DEFAULT 'dall-e-3',
    `openaiAudioModel`   VARCHAR(191) NOT NULL DEFAULT 'tts-1',
    `openaiTemperature`  DOUBLE       NOT NULL DEFAULT 0.7,
    `openaiMaxTokens`    INTEGER      NOT NULL DEFAULT 2000,
    `openaiImageSize`    VARCHAR(191) NOT NULL DEFAULT '1024x1024',
    `openaiImageQuality` VARCHAR(191) NOT NULL DEFAULT 'standard',
    `openaiTtsVoice`     VARCHAR(191) NOT NULL DEFAULT 'nova',
    `updatedAt`          DATETIME(3)  NOT NULL,
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Topic`
    ADD CONSTRAINT `Topic_moduleId_fkey`
    FOREIGN KEY (`moduleId`) REFERENCES `Module`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `Article`
    ADD CONSTRAINT `Article_coverImageId_fkey`
    FOREIGN KEY (`coverImageId`) REFERENCES `MediaAsset`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `Article`
    ADD CONSTRAINT `Article_authorId_fkey`
    FOREIGN KEY (`authorId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `TopicArticle`
    ADD CONSTRAINT `TopicArticle_topicId_fkey`
    FOREIGN KEY (`topicId`) REFERENCES `Topic`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `TopicArticle`
    ADD CONSTRAINT `TopicArticle_articleId_fkey`
    FOREIGN KEY (`articleId`) REFERENCES `Article`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `ArticleTag`
    ADD CONSTRAINT `ArticleTag_articleId_fkey`
    FOREIGN KEY (`articleId`) REFERENCES `Article`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `ArticleTag`
    ADD CONSTRAINT `ArticleTag_tagId_fkey`
    FOREIGN KEY (`tagId`) REFERENCES `Tag`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `MediaAsset`
    ADD CONSTRAINT `MediaAsset_createdByUserId_fkey`
    FOREIGN KEY (`createdByUserId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `AIUsageLog`
    ADD CONSTRAINT `AIUsageLog_userId_fkey`
    FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `AIUsageLog`
    ADD CONSTRAINT `AIUsageLog_articleId_fkey`
    FOREIGN KEY (`articleId`) REFERENCES `Article`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
"""


# ─────────────────────────────────────────────────────────────────────────────
# DML generation
# ─────────────────────────────────────────────────────────────────────────────

def generate_dml(articles: list[tuple]) -> str:
    """
    articles: list of (title, slug, plain_text, html_content, topic_slug_or_None)
    Returns the full DML SQL string.
    """
    lines: list[str] = []
    lines.append(
        "-- =============================================================================\n"
        "-- Module 1 DML: Seed Data extracted from Module 1 .mhtml files\n"
        "-- =============================================================================\n"
    )

    # ── Admin user (placeholder password hash – change before production) ──
    lines.append(
        "-- Admin user (password: Admin@123  — CHANGE BEFORE PRODUCTION)\n"
        "INSERT IGNORE INTO `User` (`email`, `passwordHash`, `name`, `role`, `updatedAt`)\n"
        "VALUES (\n"
        "    'admin@appliedagentic.com',\n"
        "    '$2a$12$placeholder_replace_with_real_bcrypt_hash',\n"
        "    'Admin User',\n"
        "    'ADMIN',\n"
        "    NOW()\n"
        ");\n"
    )

    # ── Site settings ──
    lines.append(
        "-- Site settings\n"
        "INSERT IGNORE INTO `SiteSettings`\n"
        "    (`id`, `siteName`, `tagline`, `metaDescription`, `footerText`, `updatedAt`)\n"
        "VALUES (\n"
        "    1,\n"
        "    'Applied Agentic AI',\n"
        "    'Master Agentic AI — From Foundations to Enterprise Strategy',\n"
        "    'The definitive knowledge hub for AI professionals mastering Generative and Agentic AI for organizational transformation.',\n"
        "    '© 2026 Applied Agentic AI. All rights reserved.',\n"
        "    NOW()\n"
        ");\n"
    )

    # ── Module 1 ──
    lines.append(
        "-- Module 1\n"
        "INSERT IGNORE INTO `Module`\n"
        "    (`name`, `slug`, `order`, `description`, `icon`, `color`, `isPublished`, `updatedAt`)\n"
        "VALUES (\n"
        "    'Foundations of Generative and Agentic AI',\n"
        "    'module-1-foundations',\n"
        "    1,\n"
        "    'Build your foundational knowledge in Generative AI, large language models, chatbots, cost optimization, and multimedia AI interaction.',\n"
        "    '\\U0001f9e0',\n"
        "    '#6C3DFF',\n"
        "    true,\n"
        "    NOW()\n"
        ");\n"
    )

    # ── Module 1 Topics ──
    topics = [
        ("Generative AI Fundamentals",
         "module-1-generative-ai-fundamentals", 1),
        ("AI Chatbots: Past, Present, and Future",
         "module-1-ai-chatbots-past-present-and-future", 2),
        ("Cost-Optimized Models and Performance Trade-Offs",
         "module-1-cost-optimized-models-and-performance-trade-offs", 3),
        ("Exploring Multimedia and Language Interaction Models",
         "module-1-exploring-multimedia-and-language-interaction-models", 4),
        ("Advanced Applications of Generative AI Tools",
         "module-1-advanced-applications-of-generative-ai-tools", 5),
    ]

    lines.append("-- Module 1 Topics")
    for name, slug, order in topics:
        escaped_name = sql_escape(name)
        desc = f"An in-depth exploration of {name} within the context of Foundations of Generative and Agentic AI."
        lines.append(
            f"INSERT IGNORE INTO `Topic`\n"
            f"    (`moduleId`, `name`, `slug`, `order`, `description`, `color`, `isPublished`, `updatedAt`)\n"
            f"SELECT m.id, '{sql_escape(name)}', '{slug}', {order},\n"
            f"       '{sql_escape(desc)}',\n"
            f"       '#6C3DFF', true, NOW()\n"
            f"FROM `Module` m WHERE m.slug = 'module-1-foundations';\n"
        )

    # ── Articles (one per .mhtml file) ──
    lines.append("\n-- Module 1 Articles (content extracted from .mhtml files)")
    for title, slug, plain_text, html_content, topic_slug in articles:
        word_count = len(plain_text.split())
        reading_time = max(1, round(word_count / 200))
        summary = plain_text[:300].replace("\n", " ").strip()
        if len(plain_text) > 300:
            summary += "..."

        lines.append(
            f"INSERT IGNORE INTO `Article`\n"
            f"    (`title`, `slug`, `summary`, `content`, `status`,\n"
            f"     `publishedAt`, `readingTimeMinutes`, `authorId`,\n"
            f"     `seoTitle`, `seoDescription`, `updatedAt`)\n"
            f"SELECT\n"
            f"    '{sql_escape(title)}',\n"
            f"    '{slug}',\n"
            f"    '{sql_escape(summary)}',\n"
            f"    '{sql_escape(html_content)}',\n"
            f"    'PUBLISHED',\n"
            f"    NOW(),\n"
            f"    {reading_time},\n"
            f"    u.id,\n"
            f"    '{sql_escape(title)} | Applied Agentic AI',\n"
            f"    '{sql_escape(summary[:200])}',\n"
            f"    NOW()\n"
            f"FROM `User` u WHERE u.email = 'admin@appliedagentic.com'\n"
            f"LIMIT 1;\n"
        )

    # ── TopicArticle links ──
    lines.append("\n-- Link articles to their topics")
    for title, slug, plain_text, html_content, topic_slug in articles:
        if topic_slug:
            lines.append(
                f"INSERT IGNORE INTO `TopicArticle` (`topicId`, `articleId`, `orderIndex`)\n"
                f"SELECT t.id, a.id, 1\n"
                f"FROM `Topic` t\n"
                f"JOIN `Article` a ON a.slug = '{slug}'\n"
                f"WHERE t.slug = '{topic_slug}';\n"
            )

    return "\n".join(lines)


# ─────────────────────────────────────────────────────────────────────────────
# Main
# ─────────────────────────────────────────────────────────────────────────────

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    out_dir = script_dir  # write to scripts/

    # ── Extract text from every .mhtml file ──
    articles: list[tuple] = []
    for fname, title, slug, topic_slug in MODULE1_FILES:
        path = os.path.join(MODULE1_DIR, fname)
        if not os.path.exists(path):
            print(f"  [WARN] File not found: {path}")
            continue

        plain = extract_text_from_mhtml(path)

        # Drop the repeated module header line if present
        lines = plain.split("\n")
        if lines and "Module 1. Foundations of Generative and Agentic AI" in lines[0]:
            lines = lines[1:]
        plain = "\n".join(lines)

        html = plain_to_html(plain)
        articles.append((title, slug, plain, html, topic_slug))
        print(f"  [OK] {fname}  ({len(plain)} chars)")

    # ── Write DDL ──
    ddl_path = os.path.join(out_dir, "module1-ddl.sql")
    with open(ddl_path, "w", encoding="utf-8") as fh:
        fh.write(DDL)
    print(f"\n[DDL] Written → {ddl_path}")

    # ── Write DML ──
    dml_path = os.path.join(out_dir, "module1-dml.sql")
    dml = generate_dml(articles)
    with open(dml_path, "w", encoding="utf-8") as fh:
        fh.write(dml)
    print(f"[DML] Written → {dml_path}")


if __name__ == "__main__":
    main()
