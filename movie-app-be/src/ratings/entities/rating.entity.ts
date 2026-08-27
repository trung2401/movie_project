import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm'

import { User } from '../../users/entities/user.entity'

@Entity('ratings')
@Unique(['user', 'movieSlug'])
@Index(['movieSlug'])
@Index(['user', 'updatedAt'])
export class Rating {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ManyToOne(() => User, (user) => user.ratings, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'userId' })
  user: User

  @Column()
  movieSlug: string

  @Column({ type: 'tinyint' })
  score: number

  @Column({ type: 'text', nullable: true })
  comment: string | null

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
