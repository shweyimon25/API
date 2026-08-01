import prisma from "../../../../prisma/client";
import {
  ProjectStage,
  ProjectStatus,
  Status,
  TaskStatus,
} from "@prisma/client";

const emptyStatusCounts = () =>
  Object.values(ProjectStatus).reduce(
    (acc, status) => {
      acc[status] = 0;
      return acc;
    },
    {} as Record<ProjectStatus, number>,
  );

const emptyStageCounts = () =>
  Object.values(ProjectStage).reduce(
    (acc, stage) => {
      acc[stage] = 0;
      return acc;
    },
    {} as Record<ProjectStage, number>,
  );

const emptyTaskStatusCounts = () =>
  Object.values(TaskStatus).reduce(
    (acc, status) => {
      acc[status] = 0;
      return acc;
    },
    {} as Record<TaskStatus, number>,
  );

class OverviewService {
  async getStats() {
    const [
      totalUsers,
      activeUsers,
      inactiveUsers,
      totalRoles,
      totalProjects,
      projectsByStatus,
      projectsByStage,
      projectPercentage,
      totalTasks,
      tasksByStatus,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { status: Status.ACTIVE } }),
      prisma.user.count({ where: { status: Status.INACTIVE } }),
      prisma.role.count({
        where: {
          NOT: { name: "Developer" },
        },
      }),
      prisma.project.count(),
      prisma.project.groupBy({
        by: ["status"],
        _count: { _all: true },
      }),
      prisma.project.groupBy({
        by: ["stage"],
        _count: { _all: true },
      }),
      prisma.project.aggregate({
        _avg: { totalPercentage: true },
      }),
      prisma.task.count(),
      prisma.task.groupBy({
        by: ["status"],
        _count: { _all: true },
      }),
    ]);

    const byStatus = emptyStatusCounts();
    for (const row of projectsByStatus) {
      byStatus[row.status] = row._count._all;
    }

    const byStage = emptyStageCounts();
    for (const row of projectsByStage) {
      byStage[row.stage] = row._count._all;
    }

    const taskByStatus = emptyTaskStatusCounts();
    for (const row of tasksByStatus) {
      taskByStatus[row.status] = row._count._all;
    }

    return {
      users: {
        total: totalUsers,
        active: activeUsers,
        inactive: inactiveUsers,
      },
      roles: {
        total: totalRoles,
      },
      projects: {
        total: totalProjects,
        averagePercentage:
          Math.round((projectPercentage._avg.totalPercentage ?? 0) * 100) /
          100,
        byStatus,
        byStage,
      },
      tasks: {
        total: totalTasks,
        byStatus: taskByStatus,
      },
    };
  }
}

export default OverviewService;
