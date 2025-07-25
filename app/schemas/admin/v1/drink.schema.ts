import z from "zod";
import prisma from "../../../../prisma/client";

export const createDrinkSchema = z.object({
    name: z
        .string()
        .min(1, { message: "Name is required" })
        .refine(
            async (arg) => {
                const result = await prisma.place.findFirst({
                    where: { name: arg },
                });
                return !result;
            },
            {
                message: "Name is already exist",
            }
        ),
});

export const updateDrinkSchema = z.object({
    name: z.string().optional(),
});

export type CreateDrinkInput = z.infer<typeof createDrinkSchema>;
export type UpdateDrinkInput = z.infer<typeof updateDrinkSchema>;
