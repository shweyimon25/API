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

      const user = await prisma.user.findFirst({
        where: { id: payload.id },
        include: {
          role: true
        }
      });

      return done(null, user);

    } catch (error) {
      return done(error);
    }
  })
);
