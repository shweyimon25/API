export class WaterTrackerResource {
  static toResource(waterTracker: any) {
    return {
      id: waterTracker.id,
      date: waterTracker.date,
      member: waterTracker.member
        ? {
            id: waterTracker.member.id,
            name: waterTracker.member.name,
            code: waterTracker.member.code,
            email: waterTracker.member.email,
          }
        : null,
      dailyWater: waterTracker.dailyWater,
      createdAt: waterTracker.createdAt,
      updatedAt: waterTracker.updatedAt,
    };
  }
}

