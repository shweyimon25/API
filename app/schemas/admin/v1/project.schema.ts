import z from "zod";
import { ProjectStage, ProjectStatus } from "@prisma/client";

const projectStatusEnum = z.enum(
  [
    ProjectStatus.OPEN,
    ProjectStatus.ON_TRACK,
    ProjectStatus.INDICATION_OF_DELAY,
    ProjectStatus.DELAYED,
    ProjectStatus.COMPLETED,
    ProjectStatus.CLOSE
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
  rag: z.string().optional().nullable(),
  risk: z.string().optional().nullable(),
  strategicAlignment: z.string().optional().nullable(),
  currentStatus: z.string().optional().nullable(),
  status: projectStatusEnum.optional(),
  stage: projectStageEnum.optional(),
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
  rag: z.string().optional().nullable(),
  risk: z.string().optional().nullable(),
  strategicAlignment: z.string().optional().nullable(),
  currentStatus: z.string().optional().nullable(),
  status: projectStatusEnum.optional(),
  stage: projectStageEnum.optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
