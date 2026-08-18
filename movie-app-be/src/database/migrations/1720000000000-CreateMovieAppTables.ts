import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateMovieAppTables1720000000000 implements MigrationInterface {
  name = 'CreateMovieAppTables1720000000000'

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE \`users\` (
        \`id\` char(36) NOT NULL,
        \`email\` varchar(255) NOT NULL,
        \`password\` varchar(255) NOT NULL,
        \`role\` varchar(16) NOT NULL DEFAULT 'user',
        \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        UNIQUE INDEX \`UQ_users_email\` (\`email\`),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB
    `)
    await queryRunner.query(`
      CREATE TABLE \`favorites\` (
        \`id\` char(36) NOT NULL,
        \`userId\` char(36) NOT NULL,
        \`movieSlug\` varchar(255) NOT NULL,
        \`addedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        INDEX \`IDX_favorites_movieSlug\` (\`movieSlug\`),
        UNIQUE INDEX \`UQ_favorites_user_movie\` (\`userId\`, \`movieSlug\`),
        PRIMARY KEY (\`id\`),
        CONSTRAINT \`FK_favorites_user\` FOREIGN KEY (\`userId\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `)
    await queryRunner.query(`
      CREATE TABLE \`watch_history\` (
        \`id\` char(36) NOT NULL,
        \`userId\` char(36) NOT NULL,
        \`movieSlug\` varchar(255) NOT NULL,
        \`episodeSlug\` varchar(255) NOT NULL,
        \`progressSeconds\` int NOT NULL DEFAULT 0,
        \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        INDEX \`IDX_watch_history_movieSlug\` (\`movieSlug\`),
        UNIQUE INDEX \`UQ_watch_history_user_episode\` (\`userId\`, \`episodeSlug\`),
        PRIMARY KEY (\`id\`),
        CONSTRAINT \`FK_watch_history_user\` FOREIGN KEY (\`userId\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `)
    await queryRunner.query(`
      CREATE TABLE \`ratings\` (
        \`id\` char(36) NOT NULL,
        \`userId\` char(36) NOT NULL,
        \`movieSlug\` varchar(255) NOT NULL,
        \`score\` tinyint NOT NULL,
        \`comment\` text NULL,
        \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        INDEX \`IDX_ratings_movieSlug\` (\`movieSlug\`),
        UNIQUE INDEX \`UQ_ratings_user_movie\` (\`userId\`, \`movieSlug\`),
        PRIMARY KEY (\`id\`),
        CONSTRAINT \`FK_ratings_user\` FOREIGN KEY (\`userId\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `)
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE `ratings`')
    await queryRunner.query('DROP TABLE `watch_history`')
    await queryRunner.query('DROP TABLE `favorites`')
    await queryRunner.query('DROP TABLE `users`')
  }
}
