import {
  ExtractJwt,
  Strategy,
  StrategyOptions,
  VerifiedCallback,
} from "passport-jwt";
import passport from "passport";
import dotenv from "dotenv";
import prisma from "../../../prisma/client";
dotenv.config();

const opts: StrategyOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET as string,
};

passport.use(
  new Strategy(opts, async (payload, done: VerifiedCallback) => {
    try {
      if (payload.loginType === "admin") {
        const user = await prisma.user.findFirst({
          where: { id: payload.id },
          include: {
            roles: {
              include: {
                role: {
                  include: {
                    permissions: {
                      select: {
                        permission: {
                          select: {
                            name: true,
                            id: true,
                            description: true,
                          }
                        }
                      }
                    },
                  }
                }
              }
            }
          }
        });
        return done(null, user);
      } else {
        const member = await prisma.member.findUnique({
          where: { id: payload.id }, include: {
            profile: true,
            memberType: true,
            providerTypes: true,
          }
        });
        return done(null, member);
      }
    } catch (error) {
      return done(error);
    }
  })
);
