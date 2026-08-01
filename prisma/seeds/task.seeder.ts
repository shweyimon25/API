import { TaskStatus } from "@prisma/client";
import prisma from "../client";
import { formatProjectCode } from "../../app/helpers/project-code";
import TaskService from "../../app/services/admin/v1/task.service";

type SeedTask = {
  name: string;
  tac: Date;
  completedPercentage: number;
  status: TaskStatus;
};

const tasksByProjectCode: Record<string, SeedTask[]> = {
  [formatProjectCode(1)]: [
    {
      name: "Business requirements sign-off",
      tac: new Date(Date.UTC(2026, 7, 15)),
      completedPercentage: 100,
      status: TaskStatus.COMPLETED,
    },
    {
      name: "Vendor solution design",
      tac: new Date(Date.UTC(2026, 8, 30)),
      completedPercentage: 40,
      status: TaskStatus.ON_TRACK,
    },
    {
      name: "Infrastructure readiness",
      tac: new Date(Date.UTC(2026, 9, 20)),
      completedPercentage: 10,
      status: TaskStatus.OPEN,
    },
  ],
  [formatProjectCode(2)]: [
    {
      name: "UX redesign approval",
      tac: new Date(Date.UTC(2026, 6, 10)),
      completedPercentage: 100,
      status: TaskStatus.COMPLETED,
    },
    {
      name: "Performance optimization sprint",
      tac: new Date(Date.UTC(2026, 7, 25)),
      completedPercentage: 60,
      status: TaskStatus.ON_TRACK,
    },
    {
      name: "UAT with selected customers",
      tac: new Date(Date.UTC(2026, 8, 15)),
      completedPercentage: 20,
      status: TaskStatus.INDICATION_OF_DELAY,
    },
  ],
  [formatProjectCode(3)]: [
    {
      name: "Source system inventory",
      tac: new Date(Date.UTC(2026, 5, 30)),
      completedPercentage: 100,
      status: TaskStatus.COMPLETED,
    },
    {
      name: "ETL pipeline build",
      tac: new Date(Date.UTC(2026, 7, 1)),
      completedPercentage: 35,
      status: TaskStatus.DELAYED,
    },
    {
      name: "Report cut-over rehearsal",
      tac: new Date(Date.UTC(2026, 9, 10)),
      completedPercentage: 0,
      status: TaskStatus.OPEN,
    },
  ],
};

const taskSeeder = async () => {
  console.log("Tasks seeding ...");

  const taskService = new TaskService();
  const projectCodes = Object.keys(tasksByProjectCode);

  const projects = await prisma.project.findMany({
    where: { code: { in: projectCodes } },
    select: { id: true, code: true },
  });

  if (projects.length === 0) {
    throw new Error("Seed projects not found. Seed projects first.");
  }

  for (const project of projects) {
    const seedTasks = tasksByProjectCode[project.code] ?? [];

    await prisma.task.deleteMany({
      where: { projectId: project.id },
    });

    if (seedTasks.length === 0) {
      continue;
    }

    await prisma.task.createMany({
      data: seedTasks.map((task) => ({
        name: task.name,
        tac: task.tac,
        completedPercentage: task.completedPercentage,
        status: task.status,
        projectId: project.id,
      })),
    });

    await taskService.recalculateTotalPercentage(project.id);
    await taskService.syncProjectStatusFromTopTaskPercentage(project.id);
  }

  console.log("Tasks seeded successfully");
};

export default taskSeeder;
