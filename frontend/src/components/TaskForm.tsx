import { format, parseISO } from "date-fns";
import { CalendarDays, Clock3, X } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
export type TaskFormValues = {
  title: string;
  description: string;
  startAt: string;
  endAt: string;
};

type FormInputs = {
  title: string;
  description: string;
  dueDate: string;
  startTime: string;
  endTime: string;
};

type TaskFormProps = {
  mode: "create" | "edit";
  initialValues: Partial<TaskFormValues>;
  onCancel: () => void;
  onSubmit: (values: TaskFormValues) => Promise<void>;
  isSubmitting: boolean;
};

function toDateTimeLocal(value: string | undefined) {
  if (!value) return "";
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 16);
}

function valuesFrom(initialValues: Partial<TaskFormValues>): FormInputs {
  const localStart = toDateTimeLocal(initialValues.startAt);
  const localEnd = toDateTimeLocal(initialValues.endAt);
  return {
    title: initialValues.title ?? "",
    description: initialValues.description ?? "",
    dueDate: localStart.slice(0, 10),
    startTime: localStart.slice(11, 16),
    endTime: localEnd.slice(11, 16),
  };
}

export function TaskForm({ mode, initialValues, onCancel, onSubmit, isSubmitting }: TaskFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormInputs>({ defaultValues: valuesFrom(initialValues) });
  const selectedDate = watch("dueDate");
  const dueDateField = register("dueDate", { required: "A date is required" });

  useEffect(() => {
    reset(valuesFrom(initialValues));
  }, [initialValues, reset]);

  return (
    <form
      onSubmit={handleSubmit((values) =>
        onSubmit({
          title: values.title,
          description: values.description,
          startAt: `${values.dueDate}T${values.startTime}`,
          endAt: `${values.dueDate}T${values.endTime}`,
        }),
      )}
      className="task-sheet"
      aria-label={`${mode === "create" ? "Create" : "Edit"} task`}
    >
      <div className="task-sheet__header">
        <h2 id="task-form-heading">{mode === "create" ? "Add New Task" : "Edit Task"}</h2>
        <button type="button" onClick={onCancel} className="icon-button" aria-label="Close task form" disabled={isSubmitting}>
          <X className="h-5 w-5" strokeWidth={1.8} />
        </button>
      </div>

      <label className="form-field">
        <span>Task title</span>
        <input
          autoFocus
          {...register("title", { required: "A task title is required" })}
          placeholder="Doing Homework"
          className="field-control"
        />
        {errors.title ? <small className="field-error">{errors.title.message}</small> : null}
      </label>

      <div className="form-field">
        <span>Set time</span>
        <div className="time-fields">
          <label className="field-control field-control--icon"><Clock3 className="h-4 w-4" strokeWidth={1.7} /><input type="time" aria-label="Start time" {...register("startTime", { required: "A start time is required" })} onClick={(event) => event.currentTarget.showPicker?.()} /></label>
          <label className="field-control field-control--icon"><Clock3 className="h-4 w-4" strokeWidth={1.7} /><input type="time" aria-label="End time" {...register("endTime", { required: "An end time is required" })} onClick={(event) => event.currentTarget.showPicker?.()} /></label>
        </div>
        {errors.startTime ? <small className="field-error">{errors.startTime.message}</small> : null}
        {errors.endTime ? <small className="field-error">{errors.endTime.message}</small> : null}
      </div>

      <div className="form-field">
        <span>Set date</span>
        <label className="field-control field-control--date">
          <span className={selectedDate ? "date-value" : "date-value date-value--empty"}>
            {selectedDate ? format(parseISO(selectedDate), "EEEE d, MMMM") : "Select date"}
          </span>
          <CalendarDays className="h-4 w-4" strokeWidth={1.7} />
          <input
            {...dueDateField}
            type="date"
            aria-label="Task date"
            onClick={(event) => event.currentTarget.showPicker?.()}
          />
        </label>
        {errors.dueDate ? <small className="field-error">{errors.dueDate.message}</small> : null}
      </div>

      <label className="form-field">
        <span>Description <em>optional</em></span>
        <textarea {...register("description")} rows={4} placeholder="Add description" className="field-control field-control--textarea" />
      </label>

      <button type="submit" disabled={isSubmitting} className="primary-button task-sheet__submit">
        {isSubmitting ? "Saving…" : mode === "create" ? "Create task" : "Save changes"}
      </button>
    </form>
  );
}
