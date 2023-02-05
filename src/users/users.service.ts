import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as argon2 from 'argon2';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    /**
     * hash password
     * create user with hash password in db
     * return user
     */

    const hashPassword = await argon2.hash(createUserDto.password);

    const createUser = this.userRepository.create({
      ...createUserDto,
      password: hashPassword,
    });

    return this.userRepository.save(createUser);
  }

  findAll() {
    return this.userRepository.find();
  }

  async findOneId(id: number) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) throw new BadRequestException(`User #${id} not found`);
    return user;
  }

  async findOneByName(name: string) {
    const user = await this.userRepository.findOneBy({ name });
    if (!user) throw new BadRequestException(`User #${name} not found`);
    return user;
  }

  async updateRefreshToken(id: number, refreshToken: string) {
    const hashRT = refreshToken ? await argon2.hash(refreshToken) : '';

    const updateUser = await this.userRepository.preload({
      id,
      hashRT,
    });

    if (!updateUser) throw new BadRequestException(`User #${id} not found`);
    return this.userRepository.save(updateUser);
  }
}
