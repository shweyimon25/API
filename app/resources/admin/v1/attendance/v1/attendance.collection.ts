import { AttendanceResource } from "./attendance.resource";

export class AttendanceCollection {
  static toCollection(attendances: any[]) {
    return attendances.map((attendance) => AttendanceResource.toResource(attendance));
  }

  static withPagination(attendances: { data: any[]; meta: any }) {
    return {
      data: this.toCollection(attendances.data),
      meta: attendances.meta,
    };
  }
}

