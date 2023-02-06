import { ArrayMinSize, IsEnum } from 'class-validator';
import { SignInDto } from 'src/iam/auth/dto/sign-in.dto';
import { Role } from 'src/iam/enums/role.enum';

export class CreateUserDto extends SignInDto {
  @IsEnum(Role, { each: true })
  @ArrayMinSize(1)
  roles: Array<Role>;
}
