import {
  Controller,
  Post,
  Body,
  HttpStatus,
  HttpCode,
  UseGuards,
} from '@nestjs/common';
import { ActiveUser } from '../decorators/active-user.decorator';
import { Public } from '../decorators/public.decorator';
import { SignInDto } from './dto/sign-in.dto';

import { ActiveUserData } from '../interfaces/active-user-data.interface';
import { AuthService } from './auth.service';
import { RefreshTokenGuard } from '../guards/refresh-token.guard';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('local/sign-up')
  signUp(@Body() authDto: CreateUserDto) {
    return this.authService.signUp(authDto);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('local/sign-in')
  async signIn(@Body() authDto: SignInDto) {
    return this.authService.signIn(authDto);
  }

  @Public()
  @UseGuards(RefreshTokenGuard)
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  refreshTokens(@ActiveUser() user: ActiveUserData) {
    return this.authService.refreshTokens(user);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('logout')
  logout(@ActiveUser() user: ActiveUserData) {
    return this.authService.logout(user);
  }
}
