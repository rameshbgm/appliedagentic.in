-- Create ArticleSection table if missing
CREATE TABLE IF NOT EXISTS `ArticleSection` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `articleId` INT NOT NULL,
  `title` VARCHAR(191) NOT NULL DEFAULT '',
  `content` LONGTEXT NOT NULL,
  `order` INT NOT NULL DEFAULT 0,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `ArticleSection_articleId_idx`(`articleId`),
  INDEX `ArticleSection_order_idx`(`order`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Add foreign key constraint safely (only if it doesn't exist)
SET @fk_name := 'ArticleSection_articleId_fkey';
SET @exists := (
  SELECT COUNT(1) FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
  WHERE CONSTRAINT_SCHEMA = DATABASE()
    AND TABLE_NAME = 'ArticleSection'
    AND CONSTRAINT_NAME = @fk_name
);
-- If foreign key doesn't exist, add it
SET @s := IF(@exists = 0, CONCAT('ALTER TABLE `ArticleSection` ADD CONSTRAINT `', @fk_name, '` FOREIGN KEY (`articleId`) REFERENCES `Article`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;'), 'SELECT 1;');
PREPARE stmt FROM @s; EXECUTE stmt; DEALLOCATE PREPARE stmt;
