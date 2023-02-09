import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { HashingService } from 'src/hashing/hashing.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly hashingService: HashingService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const hashPassword = await this.hashingService.hash(
        createUserDto.password,
      );

      const userDto: CreateUserDto = {
        ...createUserDto,
        password: hashPassword,
      };

      const createUser = this.userRepository.create(userDto);
      const user = await this.userRepository.save(createUser);
      return user;
    } catch (error) {
      const pgUniqueViolationErrorCode = '23505';
      if (error.code === pgUniqueViolationErrorCode) {
        throw new ConflictException('User Name Exist!');
      }

      throw error;
    }
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
    const hashRT = refreshToken
      ? await this.hashingService.hash(refreshToken)
      : '';

    const updateUser = await this.userRepository.preload({
      id,
      hashRT,
    });

    if (!updateUser) throw new BadRequestException(`User #${id} not found`);
    return this.userRepository.save(updateUser);
  }
}
