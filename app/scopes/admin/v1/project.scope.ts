import { Prisma, ProjectStatus } from "@prisma/client";

interface ProjectScopeQuery {
  name?: string;
  department?: string;
  projectPhase?: string;
  rag?: string;
  status?: string;
}

export const projectScope = (
  query: ProjectScopeQuery,
): Prisma.ProjectWhereInput => {
  const { name, department, projectPhase, rag, status } = query;
  const where: Prisma.ProjectWhereInput = {};

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

  if (status) {
    where.status = status as ProjectStatus;
  }

  return where;
};
