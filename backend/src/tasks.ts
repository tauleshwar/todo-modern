import { endOfWeek, format, startOfWeek } from "date-fns";
import type { HydratedDocument } from "mongoose";
import { z } from "zod";
import type { TaskRecord } from "./models/task";

const statusSchema = z.enum(["IN_PROGRESS", "COMPLETED"]);
const dateTimeSchema = z.string().datetime({ offset: true }).transform((value) => new Date(value));

export const createTaskSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(140, "Title is too long"),
  description: z.string().trim().max(2000, "Description is too long").optional().or(z.literal("")),
  startAt: dateTimeSchema,
  endAt: dateTimeSchema,
}).refine((value) => value.endAt > value.startAt, { message: "End time must be after start time", path: ["endAt"] });

export const updateTaskSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required").max(140, "Title is too long").optional(),
    description: z.string().trim().max(2000, "Description is too long").optional().or(z.literal("")),
    startAt: dateTimeSchema.optional(),
    endAt: dateTimeSchema.optional(),
    status: statusSchema.optional(),
  })
  .refine((value) => Object.keys(value).length > 0, "At least one field is required");

export type ApiTask = {
  id: string;
  title: string;
  description: string | null;
  startAt: string;
  endAt: string;
  status: "IN_PROGRESS" | "COMPLETED";
  createdAt: string;
  updatedAt: string;
};

export type WeekGroup = {
  weekKey: string;
  weekLabel: string;
  weekStart: string;
  weekEnd: string;
  openCount: number;
  completedCount: number;
  tasks: ApiTask[];
};

export function serializeTask(task: HydratedDocument<TaskRecord>): ApiTask {
  const startAt = task.startAt ?? task.dueAt;
  const endAt = task.endAt ?? startAt;

  if (!startAt || !endAt) {
    throw new Error(`Task ${task._id.toString()} has no valid start time`);
  }

  return {
    id: task._id.toString(),
    title: task.title,
    description: task.description || null,
    startAt: startAt.toISOString(),
    endAt: endAt.toISOString(),
    status: task.status,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  };
}

export function groupTasksByWeek(tasks: ApiTask[]): WeekGroup[] {
  const buckets = new Map<string, WeekGroup>();

  for (const task of tasks) {
    const startDate = new Date(task.startAt);
    const weekStart = startOfWeek(startDate, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(startDate, { weekStartsOn: 1 });
    const weekKey = format(weekStart, "yyyy-MM-dd");

    if (!buckets.has(weekKey)) {
      buckets.set(weekKey, {
        weekKey,
        weekLabel: `${format(weekStart, "MMM d")} - ${format(weekEnd, "MMM d")}`,
        weekStart: weekStart.toISOString(),
        weekEnd: weekEnd.toISOString(),
        openCount: 0,
        completedCount: 0,
        tasks: [],
      });
    }

    const bucket = buckets.get(weekKey)!;
    bucket.tasks.push(task);
    if (task.status === "COMPLETED") bucket.completedCount += 1;
    else bucket.openCount += 1;
  }

  return Array.from(buckets.values()).sort(
    (first, second) => new Date(first.weekStart).getTime() - new Date(second.weekStart).getTime(),
  );
}

export function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
