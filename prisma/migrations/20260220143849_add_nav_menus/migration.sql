-- CreateTable
CREATE TABLE `NavMenu` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `isVisible` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `NavMenu_slug_key`(`slug`),
    INDEX `NavMenu_slug_idx`(`slug`),
    INDEX `NavMenu_order_idx`(`order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `NavSubMenu` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `menuId` INTEGER NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `isVisible` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `NavSubMenu_slug_key`(`slug`),
    INDEX `NavSubMenu_slug_idx`(`slug`),
    INDEX `NavSubMenu_menuId_idx`(`menuId`),
    INDEX `NavSubMenu_order_idx`(`order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SubMenuArticle` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `subMenuId` INTEGER NOT NULL,
    `articleId` INTEGER NOT NULL,
    `orderIndex` INTEGER NOT NULL DEFAULT 0,

    INDEX `SubMenuArticle_subMenuId_idx`(`subMenuId`),
    INDEX `SubMenuArticle_articleId_idx`(`articleId`),
    UNIQUE INDEX `SubMenuArticle_subMenuId_articleId_key`(`subMenuId`, `articleId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `NavSubMenu` ADD CONSTRAINT `NavSubMenu_menuId_fkey` FOREIGN KEY (`menuId`) REFERENCES `NavMenu`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SubMenuArticle` ADD CONSTRAINT `SubMenuArticle_subMenuId_fkey` FOREIGN KEY (`subMenuId`) REFERENCES `NavSubMenu`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SubMenuArticle` ADD CONSTRAINT `SubMenuArticle_articleId_fkey` FOREIGN KEY (`articleId`) REFERENCES `Article`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
