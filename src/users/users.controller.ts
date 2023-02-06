import { Controller, Get, Param } from '@nestjs/common';
import { Roles } from 'src/iam/decorators/roles.decorator';
import { Role } from 'src/iam/enums/role.enum';

import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Roles(Role.User)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOneId(+id);
  }
}
