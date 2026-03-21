export class WaterTrackerResource {
    static toItem(tracker: any) {
        return {
            id: tracker.id,
            date: tracker.date,
            dailyWater: tracker.dailyWater,
            createdAt: tracker.createdAt,
            updatedAt: tracker.updatedAt,
        };
    }

    static toCollection(trackers: any[]) {
        return trackers.map((t) => this.toItem(t));
    }

    static withSummary(date: string, trackers: any[]) {
        const items = this.toCollection(trackers);

        const totals = items.reduce(
            (acc, t) => {
                acc.dailyWater += t.dailyWater;
                return acc;
            },
            { dailyWater: 0 },
        );

        return {
            date,
            totals,
            items,
        };
    }
}
