import { BankInformation, PaymentTypes } from "@prisma/client";

const ODOO_IMAGE_BASE =
  process.env.ODOO_IMAGE_BASE_URL ?? "http://localhost:8069";
const ODOO_PUBLIC_BASE =
  process.env.ODOO_PUBLIC_BASE_URL ?? "https://odoo.yc.fitness";

function paymentType(value: PaymentTypes) {
  return value === PaymentTypes.E_WALLET ? "ewallet" : "bank";
}

function bankImages(id: number, coverPhoto: string | null) {
  if (!coverPhoto) {
    return { image_url: "", image: "" };
  }

  return {
    image_url: `${ODOO_PUBLIC_BASE}/web/image/bank.information/${id}/image`,
    image: `${ODOO_IMAGE_BASE}/web/content/?model=bank.information&id=${id}&field=image`,
  };
}

export function formatBankInformationItem(bank: BankInformation) {
  const images = bankImages(bank.id, bank.coverPhoto);

  return {
    id: bank.id,
    name: bank.name,
    payment_type: paymentType(bank.paymentTypes),
    account_number: bank.bankAccountNumber,
    account_holder: bank.bankAccountHolder,
    phone: bank.phone,
    ...images,
  };
}
