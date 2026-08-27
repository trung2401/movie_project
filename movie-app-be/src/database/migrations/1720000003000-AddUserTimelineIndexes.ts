import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddUserTimelineIndexes1720000003000 implements MigrationInterface {
  name = 'AddUserTimelineIndexes1720000003000'

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE INDEX `IDX_favorites_user_addedAt` ON `favorites` (`userId`, `addedAt`)',
    )
    await queryRunner.query(
      'CREATE INDEX `IDX_watch_history_user_updatedAt` ON `watch_history` (`userId`, `updatedAt`)',
    )
    await queryRunner.query(
      'CREATE INDEX `IDX_ratings_user_updatedAt` ON `ratings` (`userId`, `updatedAt`)',
    )
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP INDEX `IDX_ratings_user_updatedAt` ON `ratings`',
    )
    await queryRunner.query(
      'DROP INDEX `IDX_watch_history_user_updatedAt` ON `watch_history`',
    )
    await queryRunner.query(
      'DROP INDEX `IDX_favorites_user_addedAt` ON `favorites`',
    )
  }
}
