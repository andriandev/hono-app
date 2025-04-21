-- DropIndex
DROP INDEX `tb_links_alias_key` ON `tb_links`;

-- AlterTable
ALTER TABLE `tb_links` MODIFY `alias` VARCHAR(12) NULL;
