import z from "zod";

export const createProsSchema = z.object({
  name: z.string({
    required_error: "Name is required",
    invalid_type_error: "Name must be a string",
  }),
});

export const updateProsSchema = z.object({
  name: z.string().optional(),
});

export type CreateProsInput = z.infer<typeof createProsSchema>;
export type UpdateProsInput = z.infer<typeof updateProsSchema>;
