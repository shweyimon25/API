import z from "zod";

export const createConsSchema = z.object({
  name: z.string({
    required_error: "Name is required",
    invalid_type_error: "Name must be a string",
  }),
});

export const updateConsSchema = z.object({
  name: z.string().optional(),
});

export type CreateConsInput = z.infer<typeof createConsSchema>;
export type UpdateConsInput = z.infer<typeof updateConsSchema>;
