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
