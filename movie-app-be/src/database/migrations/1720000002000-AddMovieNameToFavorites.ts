import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddMovieNameToFavorites1720000002000 implements MigrationInterface {
  name = 'AddMovieNameToFavorites1720000002000'

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `favorites` ADD `movieName` varchar(255) NULL AFTER `movieSlug`',
    )
    await queryRunner.query(
      'UPDATE `favorites` SET `movieName` = `movieSlug` WHERE `movieName` IS NULL',
    )
    await queryRunner.query(
      'ALTER TABLE `favorites` MODIFY `movieName` varchar(255) NOT NULL',
    )
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `favorites` DROP COLUMN `movieName`')
  }
}
