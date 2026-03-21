import { Status } from "@prisma/client";
import prisma from "../client";

const MealSeeder = async () => {
    console.log("Meal seeding ...");

    const meals = [
        {
            "name": "ထမင်း ၁ ပန်းကန်လုံး (၆)ဇွန်း",
            "cal": 187.50,
            "carb": 60.00,
            "protein": 36.00,
            "fat": 0.00,
            "mealType": "Breakfast",
        },
        {
            "name": "ကြက်သားဒံပေါက် (၉ ဇွန်း) ၁ ပန်းကန်ပြား",
            "cal": 525.00,
            "carb": 54.00,
            "protein": 19.00,
            "fat": 13.00,
            "mealType": "Lunch",
        },
        {
            "name": "ကြက်သားခေါက်ဆွဲကြော် ၁ ပန်းကန်ပြား",
            "cal": 594.00,
            "carb": 219.00,
            "protein": 7.20,
            "fat": 3.30,
            "mealType": "Dinner",
        },
        {
            "name": "ပဲပြုတ်ထမင်းဆီဆမ်း",
            "cal": 435.00,
            "carb": 0.00,
            "protein": 0.00,
            "fat": 0.00,
            "mealType": "Breakfast",
        },
        {
            "name": "ထမင်းပေါင်း",
            "cal" : "475.00",
            "carb" : 0.00,
            "protein" : 0.00,
            "fat" : 0.00,
            "mealType" : "Breakfast",
        },
        {
            "name": "တို့ဟူးသုတ်",
            "cal" : 195.00,
            "carb": 0.00,
            "protein": 0.00,
            "fat": 0.00,
            "mealType": "Snack",
        },
        {
            "name": "နံပြား",
            "cal": 226.00,
            "carb": 0.00,
            "protein": 0.00,
            "fat": 0.00,
            "mealType": "Snack",
        },
        {
            "name": "ဝက်သားပေါက်ဆီ",
            "cal": 340.00,
            "carb": 0.00,
            "protein": 0.00,
            "fat": 0.00,
            "mealType": "Snack",
        },
        {
            "name": "ပဲပလာတာ",
            "cal": 377.00,
            "carb": 0.00,
            "protein": 0.00,
            "fat": 0.00,
            "mealType": "Breakfast",
        },
        {
            "name": "အီကြာကွေး",
            "cal": 314.00,
            "carb": 0.00,
            "protein": 0.00,
            "fat": 0.00,
            "mealType": "Breakfast",
        },
        {
            "name": "ဆီထမင်း",
            "cal": 187.00,
            "carb": 0.00,
            "protein": 0.00,
            "fat": 0.00,
            "mealType": "Snack",
        },
        {
            "name": "ပဲပြုတ်ကောက်ညှင်းပေါင်း",
            "cal": 217.00,
            "carb": 0.00,
            "protein": 0.00,
            "fat": 0.00,
            "mealType": "Snack",
        },
        {
            "name": "မုန့်ကျွဲသဲ",
            "cal": 56.00,
            "carb": 0.00,
            "protein": 0.00,
            "fat": 0.00,
            "mealType": "Snack",
        },
        {
            "name": "ထန်းသီးမုန့်",
            "cal": 120.00,
            "carb": 0.00,
            "protein": 0.00,
            "fat": 0.00,
            "mealType": "Snack",
        },
        {
            "name": "မုန့်လင်မယား",
            "cal": 73.00,
            "carb": 0.00,
            "protein": 0.00,
            "fat": 0.00,
            "mealType": "Snack",
        },
        {
            "name": "ဘီးမုန့်",
            "cal": 286.40,
            "carb": 0.00,
            "protein": 0.00,
            "fat": 0.00,
            "mealType": "Snack",
        },
        {
            "name": "စမူဆာ",
            "cal": 91.00,
            "carb": 0.00,
            "protein": 0.00,
            "fat": 0.00,
            "mealType": "Snack",
        },
        {
            "name": "ဘူးသီးကြော်",
            "cal": 70.00,
            "carb": 0.00,
            "protein": 0.00,
            "fat": 0.00,
            "mealType": "Snack",
        },
        {
            "name": "ကော်ပြန့်စိမ်း",
            "cal": 76.00,
            "carb": 0.00,
            "protein": 0.00,
            "fat": 0.00,
            "mealType": "Snack",
        },
        {
            "name": "ကော်ပြန့်ကြော်",
            "cal": 200.00,
            "carb": 0.00,
            "protein": 0.00,
            "fat": 0.00,
            "mealType": "Breakfast",
        },
        {
            "name": "ပေါင်မုန့်  ၂ ချပ်",
            "cal": 150.00,
            "carb": 49.00   ,
            "protein": 9.00,
            "fat": 3.20,
            "mealType": "Breakfast",
        },
        {
            "name": "ပေါင်မုန့်ထောပါတ်သုတ်",
            "cal": 119.00,
            "carb": 13.90,
            "protein": 2.50,
            "fat": 4.10,
            "mealType": "Breakfast",
        },
        {
            "name": "ကိတ်မုန့် ၁ ချပ်",
            "cal": 118.00,
            "carb": 59.00,
            "protein": 6.00,
            "fat": 0.30,
            "mealType": "Snack",
        },
        {
            "name": "ကြက်သားဟမ်ဘာကာ",
            "cal": 580.00,
            "carb": 24.00,
            "protein": 17.00,
            "fat": 14.00,
            "mealType": "Breakfast",
        },
        {
            "name": "ဒိုးနတ် ၁ ခု",
            "cal": 210.50,
            "carb": 269.00,
            "protein": 4.00,
            "fat": 15.00,
            "mealType": "Snack",
        },
        {
            "name": "ချိ(စ်)ဆန်းဒွစ်(ချ်)",
            "cal": 130.00,
            "carb": 31.00,
            "protein": 16.00,
            "fat": 25.00,
            "mealType": "Breakfast",
        },
        {
            "name": "Mont Hinn Garr",
            "cal": 300.00,
            "carb": 200.00,
            "protein": 11.00,
            "fat": 55.00,
            "mealType": "Breakfast",
        }
    ];

    for (const meal of meals) {
        const existing = await prisma.meal.findFirst({
            where: { name: meal.name },
        });

        if (existing) {
            await prisma.meal.update({
                where: { id: existing.id },
                data: {
                    name: meal.name,
                    cal: Number(meal.cal),
                    carb: meal.carb,
                    protein: meal.protein,
                    fat: meal.fat,
                    mealType: meal.mealType,
                    status: Status.ACTIVE,
                },
            });
        } else {
            await prisma.meal.create({
                data: {
                    name: meal.name,
                    cal: Number(meal.cal),
                    carb: meal.carb,
                    protein: meal.protein,
                    fat: meal.fat,
                    mealType: meal.mealType,
                    createdById: 1,
                },
            });
        }
    }

    console.log("Meal seeded successfully");
};

export default MealSeeder;
