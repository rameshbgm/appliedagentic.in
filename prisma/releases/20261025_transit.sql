-- Additive schema required by the Transit release. Existing rows are preserved.
-- Apply only missing objects; scripts/deploy-schema.cjs checks before executing.
ALTER TABLE `SiteSettings` ADD COLUMN `siteUrl` VARCHAR(191) NULL;
ALTER TABLE `SiteSettings` ADD COLUMN `showArticleImages` BOOLEAN NOT NULL DEFAULT true;
CREATE TABLE `NewsletterSubscriber` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(191) NOT NULL,
  `token` VARCHAR(191) NOT NULL,
  `source` VARCHAR(191) NOT NULL DEFAULT 'website',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `unsubscribedAt` DATETIME(3) NULL,
  UNIQUE INDEX `NewsletterSubscriber_email_key` (`email`),
  UNIQUE INDEX `NewsletterSubscriber_token_key` (`token`),
  INDEX `NewsletterSubscriber_createdAt_idx` (`createdAt`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
