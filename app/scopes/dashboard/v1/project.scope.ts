import { Prisma, ProjectStage, ProjectStatus } from "@prisma/client";

interface ProjectScopeQuery {
  code?: string;
  name?: string;
  department?: string;
  projectPhase?: string;
  rag?: string;
  risk?: string;
  strategicAlignment?: string;
  currentStatus?: string;
  status?: string;
  stage?: string;
  ownerId?: string;
}

export const projectScope = (
  query: ProjectScopeQuery,
): Prisma.ProjectWhereInput => {
  const {
    code,
    name,
    department,
    projectPhase,
    rag,
    risk,
    strategicAlignment,
    currentStatus,
    status,
    stage,
    ownerId,
  } = query;
  const where: Prisma.ProjectWhereInput = {};

  if (code) {
    where.code = { contains: code };
  }

  if (name) {
    where.name = { contains: name };
  }

  if (department) {
    where.department = { contains: department };
  }

  if (projectPhase) {
    where.projectPhase = { contains: projectPhase };
  }

  if (rag) {
    where.rag = { contains: rag };
  }

  if (risk) {
    where.risk = { contains: risk };
  }

  if (strategicAlignment) {
    where.strategicAlignment = { contains: strategicAlignment };
  }

  if (currentStatus) {
    where.currentStatus = { contains: currentStatus };
  }

  if (status && status !== ProjectStatus.CLOSE) {
    where.status = status as ProjectStatus;
  } else {
    where.status = { not: ProjectStatus.CLOSE };
  }

  if (stage) {
    where.stage = stage as ProjectStage;
  }

  if (ownerId) {
    where.projectOwners = {
      some: {
        userId: +ownerId,
      },
    };
  }

  return where;
};
