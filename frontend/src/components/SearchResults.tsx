import type { ApiTask } from "../types/tasks";
import checklistAsset from "../assets/ui/Book.svg";
import emptyChecklistAsset from "../assets/ui/Rectangle 14.svg";

export function SearchResults({ tasks, isLoading, search, onToggle }: { tasks: ApiTask[]; isLoading: boolean; search: string; onToggle: (task: ApiTask) => Promise<void> }) {
  return (
    <section className="search-results" aria-label="Search results">
      {isLoading && tasks.length === 0 ? <p className="empty-state">Loading tasks…</p> : null}
      {!isLoading && tasks.length === 0 ? <p className="empty-state">{search ? "No tasks match your search." : "Search your tasks."}</p> : null}
      {tasks.length > 0 ? (
        <ul className="task-list">
          {tasks.map((task) => (
            <li key={task.id} className="task-row search-result-row">
              <button type="button" onClick={() => void onToggle(task)} className={`task-check ${task.status === "COMPLETED" ? "task-check--completed" : ""}`} aria-label={`Mark ${task.title} as ${task.status === "COMPLETED" ? "in progress" : "complete"}`}>
                <img className="task-check__icon" src={task.status === "COMPLETED" ? checklistAsset : emptyChecklistAsset} alt="" aria-hidden="true" />
              </button>
              <span className={task.status === "COMPLETED" ? "task-name--completed" : ""}>{task.title}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
