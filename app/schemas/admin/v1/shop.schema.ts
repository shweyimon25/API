import z from "zod";
import { Status } from "@prisma/client";

export const createShopSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  memberId: z.coerce.number().min(1, { message: "Member is required" }),
  shopLevelId: z
    .coerce
    .number()
    .min(1, { message: "Shop level is required" })
    .optional(),
  status: z.enum([Status.ACTIVE, Status.INACTIVE], { message: "Status must be ACTIVE or INACTIVE" }).optional(),
});

export const updateShopSchema = z.object({
  name: z.string().optional(),
  memberId: z.coerce.number().optional(),
  shopLevelId: z.coerce.number().optional(),
  status: z.enum([Status.ACTIVE, Status.INACTIVE], { message: "Status must be ACTIVE or INACTIVE" }).optional(),
});

export type CreateShopInput = z.infer<typeof createShopSchema>;
export type UpdateShopInput = z.infer<typeof updateShopSchema>;

