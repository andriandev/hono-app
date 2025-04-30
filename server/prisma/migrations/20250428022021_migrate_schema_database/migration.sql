-- CreateTable
CREATE TABLE `tb_users` (
    `id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_links` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `alias` VARCHAR(60) NULL,
    `destination` VARCHAR(350) NOT NULL,
    `view` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `tb_links` ADD CONSTRAINT `tb_links_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `tb_users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
