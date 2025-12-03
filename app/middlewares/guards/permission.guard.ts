import { Request, Response, NextFunction } from "express";

export const hasPermission = (permissions: string | string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    console.log(req.user)
    // @ts-ignore - user is attached by passport
    // const userPermissions = req.user?.permissions || [];

    // const requiredPermissions = Array.isArray(permissions)
    //   ? permissions
    //   : [permissions];

    // const hasPermission = requiredPermissions.some((permission) =>
    //   userPermissions.includes(permission)
    // );

    // if (!hasPermission) {
    //   return res.status(403).json({
    //     message:
    //       "You do not have the required permissions to access this resource",
    //   });
    // }

    next();
  };
};
