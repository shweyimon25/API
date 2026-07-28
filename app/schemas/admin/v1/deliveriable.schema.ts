import z from "zod";
import { DeliverableStatus } from "@prisma/client";

export const createDeliveriableSchema = z.object({
  deliverable: z.string().min(1, { message: "Deliverable is required" }),
  tac: z.string().min(1, { message: "TAC is required" }),
  completedPercentage: z.coerce.number().min(0).max(100).optional(),
  projectId: z.coerce.number().min(1, { message: "Project is required" }),
  status: z
    .enum(
      [
        DeliverableStatus.OPEN,
        DeliverableStatus.ON_TRACK,
        DeliverableStatus.INDICATION_OF_DELAY,
        DeliverableStatus.DELAYED,
        DeliverableStatus.COMPLETED,
      ],
      { message: "Invalid deliverable status" },
    )
    .optional(),
});

export const updateDeliveriableSchema = z.object({
  deliverable: z
    .string()
    .min(1, { message: "Deliverable is required" })
    .optional(),
  tac: z.string().min(1, { message: "TAC is required" }).optional(),
  completedPercentage: z.coerce.number().min(0).max(100).optional(),
  projectId: z.coerce.number().min(1).optional(),
  status: z
    .enum(
      [
        DeliverableStatus.OPEN,
        DeliverableStatus.ON_TRACK,
        DeliverableStatus.INDICATION_OF_DELAY,
        DeliverableStatus.DELAYED,
        DeliverableStatus.COMPLETED,
      ],
      { message: "Invalid deliverable status" },
    )
    .optional(),
});

export type CreateDeliveriableInput = z.infer<typeof createDeliveriableSchema>;
export type UpdateDeliveriableInput = z.infer<typeof updateDeliveriableSchema>;
