import prisma from "../client";

const PhysicalLimitaionSeeder = async () => {
    console.log("Physical limitaion seeding ...");

    const physicalLimitations = ["none", "back pain", "knee pain", "limited mobility", "other"];

    for (const physicalLimitation of physicalLimitations) {
        await prisma.physicalLimitation.upsert({
            where: { name: physicalLimitation },
            update: {
                name: physicalLimitation,
            },
            create: {
                name: physicalLimitation,
            },
        });
    }

    console.log("Physical limitation seeded successfully");
};

export default PhysicalLimitaionSeeder;
