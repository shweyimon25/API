import { BankInformationResource } from "./bank-information.resource";

export class BankInformationCollection {
  static toCollection(bankInformations: any[]) {
    return bankInformations.map((bankInformation) =>
      BankInformationResource.toResource(bankInformation)
    );
  }
}
