import z from "zod";
import prisma from "../../../../prisma/client";

export const createDietarySchema = z.object({
    name: z
        .string()
        .min(1, { message: "Name is required" })
        .refine(
            async (arg) => {
                const result = await prisma.dietary.findFirst({
                    where: { name: arg },
                });
                return !result;
            },
            {
                message: "Name is already exist",
            }
        ),
});

export const updateDietarySchema = z.object({
    name: z.string().optional(),
});

export type CreateDietaryInput = z.infer<typeof createDietarySchema>;
export type UpdateDietaryInput = z.infer<typeof updateDietarySchema>;
