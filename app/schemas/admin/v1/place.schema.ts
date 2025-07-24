import z from "zod";
import prisma from "../../../../prisma/client";

export const createPlaceSchema = z.object({
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

export const updatePlaceSchema = z.object({
    name: z.string().optional(),
});

export type CreatePlaceInput = z.infer<typeof createPlaceSchema>;
export type UpdatePlaceInput = z.infer<typeof updatePlaceSchema>;
