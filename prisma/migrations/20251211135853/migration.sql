-- CreateTable
CREATE TABLE `BankInformation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `coverPhoto` VARCHAR(191) NULL,
    `bankAccountHolder` VARCHAR(191) NOT NULL,
    `bankAccountNumber` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `paymentTypes` ENUM('BANK_ACCOUNT', 'E_WALLET') NOT NULL DEFAULT 'BANK_ACCOUNT',
    `createdById` INTEGER NULL,
    `updatedById` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `BankInformation_bankAccountNumber_key`(`bankAccountNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `BankInformation` ADD CONSTRAINT `BankInformation_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BankInformation` ADD CONSTRAINT `BankInformation_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
