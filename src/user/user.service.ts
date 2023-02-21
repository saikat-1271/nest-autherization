import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entity/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async createUser(data: any): Promise<User> {
    return await this.userRepository.save(data);
  }

  async findOne(data: any): Promise<User> {
    return await this.userRepository.findOne(data);
  }
}
