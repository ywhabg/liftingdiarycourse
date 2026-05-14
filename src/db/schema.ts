import { relations } from "drizzle-orm";
import { integer, numeric, pgEnum, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const weightUnitEnum = pgEnum("weight_unit", ["kg", "lbs"]);

export const workoutsTable = pgTable("workouts", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: text().notNull(),
  name: varchar({ length: 255 }).notNull(),
  startedAt: timestamp().defaultNow().notNull(),
  completedAt: timestamp(),
  updatedAt: timestamp().defaultNow().notNull(),
});

export const exercisesTable = pgTable("exercises", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: text().notNull(),
  name: varchar({ length: 255 }).notNull(),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
});

export const workoutExercisesTable = pgTable("workout_exercises", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  workoutId: integer().notNull().references(() => workoutsTable.id, { onDelete: "cascade" }),
  exerciseId: integer().notNull().references(() => exercisesTable.id, { onDelete: "restrict" }),
  orderIndex: integer().notNull(),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
});

export const setsTable = pgTable("sets", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  workoutExerciseId: integer().notNull().references(() => workoutExercisesTable.id, { onDelete: "cascade" }),
  setNumber: integer().notNull(),
  reps: integer().notNull(),
  weight: numeric({ precision: 6, scale: 2 }).notNull(),
  unit: weightUnitEnum().notNull(),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
});

export const workoutsRelations = relations(workoutsTable, ({ many }) => ({
  workoutExercises: many(workoutExercisesTable),
}));

export const exercisesRelations = relations(exercisesTable, ({ many }) => ({
  workoutExercises: many(workoutExercisesTable),
}));

export const workoutExercisesRelations = relations(workoutExercisesTable, ({ one, many }) => ({
  workout: one(workoutsTable, {
    fields: [workoutExercisesTable.workoutId],
    references: [workoutsTable.id],
  }),
  exercise: one(exercisesTable, {
    fields: [workoutExercisesTable.exerciseId],
    references: [exercisesTable.id],
  }),
  sets: many(setsTable),
}));

export const setsRelations = relations(setsTable, ({ one }) => ({
  workoutExercise: one(workoutExercisesTable, {
    fields: [setsTable.workoutExerciseId],
    references: [workoutExercisesTable.id],
  }),
}));
