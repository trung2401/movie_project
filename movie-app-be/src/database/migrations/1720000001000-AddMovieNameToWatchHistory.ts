import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddMovieNameToWatchHistory1720000001000 implements MigrationInterface {
  name = 'AddMovieNameToWatchHistory1720000001000'

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `watch_history` ADD `movieName` varchar(255) NULL AFTER `movieSlug`',
    )
    await queryRunner.query(
      'UPDATE `watch_history` SET `movieName` = `movieSlug` WHERE `movieName` IS NULL',
    )
    await queryRunner.query(
      'ALTER TABLE `watch_history` MODIFY `movieName` varchar(255) NOT NULL',
    )
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `watch_history` DROP COLUMN `movieName`',
    )
  }
}
