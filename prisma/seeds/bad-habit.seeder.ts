import prisma from "../client";

const BadHabitSeeder = async () => {
    console.log("Bad habit seeding ...");

    const badHabits = [
        "I don’t rest enough",
        "I have a sweet tooth",
        "I consume too much soda",
        "I consume a lot of salty food",
        "late night snacks"
    ];

    for (const badHabit of badHabits) {
        await prisma.badHabit.upsert({
            where: { name: badHabit },
            update: {
                name: badHabit,
            },
            create: {
                name: badHabit
            },
        });
    }

    console.log("Bad habit seeded successfully");
};

export default BadHabitSeeder;
