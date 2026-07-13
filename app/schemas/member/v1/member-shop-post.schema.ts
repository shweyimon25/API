import z from "zod";

export const memberShopPostCreateSchema = z.object({
  caption: z.string("Caption is required.").min(1, "Caption is required."),
  view_type: z.enum(["public", "friend", "only_me"]),
  price: z.coerce.number().default(0).optional(),
  currency: z.string().default("ks").optional(),
});

export const memberShopPostUpdateSchema = z.object({
  caption: z.string().optional(),
  view_type: z.enum(["public", "friend", "only_me"]).optional(),
  price: z.coerce.number().optional(),
  currency: z.string().optional(),
});

export type MemberShopPostCreateInput = z.infer<
  typeof memberShopPostCreateSchema
>;
export type MemberShopPostUpdateInput = z.infer<
  typeof memberShopPostUpdateSchema
>;
