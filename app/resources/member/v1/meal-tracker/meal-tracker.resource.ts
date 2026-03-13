export class MealTrackerResource {
    static toItem(tracker: any) {
        return {
            id: tracker.id,
            date: tracker.date,
            quantity: tracker.quantity,
            note: tracker.note,
            totalCal: tracker.totalCal,
            totalCarb: tracker.totalCarb,
            totalProtein: tracker.totalProtein,
            totalFat: tracker.totalFat,
            meal: tracker.meal && {
                id: tracker.meal.id,
                name: tracker.meal.name,
                cal: tracker.meal.cal,
                carb: tracker.meal.carb,
                protein: tracker.meal.protein,
                fat: tracker.meal.fat,
            },
        };
    }

    static toCollection(trackers: any[]) {
        return trackers.map((t) => this.toItem(t));
    }

    static withSummary(date: string, trackers: any[]) {
        const items = this.toCollection(trackers);

        const totals = items.reduce(
            (acc, t) => {
                acc.calories += t.totalCal;
                acc.carbs += t.totalCarb;
                acc.protein += t.totalProtein;
                acc.fats += t.totalFat;
                return acc;
            },
            { calories: 0, carbs: 0, protein: 0, fats: 0 },
        );

        return {
            date,
            totals,
            items,
        };
    }
}

