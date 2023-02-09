import { Module } from '@nestjs/common';
import { Argon2Service } from './argon2.service';
import { HashingService } from './hashing.service';

@Module({
  providers: [
    {
      provide: HashingService,
      useClass: Argon2Service,
    },
  ],
  exports: [HashingService],
})
export class HashingModule {}
