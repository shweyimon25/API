import { Day, Gender, Prisma } from "@prisma/client";

type PlanDuration = { value: number; name: string };

type PersonalWorkoutRecord = {
  id: number;
  name: string;
  video: string;
  thumbnail: string | null;
  gender: Gender;
  workoutDay: Day | null;
  videoDuration: number;
  sets: number | null;
  reps: number | null;
  bodyGoal: { name: string };
  proficientLevel: { name: string };
  place: { name: string };
  memberPlan: {
    id: number;
    name: string;
    price: number;
    duration: number;
    memberType: { name: string };
  };
};

export function parseOdooFilter(
  filters: unknown,
  fieldName: string,
  operator = "="
) {
  const filtersStr =
    typeof filters === "string" ? filters : JSON.stringify(filters ?? "[]");
  const tupleRe =
    /\(\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*(?:'([^']*)'|([^)]+))\s*\)/g;

  let match: RegExpExecArray | null;
  while ((match = tupleRe.exec(filtersStr)) !== null) {
    const field = match[1];
    const op = match[2];
    const value = (match[3] ?? match[4] ?? "").trim().replace(/^'|'$/g, "");
    if (field === fieldName && op === operator) {
      return value;
    }
  }

  return null;
}

export function buildPersonalWorkoutWhere(
  filters: unknown
): Prisma.WorkoutWhereInput {
  const where: Prisma.WorkoutWhereInput = {
    status: "ACTIVE",
  };

  const freeVideo = parseOdooFilter(filters, "free_video");
  if (freeVideo === "true") {
    where.memberPlan = { price: 0 };
  } else if (freeVideo === "false") {
    where.memberPlan = { price: { gt: 0 } };
  }

  return where;
}

function planDataType(memberTypeName: string) {
  const name = memberTypeName.toLowerCase();
  if (name.includes("trainer")) return "trainer";
  if (name.includes("shop")) return "shop";
  return "member";
}

function durationLabel(
  duration: number,
  durationMap: Map<number, string>
) {
  return durationMap.get(duration) ?? `${duration} Month${duration === 1 ? "" : "s"}`;
}

function formatVideoDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

function formatGender(gender: Gender) {
  return gender.toLowerCase();
}

function formatDay(day: Day | null) {
  return day ? day.toLowerCase() : null;
}

function formatBodyGoalType(name: string | null | undefined) {
  if (!name) return null;
  const normalized = name.toLowerCase();
  if (normalized.includes("lose")) return "weight_loss";
  if (normalized.includes("gain")) return "weight_gain";
  return normalized.replace(/\s+/g, "_");
}

function formatSlug(value: string | null | undefined) {
  if (!value) return null;
  return value.toLowerCase().replace(/\s+/g, "_");
}

export function formatPersonalWorkout(
  workout: PersonalWorkoutRecord,
  durationMap: Map<number, string>
) {
  return {
    id: workout.id,
    name: workout.name,
    video: workout.video,
    member_type_id: {
      data_type: planDataType(workout.memberPlan.memberType.name),
      price: Number(workout.memberPlan.price),
      duration: durationLabel(workout.memberPlan.duration, durationMap),
      id: workout.memberPlan.id,
      member_type: workout.memberPlan.name,
    },
    gender: formatGender(workout.gender),
    day: formatDay(workout.workoutDay),
    main_goal_body_type: formatBodyGoalType(workout.bodyGoal.name),
    proficient_level: formatSlug(workout.proficientLevel.name),
    place: formatSlug(workout.place.name),
    sets_count: workout.sets ?? 0,
    reps_count: workout.reps ?? 0,
    calory: 0.0,
    category_id: {
      name: null,
      id: null,
    },
    thumbnail_url: workout.thumbnail ?? "",
    video_duration: formatVideoDuration(workout.videoDuration),
  };
}

export const personalWorkoutInclude = {
  bodyGoal: { select: { name: true } },
  proficientLevel: { select: { name: true } },
  place: { select: { name: true } },
  memberPlan: {
    select: {
      id: true,
      name: true,
      price: true,
      duration: true,
      memberType: { select: { name: true } },
    },
  },
} as const;

export function buildDurationMap(durations: PlanDuration[]) {
  return new Map(durations.map((duration) => [duration.value, duration.name]));
}