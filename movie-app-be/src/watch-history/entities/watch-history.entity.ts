import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm'

import { User } from '../../users/entities/user.entity'

@Entity('watch_history')
@Unique(['user', 'episodeSlug'])
@Index(['movieSlug'])
export class WatchHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ManyToOne(() => User, (user) => user.watchHistory, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'userId' })
  user: User

  @Column()
  movieSlug: string

  @Column({ type: 'varchar', length: 255 })
  movieName: string

  @Column()
  episodeSlug: string

  @Column({ type: 'int', default: 0 })
  progressSeconds: number

  @UpdateDateColumn()
  updatedAt: Date
}
