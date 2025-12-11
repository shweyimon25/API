import { BankInformationResource } from "./bank-information.resource";

export class BankInformationCollection {
  static toCollection(bankInformations: any[]) {
    return bankInformations.map((bankInformation) =>
      BankInformationResource.toResource(bankInformation)
    );
  }

  static withPagination(bankInformations: { data: any[]; meta: any }) {
    return {
      data: this.toCollection(bankInformations.data),
      meta: bankInformations.meta,
    };
  }
}
