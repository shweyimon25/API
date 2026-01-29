import {
    NotFoundException,
    ValidationException,
} from "../../../helpers/exceptions";
import { CreateWorkoutInput, UpdateWorkoutInput } from "../../../schemas/admin/v1/workout.schema";
import prisma from "../../../../prisma/client";
import { Prisma, Status } from "@prisma/client";
import { upload } from "../../../helpers/media-upload";

class WorkoutService {
    async findAll(where: Prisma.WorkoutWhereInput) {
        const workouts = await prisma.workout.findMany({
            where,
            orderBy: {
                id: "desc",
            },
            include: {
                category: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                bodyGoal: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                proficientLevel: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                place: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                memberPlan: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                createdBy: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                updatedBy: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            }
        });

        return workouts;
    }

    async findByPaginate(page: number, perPage: number, where: Prisma.WorkoutWhereInput) {
        const workouts = await prisma.workout.findMany({
            where,
            orderBy: {
                id: "desc",
            },
            skip: (page - 1) * perPage,
            take: perPage,
            include: {
                category: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                bodyGoal: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                proficientLevel: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                place: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                memberPlan: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                createdBy: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                updatedBy: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            }
        });

        const totalWorkouts = await prisma.workout.count({
            where,
        });

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
        const workout = await prisma.workout.findFirst({
            where: {
                id,
            },
            include: {
                category: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                bodyGoal: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                proficientLevel: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                place: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                memberPlan: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                createdBy: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                updatedBy: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            }
        });

        if (!workout) {
            throw new NotFoundException("Workout not found");
        }

        return workout;
    }

    async findCommonAll(where: Prisma.WorkoutWhereInput) {
        const workouts = await prisma.workout.findMany({
            orderBy: {
                id: "desc",
            },
            where: {
                ...where,
                status: Status.ACTIVE,
            },
            select: {
                id: true,
                name: true,
            },
        });

        return workouts;
    }

    async create(createWorkoutInput: CreateWorkoutInput, files: Express.Multer.File[], userId: number) {
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

        const category = await prisma.category.findFirst({
            where: {
                id: +categoryId,
                status: Status.ACTIVE,
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

        const bodyGoal = await prisma.bodyGoal.findFirst({
            where: {
                id: +bodyGoalId,
                status: Status.ACTIVE,
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

        const proficientLevel = await prisma.proficientLevel.findFirst({
            where: {
                id: +proficientLevelId,
                status: Status.ACTIVE,
            },
        });

        if (!proficientLevel) {
            throw new ValidationException("Failed to create workout", [
                {
                    field: "proficientLevelId",
                    issue: "Proficient level is not existed",
                },
            ]);
        }

        const place = await prisma.place.findFirst({
            where: {
                id: +placeId,
                status: Status.ACTIVE,
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

        const memberPlan = await prisma.memberPlan.findFirst({
            where: {
                id: +memberPlanId,
                status: Status.ACTIVE,
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

        const videoFile = files.find((file: Express.Multer.File) => file.fieldname === "video");
        const thumbnailFile = files.find((file: Express.Multer.File) => file.fieldname === "thumbnail");

        if (!videoFile) {
            throw new ValidationException("Failed to create workout", [
                {
                    field: "video",
                    issue: "Video file is required",
                },
            ]);
        }

        const { fileUrl: videoUrl } = await upload(videoFile, "workout-videos");
        const { fileUrl: thumbnailUrl } = await upload(thumbnailFile, "workout-thumbnails");

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
                video: videoUrl,
                thumbnail: thumbnailUrl,
                workoutDay,
                videoDuration: 12121,
                sets,
                reps,
                status: status ?? Status.ACTIVE,
                createdBy: {
                    connect: {
                        id: userId
                    }
                },
            },
        });

        return this.findOne(workout.id);
    }

    async update(id: number, updateWorkoutInput: UpdateWorkoutInput, files: Express.Multer.File[], userId: number) {
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
        } = updateWorkoutInput;

        const existingWorkout = await prisma.workout.findFirst({
            where: {
                id,
            },
        });

        if (!existingWorkout) {
            throw new NotFoundException("Workout not found");
        }

        if (categoryId && categoryId !== existingWorkout.categoryId) {
            const category = await prisma.category.findFirst({
                where: { id: +categoryId, status: Status.ACTIVE },
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
            const bodyGoal = await prisma.bodyGoal.findFirst({
                where: { id: +bodyGoalId, status: Status.ACTIVE },
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
            const proficientLevel = await prisma.proficientLevel.findFirst({
                where: { id: +proficientLevelId, status: Status.ACTIVE },
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
            const place = await prisma.place.findFirst({
                where: { id: +placeId, status: Status.ACTIVE },
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
            const memberPlan = await prisma.memberPlan.findFirst({
                where: { id: +memberPlanId, status: Status.ACTIVE },
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

        const videoFile = files.find((file: Express.Multer.File) => file.fieldname === "video");
        const thumbnailFile = files.find((file: Express.Multer.File) => file.fieldname === "thumbnail");

        if (videoFile) {
            const { fileUrl: videoUrl } = await upload(videoFile, "workout-videos");
            existingWorkout.video = videoUrl;
        }

        if (thumbnailFile) {
            const { fileUrl: thumbnailUrl } = await upload(thumbnailFile, "workout-thumbnails");
            existingWorkout.thumbnail = thumbnailUrl;
        }

        await prisma.workout.update({
            where: {
                id,
            },
            data: {
                name: name ?? existingWorkout.name,
                gender: gender ?? existingWorkout.gender,
                category: {
                    connect: {
                        id: categoryId ?? existingWorkout.categoryId
                    }
                },
                bodyGoal: {
                    connect: {
                        id: bodyGoalId ?? existingWorkout.bodyGoalId
                    }
                },
                proficientLevel: {
                    connect: {
                        id: proficientLevelId ?? existingWorkout.proficientLevelId
                    }
                },
                place: {
                    connect: {
                        id: placeId ?? existingWorkout.placeId
                    }
                },
                memberPlan: {
                    connect: {
                        id: memberPlanId ?? existingWorkout.memberPlanId
                    }
                },
                workoutDay: workoutDay ?? existingWorkout.workoutDay,
                sets: sets ?? existingWorkout.sets,
                reps: reps ?? existingWorkout.reps,
                video: existingWorkout.video,
                thumbnail: existingWorkout.thumbnail,
                videoDuration: 12121,
                status: status ?? existingWorkout.status,
                updatedBy: {
                    connect: {
                        id: userId
                    }
                },
            },
        });

        return this.findOne(id);
    }

    async destroy(id: number) {
        const workout = await this.findOne(id);
        await prisma.workout.delete({
            where: { id },
        });

        return workout;
    }
}

export default WorkoutService;

