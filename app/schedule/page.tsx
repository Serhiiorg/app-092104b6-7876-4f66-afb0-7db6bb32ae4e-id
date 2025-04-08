"use client";
import React, { useState, useEffect } from "react";
import {
  CalendarCheck,
  Clock,
  ArrowLeft,
  Edit,
  Trash2,
  Home,
  Plus,
  X,
} from "lucide-react";
import Link from "next/link";
import { Schedule, DayOfWeek, mockSchedules } from "@/app/types";
import { VideoPlayer } from "@/components/videoplayer";

export default function SchedulePage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(
    null,
  );

  // Form state
  const [title, setTitle] = useState("");
  const [dayOfWeek, setDayOfWeek] = useState<DayOfWeek[]>([]);
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState<number>(15);
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [videoId, setVideoId] = useState("");

  const daysOfWeek: DayOfWeek[] = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  useEffect(() => {
    // For now, use mock data instead of fetching
    setSchedules(mockSchedules.filter((schedule) => schedule.userId === "u1"));
    setIsLoading(false);
  }, []);

  const handleDayToggle = (day: DayOfWeek) => {
    if (dayOfWeek.includes(day)) {
      setDayOfWeek(dayOfWeek.filter((d) => d !== day));
    } else {
      setDayOfWeek([...dayOfWeek, day]);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDayOfWeek([]);
    setTime("");
    setDuration(15);
    setReminderEnabled(true);
    setVideoId("");
    setSelectedSchedule(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const newSchedule: Omit<Schedule, "id"> = {
        userId: "u1",
        title,
        dayOfWeek,
        time,
        duration,
        reminderEnabled,
        ...(videoId && { videoId }),
      };

      // For now, just add to local state
      const fakeId = `s${schedules.length + 1}`;
      setSchedules([...schedules, { ...newSchedule, id: fakeId }]);

      // In a real implementation, we would call the API
      const response = await fetch("/api/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSchedule),
      });
      const data = await response.json();
      setSchedules([...schedules, data]);

      resetForm();
      setShowForm(false);
    } catch (error) {
      console.error("Failed to create schedule:", error);
    }
  };

  const formatDays = (days: DayOfWeek[]) => {
    if (days.length === 7) return "Every day";

    const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    const weekend = ["Saturday", "Sunday"];

    if (
      weekdays.every((day) => days.includes(day as DayOfWeek)) &&
      days.length === 5
    ) {
      return "Weekdays";
    }

    if (
      weekend.every((day) => days.includes(day as DayOfWeek)) &&
      days.length === 2
    ) {
      return "Weekends";
    }

    return days.join(", ");
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const period = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${period}`;
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <header className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <Link
            href="/"
            className="flex items-center text-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="mr-2" size={18} />
            <Home size={18} />
          </Link>

          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary-600 transition-colors"
          >
            {showForm ? (
              <X size={18} className="mr-2" />
            ) : (
              <Plus size={18} className="mr-2" />
            )}
            {showForm ? "Cancel" : "New Schedule"}
          </button>
        </div>

        <h1 className="text-3xl font-serif font-semibold text-foreground">
          Meditation Schedule
        </h1>
        <p className="text-muted-foreground mt-2">
          Plan your meditation sessions and create a consistent practice routine
        </p>
      </header>

      {showForm && (
        <div className="bg-card rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-serif font-semibold mb-4">
            {selectedSchedule ? "Edit Schedule" : "Create New Schedule"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-foreground mb-1"
              >
                Schedule Title
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                placeholder="Morning Meditation"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Days of the Week
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {daysOfWeek.map((day) => (
                  <label
                    key={day}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={dayOfWeek.includes(day)}
                      onChange={() => handleDayToggle(day)}
                      className="form-checkbox h-4 w-4 text-primary rounded focus:ring-primary"
                    />
                    <span className="text-sm text-foreground">{day}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="time"
                  className="block text-sm font-medium text-foreground mb-1"
                >
                  Time
                </label>
                <input
                  type="time"
                  id="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="duration"
                  className="block text-sm font-medium text-foreground mb-1"
                >
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  id="duration"
                  min="1"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                  required
                />
              </div>
            </div>

            <div>
              <label className="flex items-center cursor-pointer space-x-2">
                <input
                  type="checkbox"
                  checked={reminderEnabled}
                  onChange={() => setReminderEnabled(!reminderEnabled)}
                  className="form-checkbox h-4 w-4 text-primary rounded focus:ring-primary"
                />
                <span className="text-sm text-foreground">
                  Enable reminders
                </span>
              </label>
            </div>

            <div>
              <label
                htmlFor="videoId"
                className="block text-sm font-medium text-foreground mb-1"
              >
                YouTube Video ID (optional)
              </label>
              <input
                type="text"
                id="videoId"
                value={videoId}
                onChange={(e) => setVideoId(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                placeholder="e.g. inpok4MKVLM"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Enter the YouTube video ID for guided meditation (e.g.
                inpok4MKVLM)
              </p>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary-600 transition-colors"
              >
                Save Schedule
              </button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-opacity-50 border-t-primary rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your schedules...</p>
        </div>
      ) : (
        <>
          {schedules.length === 0 ? (
            <div className="text-center py-12 bg-muted rounded-lg">
              <CalendarCheck
                size={48}
                className="mx-auto mb-4 text-muted-foreground"
              />
              <h2 className="text-xl font-serif mb-2">No schedules yet</h2>
              <p className="text-muted-foreground mb-4">
                Create your first meditation schedule to get started
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary-600 transition-colors"
              >
                Create Schedule
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {schedules.map((schedule) => (
                <div
                  key={schedule.id}
                  className="bg-card rounded-lg shadow-md overflow-hidden flex flex-col"
                >
                  <div className="p-5 flex-grow">
                    <h3 className="text-lg font-semibold text-foreground font-serif mb-2">
                      {schedule.title}
                    </h3>

                    <div className="flex items-center text-muted-foreground mb-2">
                      <CalendarCheck size={16} className="mr-2" />
                      <span className="text-sm">
                        {formatDays(schedule.dayOfWeek)}
                      </span>
                    </div>

                    <div className="flex items-center text-muted-foreground mb-2">
                      <Clock size={16} className="mr-2" />
                      <span className="text-sm">
                        {formatTime(schedule.time)} · {schedule.duration} min
                      </span>
                    </div>

                    {schedule.reminderEnabled && (
                      <div className="mt-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-secondary text-secondary-foreground">
                          Reminder enabled
                        </span>
                      </div>
                    )}

                    {schedule.videoId && (
                      <div className="mt-4">
                        <VideoPlayer
                          videoId={schedule.videoId}
                          title={schedule.title}
                          autoPlay={false}
                        />
                      </div>
                    )}
                  </div>

                  <div className="p-3 bg-muted mt-auto flex justify-end space-x-2">
                    <button
                      className="p-2 rounded-full hover:bg-background transition-colors"
                      aria-label="Edit schedule"
                    >
                      <Edit size={16} className="text-muted-foreground" />
                    </button>
                    <button
                      className="p-2 rounded-full hover:bg-background transition-colors"
                      aria-label="Delete schedule"
                    >
                      <Trash2 size={16} className="text-muted-foreground" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
