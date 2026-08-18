import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { User, UserRole } from './entities/user.entity'

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
  ) {}

  findByEmail(email: string, includePassword = false): Promise<User | null> {
    const query = this.usersRepository
      .createQueryBuilder('user')
      .where('user.email = :email', { email })
    if (includePassword) query.addSelect('user.password')
    return query.getOne()
  }

  async create(
    email: string,
    password: string,
    role: UserRole = 'user',
  ): Promise<User> {
    return this.usersRepository.save(
      this.usersRepository.create({ email, password, role }),
    )
  }
}
