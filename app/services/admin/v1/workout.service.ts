import {
    BadRequestException,
    NotFoundException,
    ValidationException,
} from "../../../helpers/exceptions";
import { CreateWorkoutInput, UpdateWorkoutInput } from "../../../schemas/admin/v1/workout.schema";
import prisma from "../../../../prisma/client";
import { Status } from "@prisma/client";

class WorkoutService {
    async findAll() {
        const workouts = await prisma.workout.findMany({
            orderBy: {
                id: "desc",
            },
        });

        return workouts;
    }

    async findByPaginate(page: number, perPage: number) {
        const workouts = await prisma.workout.findMany({
            orderBy: {
                id: "desc",
            },
            skip: (page - 1) * perPage,
            take: perPage,
        });

        const totalWorkouts = await prisma.workout.count();

        return {
            data: workouts,
            meta: {
                totalCount: totalWorkouts,
                totalPages: Math.ceil(totalWorkouts / perPage),
                currentPage: page,
                perPage,
                prevPage: page > 1 ? page - 1 : null,
                nextPage: page < Math.ceil(totalWorkouts / perPage) ? page + 1 : null,
                hasPrevPage: page > 1,
                hasNextPage: page < Math.ceil(totalWorkouts / perPage),
            },
        };
    }

    async findOne(id: number) {
        const workout = await prisma.workout.findUnique({
            where: {
                id,
            },
        });

        if (!workout) {
            throw new NotFoundException("Workout not found");
        }

        return workout;
    }

    async create(createWorkoutInput: CreateWorkoutInput, userId: number) {
        const {
            name,
            gender,
            categoryId,
            bodyGoalId,
            proficientLevelId,
            placeId,
            memberPlanId,
            workoutDay,
            sets,
            reps,
            status
        } = createWorkoutInput;

        const category = await prisma.category.findUnique({
            where: {
                id: +categoryId
            },
        });

        if (!category) {
            throw new ValidationException("Failed to create workout", [
                {
                    field: "categoryId",
                    issue: "Category is not existed",
                },
            ]);
        }

        const bodyGoal = await prisma.bodyGoal.findUnique({
            where: {
                id: +bodyGoalId,
            },
        });

        if (!bodyGoal) {
            throw new ValidationException("Failed to create workout", [
                {
                    field: "bodyGoalId",
                    issue: "Body goal is not existed",
                },
            ]);
        }

        const proficientLevel = await prisma.proficientLevel.findUnique({
            where: {
                id: +proficientLevelId
            }
        });

        if (!proficientLevel) {
            throw new ValidationException("Failed to create workout", [
                {
                    field: "proficientLevelId",
                    issue: "Proficient level is not existed",
                },
            ]);
        }

        const place = await prisma.place.findUnique({
            where: {
                id: +placeId,
            },
        });

        if (!place) {
            throw new ValidationException("Failed to create workout", [
                {
                    field: "placeId",
                    issue: "Place is not existed",
                },
            ]);
        }

        const memberPlan = await prisma.memberPlan.findUnique({
            where: {
                id: +memberPlanId,
            },
        });

        if (!memberPlan) {
            throw new ValidationException("Failed to create workout", [
                {
                    field: "memberPlanId",
                    issue: "Member plan is not existed",
                },
            ]);
        }

        const workout = await prisma.workout.create({
            data: {
                name,
                gender,
                category: {
                    connect: {
                        id: categoryId
                    }
                },
                bodyGoal: {
                    connect: {
                        id: bodyGoalId
                    }
                },
                proficientLevel: {
                    connect: {
                        id: proficientLevelId
                    }
                },
                place: {
                    connect: {
                        id: placeId
                    }
                },
                memberPlan: {
                    connect: {
                        id: memberPlanId
                    }
                },
                video: "https://",
                workoutDay,
                videoDuration: 12121,
                sets,
                reps,
                status: createWorkoutInput.status ?? Status.ACTIVE,
            },
        });

        return this.findOne(workout.id);
    }

