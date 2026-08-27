import { useCallback, useEffect, useState } from "react";
import type { ApiTask, TasksResponse } from "../types/tasks";
import { apiUrl, requestJson } from "../utils/api";
import { TaskFormValues } from "../components/TaskForm";

const EMPTY_RESPONSE: TasksResponse = { tasks: [], weeks: [], total: 0 };

export function useTasks() {
  const [data, setData] = useState<TasksResponse>(EMPTY_RESPONSE);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const loadTasks = useCallback(async (searchQuery: string, signal?: AbortSignal) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.set("search", searchQuery.trim());
      const query = params.toString();
      const payload = await requestJson<TasksResponse>(apiUrl(`/api/tasks${query ? \`?\${query}\` : ""}`), { signal });
      setData(payload);
      setError(null);
    } catch (loadError) {
      if (!(loadError instanceof Error && loadError.name === "AbortError")) {
        setError(loadError instanceof Error ? loadError.message : "Tasks could not be loaded.");
      }
    } finally {
      if (!signal?.aborted) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => void loadTasks(search, controller.signal), 220);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [loadTasks, search]);

  async function saveTask(values: TaskFormValues, editingTask: ApiTask | null) {
    setIsSaving(true);
    setError(null);
    try {
      const payload = { ...values, startAt: new Date(values.startAt).toISOString(), endAt: new Date(values.endAt).toISOString() };
      await requestJson(apiUrl(editingTask ? `/api/tasks/${editingTask.id}` : "/api/tasks"), {
        method: editingTask ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      await loadTasks(search);
      return new Date(payload.startAt);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Task could not be saved.");
      throw saveError;
    } finally {
      setIsSaving(false);
    }
  }

  async function toggleStatus(task: ApiTask) {
    setError(null);
    const newStatus = task.status === "COMPLETED" ? "IN_PROGRESS" : "COMPLETED";

    setData((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t)),
      weeks: prev.weeks.map((w) => ({
        ...w,
        tasks: w.tasks.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t)),
      })),
    }));

    try {
      await requestJson(apiUrl(`/api/tasks/${task.id}`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (updateError) {
      await loadTasks(search);
      setError(updateError instanceof Error ? updateError.message : "Task status could not be updated.");
    }
  }

  async function deleteTask(task: ApiTask) {
    if (!window.confirm(`Delete “${task.title}”?`)) return false;
    setError(null);

    setData((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => t.id !== task.id),
      weeks: prev.weeks.map((w) => ({
        ...w,
        tasks: w.tasks.filter((t) => t.id !== task.id),
      })),
    }));

    try {
      await requestJson(apiUrl(`/api/tasks/${task.id}`), { method: "DELETE" });
      return true;
    } catch (deleteError) {
      await loadTasks(search);
      setError(deleteError instanceof Error ? deleteError.message : "Task could not be deleted.");
      return false;
    }
  }

  return {
    data,
    search,
    setSearch,
    isLoading,
    error,
    setError,
    isSaving,
    saveTask,
    toggleStatus,
    deleteTask,
  };
}
