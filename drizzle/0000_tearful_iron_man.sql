CREATE TYPE "public"."weight_unit" AS ENUM('kg', 'lbs');--> statement-breakpoint
CREATE TABLE "exercises" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "exercises_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"userId" text NOT NULL,
	"name" varchar(255) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sets" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "sets_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"workoutExerciseId" integer NOT NULL,
	"setNumber" integer NOT NULL,
	"reps" integer NOT NULL,
	"weight" numeric(6, 2) NOT NULL,
	"unit" "weight_unit" NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workout_exercises" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "workout_exercises_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"workoutId" integer NOT NULL,
	"exerciseId" integer NOT NULL,
	"orderIndex" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workouts" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "workouts_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"userId" text NOT NULL,
	"name" varchar(255) NOT NULL,
	"startedAt" timestamp DEFAULT now() NOT NULL,
	"completedAt" timestamp,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "sets" ADD CONSTRAINT "sets_workoutExerciseId_workout_exercises_id_fk" FOREIGN KEY ("workoutExerciseId") REFERENCES "public"."workout_exercises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_exercises" ADD CONSTRAINT "workout_exercises_workoutId_workouts_id_fk" FOREIGN KEY ("workoutId") REFERENCES "public"."workouts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_exercises" ADD CONSTRAINT "workout_exercises_exerciseId_exercises_id_fk" FOREIGN KEY ("exerciseId") REFERENCES "public"."exercises"("id") ON DELETE restrict ON UPDATE no action;