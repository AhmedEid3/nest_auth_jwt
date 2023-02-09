import { Module } from '@nestjs/common';

import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './auth/strategies/jwt.strategy';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { HashingService } from '../hashing/hashing.service';
import { AuthService } from './auth/auth.service';
import { Argon2Service } from '../hashing/argon2.service';
import { JwtRefreshStrategy } from './auth/strategies/jwt-refresh.strategy';
import { AuthController } from './auth/auth.controller';
import { HashingModule } from 'src/hashing/hashing.module';

@Module({
  imports: [JwtModule, UsersModule, HashingModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    JwtRefreshStrategy,
    {
      provide: HashingService,
      useClass: Argon2Service,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class IamModule {}
