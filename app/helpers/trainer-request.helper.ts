import { Gender, MemberRequestStatus, Prisma } from "@prisma/client";
import { parseOdooFilter } from "./personal-workout.helper";

const ODOO_PUBLIC_BASE =
  process.env.ODOO_PUBLIC_BASE_URL ?? "https://odoo.yc.fitness";
const ODOO_IMAGE_BASE =
  process.env.ODOO_IMAGE_BASE_URL ?? "http://localhost:8069";

type StoredMediaLine = {
  id: number;
  url: string;
};

type TrainerRequestRecord = {
  id: number;
  memberId: number;
  age: number | null;
  gender: Gender | null;
  yearOfExp: number | null;
  reason: string | null;
  certificates: Prisma.JsonValue;
  photos: Prisma.JsonValue;
  status: MemberRequestStatus;
  member: {
    name: string;
    email: string | null;
    phone: string | null;
    bodyMeasurement: {
      heightFeet: string | null;
      heightInches: string | null;
      weight: string | null;
      neck: string | null;
      calf: string | null;
      chest: string | null;
      wrist: string | null;
      waist: string | null;
      hip: string | null;
      shoulders: string | null;
      arms: string | null;
      thigh: string | null;
    } | null;
  };
};

function num(value: string | number | null | undefined) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatGender(gender: Gender | null | undefined) {
  if (!gender) return null;
  return gender.toLowerCase();
}

function formatState(status: MemberRequestStatus) {
  if (status === MemberRequestStatus.APPROVED) return "approve";
  return "draft";
}

function normalizeMediaLines(
  value: Prisma.JsonValue,
  requestId: number,
  memberId: number,
  type: "photo" | "certificate"
) {
  const list = Array.isArray(value) ? value : [];

  return list.map((entry, index) => {
    if (entry && typeof entry === "object" && "url" in entry) {
      const line = entry as StoredMediaLine;
      return {
        id:
          line.id ??
          (type === "photo"
            ? requestId + 77 + index
            : memberId + 1 + index),
        url: line.url,
      };
    }

    if (typeof entry === "string") {
      return {
        id:
          type === "photo"
            ? requestId + 77 + index
            : memberId + 1 + index,
        url: entry,
      };
    }

    return {
      id:
        type === "photo"
          ? requestId + 77 + index
          : memberId + 1 + index,
      url: "",
    };
  });
}

function formatTrainerPhotoLineFormData(
  photos: Prisma.JsonValue,
  requestId: number,
  memberId: number
) {
  return normalizeMediaLines(photos, requestId, memberId, "photo").map(
    (line) => ({
      id: line.id,
      name: null,
      photo: `${ODOO_IMAGE_BASE}/web/content/?model=res.trainer.photo&id=${line.id}&field=photo`,
      trainer_id: emptyTrainerPartner(ODOO_IMAGE_BASE),
    })
  );
}

function formatTrainerCertificateLineFormData(
  certificates: Prisma.JsonValue,
  requestId: number,
  memberId: number
) {
  return normalizeMediaLines(
    certificates,
    requestId,
    memberId,
    "certificate"
  ).map((line) => ({
    id: line.id,
    photo: `${ODOO_IMAGE_BASE}/web/content/?model=res.certificate&id=${line.id}&field=photo`,
  }));
}

function emptyTrainerPartner(base = ODOO_PUBLIC_BASE) {
  return {
    name: null,
    id: null,
    image_1920: `${base}/web/image/?model=res.partner&id=False&field=image_1920`,
  };
}

function trainerPhotoUrl(photo: unknown, lineId: number) {
  if (typeof photo === "string" && photo.trim()) {
    return photo;
  }

  return `${ODOO_PUBLIC_BASE}/web/content/?model=res.trainer.photo&id=${lineId}&field=photo`;
}

function formatTrainerPhotoLine(photos: Prisma.JsonValue) {
  const list = Array.isArray(photos) ? photos : [];

  return list.map((photo, index) => {
    const lineId = index + 1;
    return {
      id: lineId,
      name: "",
      photo: trainerPhotoUrl(photo, lineId),
      trainer_id: emptyTrainerPartner(),
    };
  });
}

function formatTrainerCertificateLine(certificates: Prisma.JsonValue) {
  const list = Array.isArray(certificates) ? certificates : [];

  return list.map((certificate, index) => {
    const lineId = index + 1;
    return {
      id: lineId,
      name: "",
      certificate:
        typeof certificate === "string" && certificate.trim()
          ? certificate
          : `${ODOO_PUBLIC_BASE}/web/content/?model=res.trainer.certificate&id=${lineId}&field=certificate`,
      trainer_id: emptyTrainerPartner(),
    };
  });
}

export function buildTrainerRequestWhere(
  filters: unknown
): Prisma.MemberRequestWhereInput {
  const where: Prisma.MemberRequestWhereInput = {
    memberType: { name: "Trainer Member" },
  };

  const userId = parseOdooFilter(filters, "user_id");
  if (userId) {
    const memberId = Number(userId);
    if (Number.isInteger(memberId) && memberId > 0) {
      where.memberId = memberId;
    }
  }

  return where;
}

