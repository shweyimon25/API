import z from "zod";
import { ProjectStage, ProjectStatus, Rag } from "@prisma/client";

const projectStatusEnum = z.enum(
  [
    ProjectStatus.OPEN,
    ProjectStatus.ON_TRACK,
    ProjectStatus.INDICATION_OF_DELAY,
    ProjectStatus.DELAYED,
    ProjectStatus.COMPLETED,
    ProjectStatus.CLOSE,
  ],
  { message: "Invalid project status" },
);

const projectStageEnum = z.enum(
  [
    ProjectStage.INITIATION,
    ProjectStage.PLANNING,
    ProjectStage.EXECUTION_AND_IMPLEMENTATION,
    ProjectStage.CLOSING_AND_DONE,
    ProjectStage.POST_IMPLEMENTATION,
  ],
  { message: "Invalid project stage" },
);

const ragEnum = z.enum([Rag.RED, Rag.AMBER, Rag.GREEN], {
  message: "Invalid rag value. Allowed: RED, AMBER, GREEN",
});

const ownerIdsSchema = z
  .array(z.coerce.number().min(1, { message: "Invalid owner id" }))
  .min(1, { message: "At least one project owner is required" });

export const createProjectSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  achievements: z.string().optional().nullable(),
  nextPlans: z.string().optional().nullable(),
  remark: z.string().optional().nullable(),
  department: z.string().optional().nullable(),
  keyProjects: z.string().optional().nullable(),
  projectPhase: z.string().optional().nullable(),
  objectives: z.string().optional().nullable(),
  keyResults: z.string().optional().nullable(),
  rag: ragEnum.optional().nullable(),
  risk: z.string().optional().nullable(),
  strategicAlignment: z.string().optional().nullable(),
  currentStatus: z.string().optional().nullable(),
  status: projectStatusEnum.optional(),
  stage: projectStageEnum.optional(),
  ownerIds: ownerIdsSchema,
});

export const updateProjectSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }).optional(),
  achievements: z.string().optional().nullable(),
  nextPlans: z.string().optional().nullable(),
  remark: z.string().optional().nullable(),
  department: z.string().optional().nullable(),
  keyProjects: z.string().optional().nullable(),
  projectPhase: z.string().optional().nullable(),
  objectives: z.string().optional().nullable(),
  keyResults: z.string().optional().nullable(),
  rag: ragEnum.optional().nullable(),
  risk: z.string().optional().nullable(),
  strategicAlignment: z.string().optional().nullable(),
  currentStatus: z.string().optional().nullable(),
  status: projectStatusEnum.optional(),
  stage: projectStageEnum.optional(),
  ownerIds: ownerIdsSchema.optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
