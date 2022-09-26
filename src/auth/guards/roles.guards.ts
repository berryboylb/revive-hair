import { Reflector } from '@nestjs/core';
import { OrganizationalAdminRole } from '../../user/constants';
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!roles) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user) return false;
    if (user.role === OrganizationalAdminRole && !user.organizationId)
      return false;
    return roles.includes(user.role);
  }
}
