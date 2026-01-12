import { z } from "zod";
import { Status } from "@prisma/client";

export const createMemberPlanSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  memberTypeId: z.coerce.number({
    message: "Member type is required",
  }),
  price: z.coerce.number({
    message: "Price is required",
  }),
  duration: z.coerce
    .number({
      message: "Duration is required",
    })
    .default(1),
  proIds: z.array(z.coerce.number({
    message: "Pros are required",
  })),
  conIds: z.array(z.coerce.number({
    message: "Cons are required",
  })),
  isVideoGroup: z.coerce.boolean().optional(),
  status: z.enum([Status.ACTIVE, Status.INACTIVE], { message: "Status must be ACTIVE or INACTIVE" }).optional(),
});

export const updateMemberPlanSchema = z.object({
  name: z.string().optional(),
  memberTypeId: z.coerce.number().optional(),
  price: z.coerce.number().optional(),
  duration: z.coerce.number().optional(),
  proIds: z.array(z.coerce.number()).optional(),
  conIds: z.array(z.coerce.number()).optional(),
  isVideoGroup: z.coerce.boolean().optional(),
  status: z.enum([Status.ACTIVE, Status.INACTIVE], { message: "Status must be ACTIVE or INACTIVE" }).optional(),
});

export type CreateMemberPlanInput = z.infer<typeof createMemberPlanSchema>;
export type UpdateMemberPlanInput = z.infer<typeof updateMemberPlanSchema>;
