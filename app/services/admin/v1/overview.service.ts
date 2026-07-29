import prisma from "../../../../prisma/client";
import {
  DeliverableStatus,
  ProjectStage,
  ProjectStatus,
  Status,
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

const emptyDeliverableStatusCounts = () =>
  Object.values(DeliverableStatus).reduce(
    (acc, status) => {
      acc[status] = 0;
      return acc;
    },
    {} as Record<DeliverableStatus, number>,
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
      totalDeliveriables,
      deliveriablesByStatus,
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
      prisma.deliveriable.count(),
      prisma.deliveriable.groupBy({
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

    const deliveriableByStatus = emptyDeliverableStatusCounts();
    for (const row of deliveriablesByStatus) {
      deliveriableByStatus[row.status] = row._count._all;
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
      deliveriables: {
        total: totalDeliveriables,
        byStatus: deliveriableByStatus,
      },
    };
  }
}

export default OverviewService;
