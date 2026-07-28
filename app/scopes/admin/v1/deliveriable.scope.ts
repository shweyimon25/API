import { DeliverableStatus, Prisma } from "@prisma/client";

interface DeliveriableScopeQuery {
  deliverable?: string;
  tac?: string;
  projectId?: string;
  status?: string;
}

export const deliveriableScope = (
  query: DeliveriableScopeQuery,
): Prisma.deliveriableWhereInput => {
  const { deliverable, tac, projectId, status } = query;
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

  if (status) {
    where.status = status as DeliverableStatus;
  }

  return where;
};
