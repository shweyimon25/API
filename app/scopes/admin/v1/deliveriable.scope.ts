import { DeliverableStatus, Prisma } from "@prisma/client";

interface DeliveriableScopeQuery {
  deliverable?: string;
  tac?: string;
  projectId?: string;
  projectCode?: string;
  status?: string;
}

export const deliveriableScope = (
  query: DeliveriableScopeQuery,
): Prisma.deliveriableWhereInput => {
  const { deliverable, tac, projectCode, projectId, status } = query;
  const where: Prisma.deliveriableWhereInput = {};

  if (deliverable) {
    where.deliverable = { contains: deliverable };
  }

  if (tac) {
    where.tac = { contains: tac };
  }

  if (projectId) {
    where.projectId = +projectId;
  }

  if (projectCode) {
    where.project = {
      code: { contains: projectCode },
    };
  }

  if (status) {
    where.status = status as DeliverableStatus;
  }

  return where;
};
