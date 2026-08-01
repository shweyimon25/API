import { Prisma, TaskStatus } from "@prisma/client";
import { parseDateDMY } from "../../../helpers/helper";

interface TaskScopeQuery {
  name?: string;
  tac?: string;
  projectId?: string;
  projectCode?: string;
  status?: string;
}

export const taskScope = (query: TaskScopeQuery): Prisma.TaskWhereInput => {
  const { name, tac, projectCode, projectId, status } = query;
  const where: Prisma.TaskWhereInput = {};

  if (name) {
    where.name = { contains: name };
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
    where.status = status as TaskStatus;
  }

  return where;
};
