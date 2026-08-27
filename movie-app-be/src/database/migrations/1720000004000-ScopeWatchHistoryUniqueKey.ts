import { MigrationInterface, QueryRunner } from 'typeorm'

export class ScopeWatchHistoryUniqueKey1720000004000 implements MigrationInterface {
  name = 'ScopeWatchHistoryUniqueKey1720000004000'

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP INDEX `UQ_watch_history_user_episode` ON `watch_history`',
    )
    await queryRunner.query(
      'CREATE UNIQUE INDEX `UQ_watch_history_user_movie_episode` ON `watch_history` (`userId`, `movieSlug`, `episodeSlug`)',
    )
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP INDEX `UQ_watch_history_user_movie_episode` ON `watch_history`',
    )
    await queryRunner.query(
      'CREATE UNIQUE INDEX `UQ_watch_history_user_episode` ON `watch_history` (`userId`, `episodeSlug`)',
    )
  }
}
