import z from "zod";
import prisma from "../../../../prisma/client";

export const createFloorSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Name is required" })
    .refine(
      async (arg) => {
        const result = await prisma.floor.findFirst({
          where: { name: arg },
        });
        return !result;
      },
      {
        message: "Name is already exist",
      }
    ),
});

export const updateFloorSchema = z.object({
  name: z.string().optional(),
});

export type CreateFloorInput = z.infer<typeof createFloorSchema>;
export type UpdateFloorInput = z.infer<typeof updateFloorSchema>;
