import { Prisma, PrismaClient } from "@prisma/client";

const SOFT_DELETE_MODELS = new Set([
    Prisma.ModelName.User,
]);

const prisma = new PrismaClient().$extends({
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
        },
    },
});

export default prisma;