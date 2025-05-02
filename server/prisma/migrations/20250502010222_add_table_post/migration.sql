-- CreateTable
CREATE TABLE `tb_posts` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `content` TEXT NULL,
    `status` ENUM('draf', 'publish') NOT NULL DEFAULT 'publish',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `tb_posts` ADD CONSTRAINT `tb_posts_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `tb_users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
