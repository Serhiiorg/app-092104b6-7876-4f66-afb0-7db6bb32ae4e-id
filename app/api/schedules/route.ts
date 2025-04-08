import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
import { Schedule, DayOfWeek } from "@/app/types";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    const result = await pool.query(
      `SELECT * FROM schedules WHERE value->>'userId' = $1`,
      [userId],
    );

    const schedules = result.rows.map((row) => ({
      id: row.id,
      ...row.value,
    }));

    return NextResponse.json(schedules);
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to fetch schedules: ${error}` },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const {
      userId,
      title,
      dayOfWeek,
      time,
      duration,
      reminderEnabled,
      videoId,
    } = body;

    if (
      !userId ||
      !title ||
      !dayOfWeek ||
      !time ||
      duration === undefined ||
      reminderEnabled === undefined
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Validate dayOfWeek is an array of valid days
    const validDays: DayOfWeek[] = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];
    if (
      !Array.isArray(dayOfWeek) ||
      !dayOfWeek.every((day) => validDays.includes(day as DayOfWeek))
    ) {
      return NextResponse.json(
        { error: "Invalid dayOfWeek values" },
        { status: 400 },
      );
    }

    // Validate time format (HH:MM)
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!timeRegex.test(time)) {
      return NextResponse.json(
        { error: "Time must be in HH:MM format" },
        { status: 400 },
      );
    }

    // Validate duration is a positive number
    if (typeof duration !== "number" || duration <= 0) {
      return NextResponse.json(
        { error: "Duration must be a positive number" },
        { status: 400 },
      );
    }

    // Create schedule object
    const schedule: Omit<Schedule, "id"> = {
      userId,
      title,
      dayOfWeek: dayOfWeek as DayOfWeek[],
      time,
      duration,
      reminderEnabled,
      ...(videoId && { videoId }),
    };

    // Insert into database
    const result = await pool.query(
      "INSERT INTO schedules (value) VALUES ($1) RETURNING id",
      [schedule],
    );

    const newSchedule: Schedule = {
      id: result.rows[0].id,
      ...schedule,
    };

    return NextResponse.json(newSchedule, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to create schedule: ${error}` },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...scheduleData } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Schedule ID is required" },
        { status: 400 },
      );
    }

    // Check if schedule exists
    const checkResult = await pool.query(
      "SELECT * FROM schedules WHERE id = $1",
      [id],
    );

    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Schedule not found" },
        { status: 404 },
      );
    }

    // Update schedule
    await pool.query("UPDATE schedules SET value = $1 WHERE id = $2", [
      scheduleData,
      id,
    ]);

    const updatedSchedule: Schedule = {
      id,
      ...(scheduleData as Omit<Schedule, "id">),
    };

    return NextResponse.json(updatedSchedule);
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to update schedule: ${error}` },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Schedule ID is required" },
        { status: 400 },
      );
    }

    // Check if schedule exists
    const checkResult = await pool.query(
      "SELECT * FROM schedules WHERE id = $1",
      [id],
    );

    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Schedule not found" },
        { status: 404 },
      );
    }

    // Delete schedule
    await pool.query("DELETE FROM schedules WHERE id = $1", [id]);

    return NextResponse.json(
      { message: "Schedule deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to delete schedule: ${error}` },
      { status: 500 },
    );
  }
}
