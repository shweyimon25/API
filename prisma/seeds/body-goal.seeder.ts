import prisma from "../client";

const BodyGoalSeeder = async () => {
    console.log("Body goal seeding ...");

    const bodyGoals = [
        "Lose weight",
        "Gain weight",
        "Gain muscle",
        "Improve health",
        "Improve sleep",
        "Improve mood",
        "Improve energy",
        "Improve focus",
        "Improve memory",
        "Improve concentration",
    ];

    for (const bodyGoal of bodyGoals) {
        await prisma.bodyGoal.create({
            data: {
                name: bodyGoal,
                createdById: 1,
            },
        });
    }

    console.log("Body goal seeded successfully");
};

export default BodyGoalSeeder;
