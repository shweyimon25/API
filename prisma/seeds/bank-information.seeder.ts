import { PaymentTypes, Status } from "@prisma/client";
import prisma from "../client";

const BankInformationSeeder = async () => {
    console.log("Bank information seeding ...");

    const bankInformations = [
        {
            bankAccountHolder: "John Doe",
            bankAccountNumber: "1234567890",
            phone: "1234567890",
            paymentTypes: PaymentTypes.BANK_ACCOUNT,
            status: Status.ACTIVE,
        },
    ];

    for (const bankInformation of bankInformations) {
        await prisma.bankInformation.create({
            data: {
                ...bankInformation,
                createdById: 1,
            },
        });
    }

    console.log("Bank information seeded successfully");
};

export default BankInformationSeeder;
