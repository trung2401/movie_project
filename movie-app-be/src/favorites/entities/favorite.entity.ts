import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm'

import { User } from '../../users/entities/user.entity'

@Entity('favorites')
@Unique(['user', 'movieSlug'])
@Index(['movieSlug'])
@Index(['user', 'addedAt'])
export class Favorite {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ManyToOne(() => User, (user) => user.favorites, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'userId' })
  user: User

  @Column()
  movieSlug: string

  @Column({ type: 'varchar', length: 255 })
  movieName: string

  @CreateDateColumn()
  addedAt: Date
}
