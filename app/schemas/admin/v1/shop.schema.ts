import z from "zod";

export const createShopSchema = z.object({
  name: z.string({
    required_error: "Name is required",
    invalid_type_error: "Name must be a string",
  }),
  image: z
    .string({
      invalid_type_error: "Image must be a string",
    })
    .optional(),
  memberId: z.coerce.number({
    required_error: "Member id is required",
    invalid_type_error: "Member id must be number",
  }),
  shopLevelId: z
    .coerce
    .number({
      invalid_type_error: "Shop level id must be number",
    })
    .optional(),
  status: z.boolean().optional(),
});

export const updateShopSchema = z.object({
  name: z.string().optional(),
  image: z.string().optional(),
  memberId: z.coerce.number().optional(),
  shopLevelId: z.coerce.number().optional(),
  status: z.boolean().optional(),
});

export type CreateShopInput = z.infer<typeof createShopSchema>;
export type UpdateShopInput = z.infer<typeof updateShopSchema>;

