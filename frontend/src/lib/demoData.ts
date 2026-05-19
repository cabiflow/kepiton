import type { AuthUser } from '../store/authStore';
import type { ProjectSummary } from '../store/projectStore';
import type { TaskItem } from '../components/task/TaskRow';

export interface DemoMilestone {
  id: string;
  name: string;
  deadline: string;
}

export interface DemoProjectDetail extends ProjectSummary {
  milestone: DemoMilestone | null;
  tasks: TaskItem[];
}

const now = new Date();
const createdAt = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

function daysFromNow(days: number) {
  return new Date(now.getTime() + days * 24 * 60 * 60 * 1000).toISOString();
}

function daysAgo(days: number) {
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString();
}

export const demoUser: AuthUser = {
  id: 'demo-user',
  email: 'demo@kepiton.com',
  tier: 'PRO',
  isAdmin: true,
  timezone: 'Asia/Ho_Chi_Minh',
  uploadCount: 0,
  remindAt7Days: true,
  remindAt3Days: true,
  remindAt1Day: true,
  remindAtDeadline: true,
  dailyDigest: true,
  darkMode: false,
};

export const demoProjects: DemoProjectDetail[] = [
  {
    id: 'demo-project-1',
    name: 'Campaign Tết Nguyên Đán 2026',
    description: 'Chiến dịch marketing chào xuân, theo dõi toàn bộ creative và media plan.',
    deadline: daysFromNow(18),
    createdAt,
    milestone: {
      id: 'demo-milestone-1',
      name: 'Hoàn thành creative assets',
      deadline: daysFromNow(9),
    },
    tasks: [
      {
        id: 'demo-task-1',
        name: 'Thiết kế banner chính',
        deadline: daysFromNow(3),
        assigneeName: 'Nguyễn Thị A',
        status: 'ACTIVE',
        milestoneId: 'demo-milestone-1',
      },
      {
        id: 'demo-task-2',
        name: 'Viết copy cho Facebook ads',
        deadline: daysFromNow(5),
        assigneeName: 'Trần Văn B',
        status: 'ACTIVE',
        milestoneId: 'demo-milestone-1',
      },
      {
        id: 'demo-task-3',
        name: 'Duyệt nội dung với sếp',
        deadline: daysAgo(1),
        assigneeName: null,
        status: 'OVERDUE',
        milestoneId: 'demo-milestone-1',
      },
      {
        id: 'demo-task-4',
        name: 'Tổng hợp media plan',
        deadline: daysAgo(2),
        assigneeName: 'Media Team',
        status: 'COMPLETED',
        milestoneId: null,
      },
    ],
  },
  {
    id: 'demo-project-2',
    name: 'Ra mắt tính năng mới Q1/2026',
    description: 'Theo dõi roadmap ra mắt tính năng AI gợi ý task.',
    deadline: daysFromNow(45),
    createdAt,
    milestone: null,
    tasks: [
      {
        id: 'demo-task-5',
        name: 'Viết PRD tính năng AI suggest',
        deadline: daysFromNow(12),
        assigneeName: 'PM Team',
        status: 'ACTIVE',
        milestoneId: null,
      },
    ],
  },
];

export function getDemoProjectSummaries(): ProjectSummary[] {
  return demoProjects.map(({ createdAt: projectCreatedAt, deadline, description, id, name }) => ({
    id,
    name,
    description,
    deadline,
    createdAt: projectCreatedAt,
  }));
}

export function getDemoProjectDetail(projectId: string) {
  return demoProjects.find((project) => project.id === projectId) ?? null;
}
