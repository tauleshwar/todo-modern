import { addDays, format, isSameDay, startOfWeek } from "date-fns";
import { ArrowLeft, ChevronLeft, ChevronRight, Plus, X } from "lucide-react";
import { useMemo, useState } from "react";
import { TaskForm, type TaskFormValues } from "./components/TaskForm";
import { Onboarding } from "./components/Onboarding";
import { SummaryCard } from "./components/SummaryCard";
import { SearchResults } from "./components/SearchResults";
import { useTasks } from "./hooks/useTasks";
import { toLocalIso, weekDaysFromMonday } from "./utils/date";

import checklistAsset from "./assets/ui/Book.svg";
import editAsset from "./assets/ui/edit.svg";
import emptyChecklistAsset from "./assets/ui/Rectangle 14.svg";
import searchAsset from "./assets/ui/Header.svg";
import trashAsset from "./assets/ui/trash-2.svg";
import type { ApiTask, WeekGroup } from "./types/tasks";

export function App() {
  const {
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
  } = useTasks();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState(() => new Date());
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [showAllInWeek, setShowAllInWeek] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<ApiTask | null>(null);

  const selectedWeekKey = format(startOfWeek(selectedDay, { weekStartsOn: 1 }), "yyyy-MM-dd");
  const selectedWeek = useMemo<WeekGroup | null>(
    () => data.weeks.find((week) => week.weekKey === selectedWeekKey) ?? null,
    [data.weeks, selectedWeekKey],
  );
  const weekDays = useMemo(() => weekDaysFromMonday(selectedDay), [selectedDay]);
  const weekTasks = useMemo(() => selectedWeek?.tasks ?? [], [selectedWeek]);
  const dayTasks = useMemo(
    () => weekTasks.filter((task) => isSameDay(new Date(task.startAt), selectedDay)),
    [selectedDay, weekTasks],
  );
  const listTasks = showAllInWeek ? weekTasks : dayTasks;
  const searchTasks = data.tasks;
  const completedCount = weekTasks.filter((task) => task.status === "COMPLETED").length;
  const pendingCount = weekTasks.length - completedCount;
  const progressPercent = weekTasks.length ? Math.round((completedCount / weekTasks.length) * 100) : 0;
  
  const formInitialValues = editingTask
    ? { title: editingTask.title, description: editingTask.description ?? "", startAt: editingTask.startAt, endAt: editingTask.endAt }
    : { startAt: toLocalIso(selectedDay), endAt: toLocalIso(new Date(selectedDay.getTime() + 60 * 60 * 1000)) };

  function navigateWeek(direction: -1 | 1) {
    setShowAllInWeek(false);
    setSelectedDay((current) => addDays(current, direction * 7));
  }

  function openCreate() {
    setEditingTask(null);
    setIsFormOpen(true);
  }

  function openEdit(task: ApiTask) {
    setEditingTask(task);
    setIsFormOpen(true);
  }

  function closeForm() {
    if (isSaving) return;
    setIsFormOpen(false);
    setEditingTask(null);
  }

  async function handleSaveTask(values: TaskFormValues) {
    try {
      const newSelectedDay = await saveTask(values, editingTask);
      setSelectedDay(newSelectedDay);
      setIsFormOpen(false);
      setEditingTask(null);
    } catch (e) {
      // Error is handled in the hook
    }
  }

  if (showOnboarding) return <Onboarding isReady onDismiss={() => setShowOnboarding(false)} />;

  if (isSearchOpen) {
    return (
      <main className="app-canvas app-canvas--search">
        <section className="search-screen" aria-label="Search tasks">
          <button type="button" className="search-back" onClick={() => setIsSearchOpen(false)} aria-label="Back to tasks">
            <ArrowLeft className="h-5 w-5" strokeWidth={1.8} />
          </button>
          <label className="search-field search-field--focused">
            <input autoFocus value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Finish" aria-label="Search tasks" />
            {search ? (
              <button type="button" onClick={() => setSearch("")} className="icon-button" aria-label="Clear search">
                <X className="h-4 w-4" strokeWidth={1.8} />
              </button>
            ) : null}
            <img className="search-asset" src={searchAsset} alt="" aria-hidden="true" />
          </label>
          <SearchResults tasks={searchTasks} isLoading={isLoading} search={search} onToggle={toggleStatus} />
        </section>
      </main>
    );
  }

  return (
    <main className="app-canvas app-canvas--tasks">
      <section className="screen-content" aria-label="Your tasks">
        <header className="home-header"><h1>Home</h1></header>
        <label className="search-field">
          <input value={search} onFocus={() => setIsSearchOpen(true)} onChange={(event) => setSearch(event.target.value)} placeholder="Search for a task" aria-label="Search tasks" />
          {search ? (
            <button type="button" onClick={() => setSearch("")} className="icon-button" aria-label="Clear search">
              <X className="h-4 w-4" strokeWidth={1.8} />
            </button>
          ) : null}
          <img className="search-asset" src={searchAsset} alt="" aria-hidden="true" />
        </label>

        <section className="week-selector" aria-label="Week selector">
          <div className="week-selector__nav">
            <button type="button" onClick={() => navigateWeek(-1)} className="week-nav" aria-label="Previous week"><ChevronLeft className="h-4 w-4" /></button>
            <p>{format(weekDays[0], "MMMM yyyy")}</p>
            <button type="button" onClick={() => navigateWeek(1)} className="week-nav" aria-label="Next week"><ChevronRight className="h-4 w-4" /></button>
          </div>
          <div className="calendar-grid">
            {weekDays.map((day) => {
              const isSelected = isSameDay(day, selectedDay);
              return (
                <button
                  type="button"
                  key={day.toISOString()}
                  onClick={() => { setShowAllInWeek(false); setSelectedDay(day); }}
                  className={`calendar-day ${isSelected ? "calendar-day--selected" : ""}`}
                  aria-pressed={isSelected}
                >
                  <span>{format(day, "EEE")}</span><strong>{format(day, "dd")}</strong><i aria-hidden="true" />
                </button>
              );
            })}
          </div>
        </section>

        <section className="summary-grid" aria-label="Weekly task summary">
          <SummaryCard label="Task Complete" count={completedCount} tone="complete" />
          <SummaryCard label="Task Pending" count={pendingCount} tone="pending" />
        </section>

        <section className="progress-section" aria-label="Weekly progress">
          <div className="section-title-row"><h1>Weekly Progress</h1><span>{progressPercent}%</span></div>
          <div className="progress-track" aria-hidden="true"><div className="progress-value" style={{ width: `${progressPercent}%` }} /></div>
        </section>

        <section className="task-section" aria-label="Task list">
          <div className="section-title-row">
            <h2>{showAllInWeek ? "Tasks This Week" : "Tasks Today"}</h2>
            <button type="button" onClick={() => setShowAllInWeek((value) => !value)} className="text-action">{showAllInWeek ? "View Day" : "View All"}</button>
          </div>

          {error ? <div className="notice notice--error" role="alert"><span>{error}</span><button type="button" onClick={() => setError(null)} aria-label="Dismiss message"><X className="h-4 w-4" /></button></div> : null}
          {isLoading && listTasks.length === 0 ? <p className="empty-state">Loading tasks…</p> : null}
          {!isLoading && listTasks.length === 0 ? <p className="empty-state">{search ? "No tasks match your search." : "Nothing planned here yet."}</p> : null}
          {listTasks.length > 0 ? (
            <ul className="task-list">
              {listTasks.map((task) => (
                <li key={task.id} className="task-row">
                  <button type="button" onClick={() => void toggleStatus(task)} className={`task-check ${task.status === "COMPLETED" ? "task-check--completed" : ""}`} aria-label={`Mark ${task.title} as ${task.status === "COMPLETED" ? "in progress" : "complete"}`}>
                    <img className="task-check__icon" src={task.status === "COMPLETED" ? checklistAsset : emptyChecklistAsset} alt="" aria-hidden="true" />
                  </button>
                  <button type="button" onClick={() => openEdit(task)} className="task-name">
                    <span className={task.status === "COMPLETED" ? "task-name--completed" : ""}>{task.title}</span>
                    {showAllInWeek ? <small>{format(new Date(task.startAt), "EEE, MMM d · h:mm a")} - {format(new Date(task.endAt), "h:mm a")}</small> : null}
                  </button>
                  <div className="task-actions">
                    <button type="button" onClick={() => void deleteTask(task)} aria-label={`Delete ${task.title}`}><img className="row-action-icon" src={trashAsset} alt="" aria-hidden="true" /></button>
                    <button type="button" onClick={() => openEdit(task)} aria-label={`Edit ${task.title}`}><img className="row-action-icon" src={editAsset} alt="" aria-hidden="true" /></button>
                  </div>
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      </section>

      <button type="button" onClick={openCreate} className="floating-action" aria-label="Add new task"><Plus className="h-7 w-7" strokeWidth={1.7} /></button>

      {isFormOpen ? (
        <div className="sheet-backdrop" role="presentation" onMouseDown={closeForm}>
          <div className="sheet-dialog" role="dialog" aria-modal="true" aria-labelledby="task-form-heading" onMouseDown={(event) => event.stopPropagation()}>
            <TaskForm key={editingTask?.id ?? "new"} mode={editingTask ? "edit" : "create"} initialValues={formInitialValues} onSubmit={handleSaveTask} onCancel={closeForm} isSubmitting={isSaving} />
          </div>
        </div>
      ) : null}
    </main>
  );
}
