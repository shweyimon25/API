import { Gender, Status } from "@prisma/client";
import prisma from "../client";

const CDN_BASE =
  "https://yc-fitness.sgp1.cdn.digitaloceanspaces.com/Workout";

async function requireByName<T extends { id: number }>(
  label: string,
  finder: () => Promise<T | null>
) {
  const record = await finder();
  if (!record) {
    throw new Error(`Workout seeder requires ${label}. Run prerequisite seeders first.`);
  }
  return record;
}

async function upsertMemberPlan(input: {
  name: string;
  price: number;
  duration: number;
  memberTypeId: number;
  isVideoGroup?: boolean;
}) {
  const existing = await prisma.memberPlan.findFirst({
    where: {
      name: input.name,
      memberTypeId: input.memberTypeId,
    },
  });

  if (existing) {
    return prisma.memberPlan.update({
      where: { id: existing.id },
      data: {
        price: input.price,
        duration: input.duration,
        isVideoGroup: input.isVideoGroup ?? false,
        status: Status.ACTIVE,
      },
    });
  }

  return prisma.memberPlan.create({
    data: {
      name: input.name,
      price: input.price,
      duration: input.duration,
      memberTypeId: input.memberTypeId,
      isVideoGroup: input.isVideoGroup ?? false,
      status: Status.ACTIVE,
      createdById: 1,
    },
  });
}

const WorkoutSeeder = async () => {
  console.log("Workout seeding ...");

  const [category, bodyGoal, proficientLevel, place, memberType] =
    await Promise.all([
      requireByName("category", () =>
        prisma.category.findFirst({ where: { status: Status.ACTIVE } })
      ),
      requireByName("body goal", () =>
        prisma.bodyGoal.findFirst({ where: { status: Status.ACTIVE } })
      ),
      requireByName("proficient level", () =>
        prisma.proficientLevel.findFirst({ where: { status: Status.ACTIVE } })
      ),
      requireByName("place", () =>
        prisma.place.findFirst({ where: { name: "Home" } })
      ),
      requireByName("member type", () =>
        prisma.memberType.findFirst({ where: { name: "Gym Member" } })
      ),
    ]);

  const [freePlan, platinumPlan] = await Promise.all([
    upsertMemberPlan({
      name: "Free",
      price: 0,
      duration: 1,
      memberTypeId: memberType.id,
      isVideoGroup: true,
    }),
    upsertMemberPlan({
      name: "Platinum",
      price: 12000,
      duration: 3,
      memberTypeId: memberType.id,
      isVideoGroup: true,
    }),
  ]);

  const workouts = [
    {
      name: "Day(30) challenge Day5 workout",
      video: `${CDN_BASE}/2026319-26574-workout.mp4`,
      thumbnail: `${CDN_BASE}/2026319-26575-workout.png`,
      gender: Gender.BOTH,
      memberPlanId: platinumPlan.id,
      videoDuration: 13,
    },
    {
      name: "Day(30) challenge Day5 workout",
      video: `${CDN_BASE}/2026319-26572-workout.mp4`,
      thumbnail: `${CDN_BASE}/2026319-26573-workout.png`,
      gender: Gender.BOTH,
      memberPlanId: platinumPlan.id,
      videoDuration: 9,
    },
    {
      name: "Free morning stretch",
      video: `${CDN_BASE}/free-morning-stretch.mp4`,
      thumbnail: `${CDN_BASE}/free-morning-stretch.png`,
      gender: Gender.BOTH,
      memberPlanId: freePlan.id,
      videoDuration: 8,
    },
    {
      name: "Free core basics",
      video: `${CDN_BASE}/free-core-basics.mp4`,
      thumbnail: `${CDN_BASE}/free-core-basics.png`,
      gender: Gender.FEMALE,
      memberPlanId: freePlan.id,
      videoDuration: 12,
    },
    {
      name: "Free upper body intro",
      video: `${CDN_BASE}/free-upper-body-intro.mp4`,
      thumbnail: `${CDN_BASE}/free-upper-body-intro.png`,
      gender: Gender.MALE,
      memberPlanId: freePlan.id,
      videoDuration: 10,
    },
    {
      name: "Free cardio starter",
      video: `${CDN_BASE}/free-cardio-starter.mp4`,
      thumbnail: `${CDN_BASE}/free-cardio-starter.png`,
      gender: Gender.BOTH,
      memberPlanId: freePlan.id,
      videoDuration: 15,
    },
    {
      name: "Free leg workout",
      video: `${CDN_BASE}/free-leg-workout.mp4`,
      thumbnail: `${CDN_BASE}/free-leg-workout.png`,
      gender: Gender.BOTH,
      memberPlanId: freePlan.id,
      videoDuration: 11,
    },
    {
      name: "Free yoga flow",
      video: `${CDN_BASE}/free-yoga-flow.mp4`,
      thumbnail: `${CDN_BASE}/free-yoga-flow.png`,
      gender: Gender.BOTH,
      memberPlanId: freePlan.id,
      videoDuration: 14,
    },
    {
      name: "Free abs burner",
      video: `${CDN_BASE}/free-abs-burner.mp4`,
      thumbnail: `${CDN_BASE}/free-abs-burner.png`,
      gender: Gender.BOTH,
      memberPlanId: freePlan.id,
      videoDuration: 7,
    },
  ];

  for (const workout of workouts) {
    const existing = await prisma.workout.findFirst({
      where: {
        name: workout.name,
        video: workout.video,
      },
    });

    const data = {
      name: workout.name,
      video: workout.video,
      thumbnail: workout.thumbnail,
      gender: workout.gender,
      categoryId: category.id,
      bodyGoalId: bodyGoal.id,
      proficientLevelId: proficientLevel.id,
      placeId: place.id,
      memberPlanId: workout.memberPlanId,
      workoutDay: null,
      videoDuration: workout.videoDuration,
      sets: 0,
      reps: 0,
      status: Status.ACTIVE,
      createdById: 1,
    };

    if (existing) {
      await prisma.workout.update({
        where: { id: existing.id },
        data,
      });
      continue;
    }

    await prisma.workout.create({ data });
  }

  console.log("Workout seeded successfully");
};

export default WorkoutSeeder;
