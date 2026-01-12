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
        await prisma.bodyGoal.upsert({
            where: { name: bodyGoal },
            update: {
                name: bodyGoal,
            },
            create: {
                name: bodyGoal,
            },
        });
    }

    console.log("Body goal seeded successfully");
};

export default BodyGoalSeeder;
