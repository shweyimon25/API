export class BankInformationResource {
  static toResource(bankInformation: any) {
    return {
      id: bankInformation.id,
      coverPhoto: bankInformation.coverPhoto,
      bankAccountHolder: bankInformation.bankAccountHolder,
      bankAccountNumber: bankInformation.bankAccountNumber,
      phone: bankInformation.phone,
      paymentTypes: bankInformation.paymentTypes,
      status: bankInformation.status,
      createdBy: bankInformation.createdBy,
      updatedBy: bankInformation.updatedBy,
      createdAt: bankInformation.createdAt,
      updatedAt: bankInformation.updatedAt,
    };
  }
}
