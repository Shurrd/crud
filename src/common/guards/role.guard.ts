import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { Role } from '../enums';
import { ROLES_KEY } from '../decorators';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authService: AuthService,
  ) {}
  canActivate(context: ExecutionContext): boolean {
    const authorizedRoles = this.reflector.getAllAndOverride<Role[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!authorizedRoles) return true;

    const user = context.switchToHttp().getRequest().user;

    const hasAuthorizedRoles = authorizedRoles.some(
      (role) => user.role === role,
    );

    return hasAuthorizedRoles;
  }
}
