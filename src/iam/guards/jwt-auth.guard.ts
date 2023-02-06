import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { PUBLIC_KEY } from '../decorators/public.decorator';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Role } from '../enums/role.enum';
import { ActiveUserData } from '../interfaces/active-user-data.interface';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.validatePublic(context);
    return isPublic ? true : super.canActivate(context);
  }

  handleRequest(err: any, user: any, _info, context: ExecutionContext) {
    // You can throw an exception based on either "info" or "err" arguments
    if (err || !user) throw err || new UnauthorizedException();

    console.log({ userHandle: user });

    const isValid = this.validateRoles(context, user);

    if (!isValid) throw new UnauthorizedException('Roles access denied');

    return user;
  }

  validatePublic(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride(PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    return isPublic ? true : false;
  }

  validateRoles(context: ExecutionContext, user: ActiveUserData) {
    const requiredRoles =
      this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? [];

    const isAdmin = user.roles?.includes(Role.Admin);

    if (isAdmin) return true;

    return requiredRoles.some((role) => user.roles?.includes(role));
  }
}