export function formatTrainerRequestFormData(request: TrainerRequestRecord) {
  const measurement = request.member.bodyMeasurement;

  return {
    id: request.id,
    trainer_name: request.member.name,
    user_id: request.memberId,
    gmail: request.member.email,
    phone: request.member.phone,
    year_of_experience: request.yearOfExp ?? 0,
    join_purpose: request.reason ?? "",
    certificate: null,
    age: request.age ?? 0,
    gender: formatGender(request.gender),
    weight: num(measurement?.weight),
    height_ft: num(measurement?.heightFeet),
    height_inch: num(measurement?.heightInches),
    neck: num(measurement?.neck),
    calf: num(measurement?.calf),
    chest: num(measurement?.chest),
    wrist: num(measurement?.wrist),
    waist: num(measurement?.waist),
    hip: num(measurement?.hip),
    shoulders: num(measurement?.shoulders),
    arms: num(measurement?.arms),
    thigh: num(measurement?.thigh),
    state: formatState(request.status),
    trainer_photo_line: formatTrainerPhotoLineFormData(
      request.photos,
      request.id,
      request.memberId
    ),
    trainer_certificate_line: formatTrainerCertificateLineFormData(
      request.certificates,
      request.id,
      request.memberId
    ),
  };
}

export function formatTrainerRequest(request: TrainerRequestRecord) {
  const measurement = request.member.bodyMeasurement;

  return {
    id: request.id,
    trainer_name: request.member.name,
    user_id: request.memberId,
    gmail: request.member.email,
    phone: request.member.phone,
    year_of_experience: request.yearOfExp ?? 0,
    join_purpose: request.reason ?? "",
    certificate: null,
    age: request.age ?? 0,
    gender: formatGender(request.gender),
    weight: num(measurement?.weight),
    height_ft: num(measurement?.heightFeet),
    height_inch: num(measurement?.heightInches),
    neck: num(measurement?.neck),
    calf: num(measurement?.calf),
    chest: num(measurement?.chest),
    wrist: num(measurement?.wrist),
    waist: num(measurement?.waist),
    hip: num(measurement?.hip),
    shoulders: num(measurement?.shoulders),
    arms: num(measurement?.arms),
    thigh: num(measurement?.thigh),
    state: formatState(request.status),
    trainer_photo_line: formatTrainerPhotoLine(request.photos),
    trainer_certificate_line: formatTrainerCertificateLine(request.certificates),
  };
}

export const trainerRequestInclude = {
  member: {
    include: {
      bodyMeasurement: true,
    },
  },
} as const;

export type RpcTrainerRequestParams = {
  trainer_name: string;
  user_id: number;
  phone?: string;
  gmail?: string;
  year_of_experience: number;
  certificate?: string;
  join_purpose: string;
  age: number;
  gender: string;
  height_ft?: number | string;
  height_inch?: number | string;
  weight?: number | string;
  chest?: number | string;
  neck?: number | string;
  hip?: number | string;
  calf?: number | string;
  shoulders?: number | string;
  wrist?: number | string;
  arms?: number | string;
  waist?: number | string;
  thigh?: number | string;
  state?: string;
  member_plan_id?: number;
  trainer_photo_line?: { photo?: string }[];
};

export function parseRpcGender(value: string): Gender {
  const normalized = value.toLowerCase();
  if (normalized === "female") return Gender.FEMALE;
  if (normalized === "both") return Gender.BOTH;
  return Gender.MALE;
}

export function parseRpcState(value?: string): MemberRequestStatus {
  if (value?.toLowerCase() === "approve") {
    return MemberRequestStatus.APPROVED;
  }
  return MemberRequestStatus.PENDING;
}

function measurementValue(value: number | string | null | undefined) {
  if (value == null || value === "") return null;
  return String(value);
}

export function buildBodyMeasurementData(params: RpcTrainerRequestParams) {
  return {
    heightFeet: measurementValue(params.height_ft),
    heightInches: measurementValue(params.height_inch),
    weight: measurementValue(params.weight),
    neck: measurementValue(params.neck),
    calf: measurementValue(params.calf),
    chest: measurementValue(params.chest),
    wrist: measurementValue(params.wrist),
    waist: measurementValue(params.waist),
    hip: measurementValue(params.hip),
    shoulders: measurementValue(params.shoulders),
    arms: measurementValue(params.arms),
    thigh: measurementValue(params.thigh),
  };
}

export function normalizeContactField(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export function parseTrainerFormBody(
  body: Record<string, unknown>
): RpcTrainerRequestParams {
  return {
    trainer_name: String(body.trainer_name ?? ""),
    user_id: Number(body.user_id),
    phone: normalizeContactField(
      body.phone != null ? String(body.phone) : undefined
    ),
    gmail: normalizeContactField(
      body.gmail != null ? String(body.gmail) : undefined
    ),
    year_of_experience: Number(body.year_of_experience),
    join_purpose: String(body.join_purpose ?? ""),
    age: Number(body.age),
    gender: String(body.gender ?? "male"),
    height_ft: body.height_ft as string | number | undefined,
    height_inch: body.height_inch as string | number | undefined,
    weight: body.weight as string | number | undefined,
    chest: body.chest as string | number | undefined,
    neck: body.neck as string | number | undefined,
    hip: body.hip as string | number | undefined,
    calf: body.calf as string | number | undefined,
    shoulders: body.shoulders as string | number | undefined,
    wrist: body.wrist as string | number | undefined,
    arms: body.arms as string | number | undefined,
    waist: body.waist as string | number | undefined,
    thigh: body.thigh as string | number | undefined,
    member_plan_id:
      body.member_plan_id != null ? Number(body.member_plan_id) : undefined,
  };
}

export function isTrainerPhotoField(fieldname: string) {
  return (
    fieldname === "trainer_photo_line/photo" ||
    fieldname === "photos" ||
    fieldname.startsWith("trainer_photo_line")
  );
}

export function isTrainerCertificateField(fieldname: string) {
  return (
    fieldname === "trainer_certificate_line/photo" ||
    fieldname === "certificates" ||
    fieldname.startsWith("trainer_certificate_line")
  );
}
