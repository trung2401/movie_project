import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm'

import { Favorite } from '../../favorites/entities/favorite.entity'
import { Rating } from '../../ratings/entities/rating.entity'
import { WatchHistory } from '../../watch-history/entities/watch-history.entity'

export type UserRole = 'user' | 'admin'

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ unique: true })
  email: string

  @Column({ select: false })
  password: string

  @Column({ type: 'varchar', length: 16, default: 'user' })
  role: UserRole

  @OneToMany(() => Favorite, (favorite) => favorite.user)
  favorites: Favorite[]

  @OneToMany(() => WatchHistory, (history) => history.user)
  watchHistory: WatchHistory[]

  @OneToMany(() => Rating, (rating) => rating.user)
  ratings: Rating[]

  @CreateDateColumn()
  createdAt: Date
}
