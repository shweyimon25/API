import { DeliverableStatus, Prisma } from "@prisma/client";
import { parseDateDMY } from "../../../helpers/helper";

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
    const date = parseDateDMY(tac);

    if (date) {
      const start = new Date(date);
      start.setUTCHours(0, 0, 0, 0);

      const end = new Date(date);
      end.setUTCHours(23, 59, 59, 999);

      where.tac = {
        gte: start,
        lte: end,
      };
    }
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
