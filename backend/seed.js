import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { User } from "./src/models/user.js";
import { Personal } from "./src/models/Personal.js";
import DailyData from "./src/models/DailyData.js";
import RealtimeData from "./src/models/RealtimeData.js";

async function main() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error("MONGO_URI missing in backend/.env");
  }

  await mongoose.connect(uri);

  const emailId = "demo@neurobridge.local";
  const password = "password123";

  let user = await User.findOne({ emailId });
  if (!user) {
    user = await User.create({ username: "Demo Patient", emailId, password });
  }

  await Personal.findOneAndUpdate(
    { userId: user._id },
    {
      $setOnInsert: { userId: user._id },
      $set: {
        dob: new Date("1996-06-15"),
        gender: "female",
        address: "123 Demo Street",
        emergencyContact: "+1-555-0100",
        medicalHistory: "Hypertension (mild).",
        familyHistory: "Diabetes (father).",
        lifestyle: "Moderate exercise, balanced diet.",
        consentGiven: true,
      },
    },
    { upsert: true, new: true }
  );

  const now = new Date();
  const days = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    d.setHours(8, 0, 0, 0);
    return d;
  });

  for (const day of days) {
    await DailyData.create({
      sleep: {
        duration: 420 + Math.floor(Math.random() * 60),
        quality: ["good", "average", "poor"][Math.floor(Math.random() * 3)],
        start: new Date(day.getTime() - 9 * 60 * 60 * 1000),
        end: day,
      },
      nutrition: {
        calories: 1700 + Math.floor(Math.random() * 600),
        protein: 70 + Math.floor(Math.random() * 40),
        carbs: 180 + Math.floor(Math.random() * 90),
        fat: 45 + Math.floor(Math.random() * 30),
      },
      water_intake: 1600 + Math.floor(Math.random() * 900),
      energy_score: 55 + Math.floor(Math.random() * 40),
      timestamp: day,
    });
  }

  const points = Array.from({ length: 30 }).map((_, i) => {
    const t = new Date(now);
    t.setMinutes(t.getMinutes() - i * 30);
    return t;
  });

  for (const t of points) {
    await RealtimeData.create({
      heart_rate: 60 + Math.floor(Math.random() * 60),
      spo2: 95 + Math.floor(Math.random() * 4),
      stress_level: Math.floor(Math.random() * 11),
      steps: Math.floor(Math.random() * 500),
      calories_burned: Math.floor(Math.random() * 120),
      timestamp: t,
    });
  }

  console.log("Seed complete:");
  console.log(" demo user:", { emailId, password, userId: String(user._id) });
}

main()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    try {
      await mongoose.disconnect();
    } catch {}
  });

