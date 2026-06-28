-- CreateEnum
CREATE TYPE "BodyGoalType" AS ENUM ('weight_gain', 'weight_loss', 'beauty');

-- CreateEnum
CREATE TYPE "BodyType" AS ENUM ('ectomorph', 'mesomorph', 'endomorph');

-- CreateEnum
CREATE TYPE "EngergyLevel" AS ENUM ('even_throughout_the_day', 'a_dip_in_energy_around_lunch_time', 'a_nap_after_meals', 'mostly_at_home');

-- CreateEnum
CREATE TYPE "DailyLife" AS ENUM ('at_the_office', 'walking_daily', 'working_physically', 'most_at_home');

-- CreateEnum
CREATE TYPE "AverageNight" AS ENUM ('less_than_five_hours', 'five_six_hours', 'seven_eight_hours', 'more_than_eight_hours');

-- CreateEnum
CREATE TYPE "PhysicalActivity" AS ENUM ('not_much', 'one_two_time_a_week', 'three_five_time_a_week', 'five_seven_time_a_week');

-- CreateEnum
CREATE TYPE "PreferredActivity" AS ENUM ('working_out_at_home', 'working_out_at_a_gym', 'running', 'walking');

-- CreateEnum
CREATE TYPE "LastIdeaWeight" AS ENUM ('less_than_a_year', 'one_to_two_years_ago', 'more_than_three_years', 'never');

-- CreateEnum
CREATE TYPE "DailyWaterIntake" AS ENUM ('one', 'two', 'two_to_six', 'more_than_six');

-- CreateEnum
CREATE TYPE "ProficientLevelType" AS ENUM ('beginner', 'advanced', 'professional');

-- AlterTable
ALTER TABLE "MemberProfile" ADD COLUMN     "averageNight" TEXT,
ADD COLUMN     "bodyGoalType" TEXT,
ADD COLUMN     "bodyType" TEXT,
ADD COLUMN     "dailyLife" TEXT,
ADD COLUMN     "dailyWaterIntake" TEXT,
ADD COLUMN     "energyLevel" TEXT,
ADD COLUMN     "idealWeight" INTEGER,
ADD COLUMN     "lastIdeaWeight" TEXT,
ADD COLUMN     "physicalActivity" TEXT,
ADD COLUMN     "preferredActivity" TEXT,
ADD COLUMN     "proficientLevelType" TEXT;

-- CreateTable
CREATE TABLE "MemberFitnessSurvey" (
    "id" SERIAL NOT NULL,
    "memberId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "bodyGoal" "BodyGoalType",
    "bodyType" "BodyType",
    "energyLevel" "EngergyLevel",
    "dailyLife" "DailyLife",
    "averageNight" "AverageNight",
    "physicalActivity" "PhysicalActivity",
    "preferredActivity" "PreferredActivity",
    "lastIdealWeight" "LastIdeaWeight",
    "dailyWaterIntake" "DailyWaterIntake",
    "proficientLevel" "ProficientLevelType",

    CONSTRAINT "MemberFitnessSurvey_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MemberFitnessSurvey" ADD CONSTRAINT "MemberFitnessSurvey_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;
