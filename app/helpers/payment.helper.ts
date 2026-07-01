export function formatPaymentReference(
  paymentId: number,
  date = new Date()
) {
  const year = String(date.getFullYear()).slice(-2);
  return `YC/${year}/${String(paymentId).padStart(6, "0")}`;
}

export type RpcPaymentParams = {
  bank_id: number;
  partner_id?: number;
  bank_name?: string;
  client_account_number?: string;
  client_account_holder?: string;
  client_phone?: string;
  request_type: "plan" | "shop";
  member_plan_id?: number;
  shop_level_id?: number;
  trainer_request_id?: number;
  amount: number;
  photo?: string;
};

function optionalString(value: unknown) {
  if (value == null || value === "") return undefined;
  return String(value);
}

function optionalNumber(value: unknown) {
  if (value == null || value === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function parsePaymentRpcBody(
  body: Record<string, unknown>
): RpcPaymentParams {
  let source: Record<string, unknown> = body;

  if (body.params != null) {
    if (typeof body.params === "string") {
      try {
        source = JSON.parse(body.params) as Record<string, unknown>;
      } catch {
        source = body;
      }
    } else if (typeof body.params === "object") {
      source = body.params as Record<string, unknown>;
    }
  }

  return {
    bank_id: Number(source.bank_id),
    partner_id: optionalNumber(source.partner_id),
    bank_name: optionalString(source.bank_name),
    client_account_number: optionalString(source.client_account_number),
    client_account_holder: optionalString(source.client_account_holder),
    client_phone: optionalString(source.client_phone),
    request_type: String(source.request_type ?? "") as "plan" | "shop",
    member_plan_id: optionalNumber(source.member_plan_id),
    shop_level_id: optionalNumber(source.shop_level_id),
    trainer_request_id: optionalNumber(source.trainer_request_id),
    amount: Number(source.amount),
    photo: optionalString(source.photo),
  };
}

export function isPaymentPhotoField(fieldname: string) {
  return fieldname === "photo" || fieldname === "attachment";
}
