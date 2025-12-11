import { z } from "zod";
import { Status } from "@prisma/client";

export const createMemberPlanSchema = z.object({
  name: z.string({
    required_error: "Name is required",
    invalid_type_error: "Name must be string",
  }),
  memberTypeId: z.coerce.number({
    required_error: "Member type is required",
    invalid_type_error: "Member type must be number",
  }),
  price: z.coerce.number({
    required_error: "Price is required",
    invalid_type_error: "Price must be number",
  }),
  duration: z.coerce
    .number({
      required_error: "Duration is required",
      invalid_type_error: "Duration must be number",
    })
    .default(1),
  proIds: z.array(z.coerce.number()).optional(),
  conIds: z.array(z.coerce.number()).optional(),
  isVideoGroup: z.boolean({
    invalid_type_error: "Is video group must be true or false",
  }),
  status: z.nativeEnum(Status).optional(),
});

export const updateMemberPlanSchema = z.object({
  name: z.string().optional(),
  memberTypeId: z.coerce.number().optional(),
  price: z.coerce.number().optional(),
  duration: z.coerce.number().optional(),
  proIds: z.array(z.coerce.number()).optional(),
  conIds: z.array(z.coerce.number()).optional(),
  isVideoGroup: z.boolean().optional(),
  status: z.nativeEnum(Status).optional(),
});

export type CreateMemberPlanInput = z.infer<typeof createMemberPlanSchema>;
export type UpdateMemberPlanInput = z.infer<typeof updateMemberPlanSchema>;