    async update(id: number, updateWorkoutInput: UpdateWorkoutInput, userId: number) {
        // Check workout exists
        const existingWorkout = await prisma.workout.findUnique({
            where: {
                id,
            },
        });

        if (!existingWorkout) {
            throw new BadRequestException("Workout not found");
        }

        // Validate referenced entities only when ids are provided
        const { categoryId, bodyGoalId, proficientLevelId, placeId, memberPlanId } = updateWorkoutInput;

        if (categoryId && categoryId !== existingWorkout.categoryId) {
            const category = await prisma.category.findUnique({
                where: { id: categoryId },
            });
            if (!category) {
                throw new ValidationException("Failed to update workout", [
                    {
                        field: "categoryId",
                        issue: "Category is not existed",
                    },
                ]);
            }
        }

        if (bodyGoalId && bodyGoalId !== existingWorkout.bodyGoalId) {
            const bodyGoal = await prisma.bodyGoal.findUnique({
                where: { id: bodyGoalId },
            });
            if (!bodyGoal) {
                throw new ValidationException("Failed to update workout", [
                    {
                        field: "bodyGoalId",
                        issue: "Body goal is not existed",
                    },
                ]);
            }
        }

        if (proficientLevelId && proficientLevelId !== existingWorkout.proficientLevelId) {
            const proficientLevel = await prisma.proficientLevel.findUnique({
                where: { id: proficientLevelId },
            });
            if (!proficientLevel) {
                throw new ValidationException("Failed to update workout", [
                    {
                        field: "proficientLevelId",
                        issue: "Proficient level is not existed",
                    },
                ]);
            }
        }

        if (placeId && placeId !== existingWorkout.placeId) {
            const place = await prisma.place.findUnique({
                where: { id: placeId },
            });
            if (!place) {
                throw new ValidationException("Failed to update workout", [
                    {
                        field: "placeId",
                        issue: "Place is not existed",
                    },
                ]);
            }
        }

        if (memberPlanId && memberPlanId !== existingWorkout.memberPlanId) {
            const memberPlan = await prisma.memberPlan.findUnique({
                where: { id: memberPlanId },
            });
            if (!memberPlan) {
                throw new ValidationException("Failed to update workout", [
                    {
                        field: "memberPlanId",
                        issue: "Member plan is not existed",
                    },
                ]);
            }
        }

        // Build partial update payload to avoid overwriting with undefined
        const data: Record<string, unknown> = {};
        if (updateWorkoutInput.name !== undefined) data.name = updateWorkoutInput.name;
        if (updateWorkoutInput.gender !== undefined) data.gender = updateWorkoutInput.gender;
        if (updateWorkoutInput.categoryId !== undefined) data.categoryId = updateWorkoutInput.categoryId;
        if (updateWorkoutInput.bodyGoalId !== undefined) data.bodyGoalId = updateWorkoutInput.bodyGoalId;
        if (updateWorkoutInput.proficientLevelId !== undefined) data.proficientLevelId = updateWorkoutInput.proficientLevelId;
        if (updateWorkoutInput.placeId !== undefined) data.placeId = updateWorkoutInput.placeId;
        if (updateWorkoutInput.memberPlanId !== undefined) data.memberPlanId = updateWorkoutInput.memberPlanId;
        if (updateWorkoutInput.workoutDay !== undefined) data.workoutDay = updateWorkoutInput.workoutDay;
        if (updateWorkoutInput.sets !== undefined) data.sets = updateWorkoutInput.sets;
        if (updateWorkoutInput.reps !== undefined) data.reps = updateWorkoutInput.reps;
        if (updateWorkoutInput.status !== undefined) data.status = updateWorkoutInput.status;

        await prisma.workout.update({
            where: {
                id,
            },
            data,
        });

        return this.findOne(id);
    }

    async destroy(id: number) {
        // Find workout
        const workout = await this.findOne(id);

        // Delete workout
        await prisma.workout.delete({
            where: {
                id,
            },
        });

        return workout;
    }
}

export default WorkoutService;

