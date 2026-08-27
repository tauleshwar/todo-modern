import { Router } from "express";
import { ZodError } from "zod";
import { connectDatabase } from "../database";
import { Task } from "../models/task";
import { createTaskSchema, escapeRegex, groupTasksByWeek, serializeTask, updateTaskSchema } from "../tasks";

export const taskRouter = Router();

taskRouter.get("/", async (request, response) => {
  try {
    await connectDatabase();
    const search = typeof request.query.search === "string" ? request.query.search.trim() : "";
    const escapedSearch = escapeRegex(search);
    const filter = search
      ? { $or: [{ title: { $regex: escapedSearch, $options: "i" } }, { description: { $regex: escapedSearch, $options: "i" } }] }
      : {};
    const tasks = await Task.find(filter).sort({ startAt: 1, createdAt: -1 });
    const serialized = tasks.map(serializeTask);
    response.json({ tasks: serialized, weeks: groupTasksByWeek(serialized), total: serialized.length, search });
  } catch (error) {
    console.error("Unable to load tasks", error);
    response.status(500).json({ message: "Failed to load tasks" });
  }
});

taskRouter.post("/", async (request, response) => {
  try {
    const parsed = createTaskSchema.parse(request.body);
    await connectDatabase();
    const task = await Task.create({ ...parsed, description: parsed.description?.trim() || null });
    response.status(201).json({ task: serializeTask(task) });
  } catch (error) {
    if (error instanceof ZodError) {
      response.status(422).json({ message: error.issues[0]?.message ?? "Invalid task payload" });
      return;
    }
    console.error("Unable to create task", error);
    response.status(500).json({ message: "Task could not be created" });
  }
});

taskRouter.patch("/:id", async (request, response) => {
  try {
    const parsed = updateTaskSchema.parse(request.body);
    await connectDatabase();
    const existingTask = await Task.findById(request.params.id);
    if (!existingTask) {
      response.status(404).json({ message: "Task not found" });
      return;
    }
    const startAt = parsed.startAt ?? existingTask.startAt ?? existingTask.dueAt;
    const endAt = parsed.endAt ?? existingTask.endAt ?? startAt;
    if (!startAt || !endAt) {
      response.status(422).json({ message: "Task needs a valid start and end time" });
      return;
    }
    const isChangingTime = parsed.startAt !== undefined || parsed.endAt !== undefined;
    if (isChangingTime && endAt <= startAt) {
      response.status(422).json({ message: "End time must be after start time" });
      return;
    }
    const task = await Task.findByIdAndUpdate(
      request.params.id,
      {
        ...(parsed.title !== undefined ? { title: parsed.title } : {}),
        ...(parsed.description !== undefined ? { description: parsed.description.trim() || null } : {}),
        ...(parsed.startAt !== undefined ? { startAt: parsed.startAt } : {}),
        ...(parsed.endAt !== undefined ? { endAt: parsed.endAt } : {}),
        ...(parsed.status !== undefined ? { status: parsed.status } : {}),
      },
      { new: true, runValidators: true },
    );

    if (!task) {
      response.status(404).json({ message: "Task not found" });
      return;
    }
    response.json({ task: serializeTask(task) });
  } catch (error) {
    if (error instanceof ZodError) {
      response.status(422).json({ message: error.issues[0]?.message ?? "Invalid task payload" });
      return;
    }
    console.error("Unable to update task", error);
    response.status(400).json({ message: "Task could not be updated" });
  }
});

taskRouter.delete("/:id", async (request, response) => {
  try {
    await connectDatabase();
    const task = await Task.findByIdAndDelete(request.params.id);
    if (!task) {
      response.status(404).json({ message: "Task not found" });
      return;
    }
    response.json({ ok: true });
  } catch (error) {
    console.error("Unable to delete task", error);
    response.status(400).json({ message: "Task could not be deleted" });
  }
});
