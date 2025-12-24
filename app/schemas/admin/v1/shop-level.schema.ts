import z from "zod";
import { Status } from "@prisma/client";

export const createShopLevelSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  price: z.coerce.number().min(1, { message: "Price is required" }),
  duration: z.coerce.number().min(1, { message: "Duration is required" }),
  description: z
    .string()
    .optional(),
  status: z.nativeEnum(Status, { message: "Status must be ACTIVE | INACTIVE" }).optional(),
});

export const updateShopLevelSchema = z.object({
  name: z.string().optional(),
  price: z.coerce.number().optional(),
  duration: z.coerce.number().optional(),
  description: z.string().optional(),
  status: z.nativeEnum(Status, { message: "Status must be ACTIVE | INACTIVE" }).optional(),
});

export type CreateShopLevelInput = z.infer<typeof createShopLevelSchema>;
export type UpdateShopLevelInput = z.infer<typeof updateShopLevelSchema>;
