import { Permission, Role, User } from "@prisma/client";
import { Request, Response, NextFunction } from "express";
import { ForbiddenException } from "../../helpers/exceptions";

export const hasPermission = (permissions: string | string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRoles = (req.user as User & { roles: any[] }).roles || [];

    let currentPermissions: Permission[] = [];

    userRoles.forEach((userRole: any) => {
      if (userRole.role && userRole.role.permissions) {
        userRole.role.permissions.forEach((rp: any) => {
          if (rp.permission) {
            currentPermissions.push(rp.permission);
          }
        });
      }
    });

    const requiredPermissions = Array.isArray(permissions) ? permissions : [permissions];
    const currentPermissionNames = currentPermissions.map(p => p.name);

    const hasAllPermissions = requiredPermissions.every(perm => currentPermissionNames.includes(perm));

    if (!hasAllPermissions) {
      throw new ForbiddenException("You don't have right permission.");
    }

    next();
  };
};
