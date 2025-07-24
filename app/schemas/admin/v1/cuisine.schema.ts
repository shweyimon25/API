import z from "zod";
import prisma from "../../../../prisma/client";

export const createCuisineSchema = z.object({
    name: z
        .string()
        .min(1, { message: "Name is required" })
        .refine(
            async (arg) => {
                const result = await prisma.cuisine.findFirst({
                    where: { name: arg },
                });
                return !result;
            },
            {
                message: "Name is already exist",
            }
        ),
});

export const updateCuisineSchema = z.object({
    name: z.string().optional(),
});

export type CreateCuisineInput = z.infer<typeof createCuisineSchema>;
export type UpdateCuisineInput = z.infer<typeof updateCuisineSchema>;
