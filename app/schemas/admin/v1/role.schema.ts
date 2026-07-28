import z from "zod";

export const updateRoleSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }).optional(),
  description: z.string().optional().nullable(),
});

export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
