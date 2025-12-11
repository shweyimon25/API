import z from "zod";
import { Status } from "@prisma/client";

export const createShopLevelSchema = z.object({
  name: z.string({
    required_error: "Name is required",
    invalid_type_error: "Name must be a string",
  }),
  price: z.coerce.number({
    required_error: "Price is required",
    invalid_type_error: "Price must be number",
  }),
  duration: z.coerce.number({
    required_error: "Duration is required",
    invalid_type_error: "Duration must be number",
  }),
  description: z
    .string({
      invalid_type_error: "Description must be string",
    })
    .optional(),
  status: z.nativeEnum(Status).optional(),
});

export const updateShopLevelSchema = z.object({
  name: z.string().optional(),
  price: z.coerce.number().optional(),
  duration: z.coerce.number().optional(),
  description: z.string().optional(),
  status: z.nativeEnum(Status).optional(),
});

export type CreateShopLevelInput = z.infer<typeof createShopLevelSchema>;
export type UpdateShopLevelInput = z.infer<typeof updateShopLevelSchema>;
