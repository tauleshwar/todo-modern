export type TaskStatus = "IN_PROGRESS" | "COMPLETED";

export type ApiTask = {
  id: string;
  title: string;
  description: string | null;
  startAt: string;
  endAt: string;
  status: TaskStatus;
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

export type TasksResponse = {
  tasks: ApiTask[];
  weeks: WeekGroup[];
  total: number;
};
