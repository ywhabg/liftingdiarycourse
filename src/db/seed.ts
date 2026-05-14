import { db } from "./index";
import {
  exercisesTable,
  setsTable,
  workoutExercisesTable,
  workoutsTable,
} from "./schema";

const PLACEHOLDER_USER_ID = "user_2abc123defGHIjklMNOpqr";

async function seed() {
  console.log("Seeding database...");

  // Workouts
  const [pushDay, pullDay] = await db
    .insert(workoutsTable)
    .values([
      {
        userId: PLACEHOLDER_USER_ID,
        name: "Push Day",
        startedAt: new Date("2026-05-12T08:00:00"),
        completedAt: new Date("2026-05-12T09:10:00"),
      },
      {
        userId: PLACEHOLDER_USER_ID,
        name: "Pull Day",
        startedAt: new Date("2026-05-13T08:00:00"),
        completedAt: new Date("2026-05-13T08:55:00"),
      },
    ])
    .returning();

  console.log("✓ Workouts inserted");

  // Exercise library
  const [benchPress, overheadPress, latPulldown, barbellRow] = await db
    .insert(exercisesTable)
    .values([
      { userId: PLACEHOLDER_USER_ID, name: "Bench Press" },
      { userId: PLACEHOLDER_USER_ID, name: "Overhead Press" },
      { userId: PLACEHOLDER_USER_ID, name: "Lat Pulldown" },
      { userId: PLACEHOLDER_USER_ID, name: "Barbell Row" },
    ])
    .returning();

  console.log("✓ Exercises inserted");

  // Push Day: Bench Press → Overhead Press
  // Pull Day: Lat Pulldown → Barbell Row
  const [benchInPush, ohpInPush, latInPull, rowInPull] = await db
    .insert(workoutExercisesTable)
    .values([
      { workoutId: pushDay.id, exerciseId: benchPress.id, orderIndex: 1 },
      { workoutId: pushDay.id, exerciseId: overheadPress.id, orderIndex: 2 },
      { workoutId: pullDay.id, exerciseId: latPulldown.id, orderIndex: 1 },
      { workoutId: pullDay.id, exerciseId: barbellRow.id, orderIndex: 2 },
    ])
    .returning();

  console.log("✓ Workout exercises inserted");

  // 3 sets per exercise
  await db.insert(setsTable).values([
    // Bench Press — progressive overload, slight drop on last set
    { workoutExerciseId: benchInPush.id, setNumber: 1, reps: 5, weight: "100.00", unit: "kg" },
    { workoutExerciseId: benchInPush.id, setNumber: 2, reps: 5, weight: "100.00", unit: "kg" },
    { workoutExerciseId: benchInPush.id, setNumber: 3, reps: 4, weight: "100.00", unit: "kg" },

    // Overhead Press
    { workoutExerciseId: ohpInPush.id, setNumber: 1, reps: 8, weight: "62.50", unit: "kg" },
    { workoutExerciseId: ohpInPush.id, setNumber: 2, reps: 7, weight: "62.50", unit: "kg" },
    { workoutExerciseId: ohpInPush.id, setNumber: 3, reps: 8, weight: "60.00", unit: "kg" },

    // Lat Pulldown
    { workoutExerciseId: latInPull.id, setNumber: 1, reps: 10, weight: "75.00", unit: "kg" },
    { workoutExerciseId: latInPull.id, setNumber: 2, reps: 10, weight: "75.00", unit: "kg" },
    { workoutExerciseId: latInPull.id, setNumber: 3, reps: 12, weight: "70.00", unit: "kg" },

    // Barbell Row
    { workoutExerciseId: rowInPull.id, setNumber: 1, reps: 8, weight: "80.00", unit: "kg" },
    { workoutExerciseId: rowInPull.id, setNumber: 2, reps: 8, weight: "80.00", unit: "kg" },
    { workoutExerciseId: rowInPull.id, setNumber: 3, reps: 10, weight: "77.50", unit: "kg" },
  ]);

  console.log("✓ Sets inserted");
  console.log("Seeding complete.");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
