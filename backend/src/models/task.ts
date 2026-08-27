import { InferSchemaType, Model, Schema, model, models } from "mongoose";

const taskSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 140 },
    description: { type: String, default: null, maxlength: 2000 },
    startAt: { type: Date, index: true },
    endAt: { type: Date },
    dueAt: { type: Date },
    status: { type: String, enum: ["IN_PROGRESS", "COMPLETED"], default: "IN_PROGRESS", index: true },
  },
  { timestamps: true, versionKey: false },
);

taskSchema.index({ title: 1 });

export type TaskRecord = InferSchemaType<typeof taskSchema>;
export const Task: Model<TaskRecord> = (models.Task as Model<TaskRecord>) ?? model<TaskRecord>("Task", taskSchema);
