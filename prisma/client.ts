import "dotenv/config";
import { Prisma, PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const SOFT_DELETE_MODELS = new Set([
    Prisma.ModelName.User,
    Prisma.ModelName.Role,
    Prisma.ModelName.MemberPlan,
    Prisma.ModelName.Pros,
    Prisma.ModelName.Cons,
    Prisma.ModelName.Member,
    Prisma.ModelName.ShopLevel,
    Prisma.ModelName.Shop,
    Prisma.ModelName.Tag,
    Prisma.ModelName.BodyGoal,
    Prisma.ModelName.ProficientLevel,
    Prisma.ModelName.Category,
    Prisma.ModelName.Place,
    Prisma.ModelName.Workout,
    Prisma.ModelName.PhysicalLimitation,
    Prisma.ModelName.DietType,
    Prisma.ModelName.BodyAttentionArea,
    Prisma.ModelName.MealType,
    Prisma.ModelName.Meal,
    Prisma.ModelName.BadHabit,
    Prisma.ModelName.BankInformation,
    Prisma.ModelName.Post,
]);

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter }).$extends({
    query: {
        $allModels: {
            async findMany({ model, args, query }: any) {
                if (!model || !SOFT_DELETE_MODELS.has(model)) {
                    return query(args);
                }

                args.where ??= {};

                if (!('deletedAt' in args.where)) {
                    (args.where as any).deletedAt = null;
                }

                return query(args);
            },

            async findFirst({ model, args, query }: any) {
                if (!model || !SOFT_DELETE_MODELS.has(model)) {
                    return query(args);
                }

                args.where ??= {};
                (args.where as any).deletedAt ??= null;

                return query(args);
            },

            async findUnique({ model, args, query }: any) {
                if (!model || !SOFT_DELETE_MODELS.has(model)) {
                    return query(args);
                }

                args.where ??= {};
                (args.where as any).deletedAt = null;

                return query(args);
            }
        },
    },
});

export default prisma;