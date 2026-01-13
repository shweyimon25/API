import prisma from "../client";

const PhysicalLimitaionSeeder = async () => {
    console.log("Physical limitaion seeding ...");

    const physicalLimitations = ["none", "back pain", "knee pain", "limited mobility", "other"];

    for (const physicalLimitation of physicalLimitations) {
        await prisma.physicalLimitation.create({
            data: {
                name: physicalLimitation,
                createdById: 1,
            },
        });
    }

    console.log("Physical limitation seeded successfully");
};

export default PhysicalLimitaionSeeder;
