import { Module } from '@nestjs/common';

import { UsersModule } from './users/users.module';
import { IamModule } from './iam/iam.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HashingModule } from './hashing/hashing.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      database: 'postgres',
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'pass123',
      autoLoadEntities: true,
      synchronize: true, // only in development, disable it in production
    }),
    UsersModule,
    IamModule,
    HashingModule,
  ],
})
export class AppModule {}
