export class AttendanceResource {
  static toResource(attendance: any) {
    return {
      id: attendance.id,
      memberId: attendance.memberId,
      date: attendance.date,
      member: attendance.member,
      createdBy: attendance.createdBy,
      updatedBy: attendance.updatedBy,
      createdAt: attendance.createdAt,
      updatedAt: attendance.updatedAt,
    };
  }
}

