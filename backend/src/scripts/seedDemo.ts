import { ProjectStatus, TaskStatus, Tier } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { isSupabaseConfigured, supabaseAdmin } from '../lib/supabase.js';
import { logger } from '../lib/logger.js';

interface DemoTask {
  name: string;
  deadline: Date;
  assigneeName: string | null;
  status?: TaskStatus;
}

interface DemoProject {
  name: string;
  description: string;
  deadline: Date;
  milestone: {
    name: string;
    deadline: Date;
  } | null;
  tasks: DemoTask[];
}

const demoEmail = 'demo@kepiton.com';
const demoPassword = process.env.DEMO_USER_PASSWORD;
const frontendUrl = process.env.FRONTEND_URL ?? 'https://kepiton.onrender.com';

const demoProjects: DemoProject[] = [
  {
    name: 'Campaign Tết Nguyên Đán 2026',
    description: 'Chiến dịch marketing chào xuân, deadline 15/01/2026',
    deadline: new Date('2026-01-15T17:00:00+07:00'),
    milestone: {
      name: 'Hoàn thành creative assets',
      deadline: new Date('2025-12-31T17:00:00+07:00'),
    },
    tasks: [
      {
        name: 'Thiết kế banner chính',
        deadline: new Date('2025-12-15T17:00:00+07:00'),
        assigneeName: 'Nguyễn Thị A',
      },
      {
        name: 'Viết copy cho Facebook ads',
        deadline: new Date('2025-12-20T17:00:00+07:00'),
        assigneeName: 'Trần Văn B',
      },
      {
        name: 'Duyệt nội dung với sếp',
        deadline: new Date('2025-12-25T17:00:00+07:00'),
        assigneeName: null,
      },
      {
        name: 'Chạy test A/B landing page',
        deadline: new Date('2026-01-05T17:00:00+07:00'),
        assigneeName: 'Nguyễn Thị A',
      },
    ],
  },
  {
    name: 'Ra mắt tính năng mới Q1/2026',
    description: 'Release tính năng AI gợi ý task, target Q1/2026',
    deadline: new Date('2026-03-31T17:00:00+07:00'),
    milestone: null,
    tasks: [
      {
        name: 'Viết PRD tính năng AI suggest',
        deadline: new Date('2026-01-15T17:00:00+07:00'),
        assigneeName: 'PM Team',
      },
      {
        name: 'Design UI màn hình gợi ý',
        deadline: new Date('2026-02-01T17:00:00+07:00'),
        assigneeName: 'Lê Thị C',
      },
      {
        name: 'Backend API gợi ý task',
        deadline: new Date('2026-02-28T17:00:00+07:00'),
        assigneeName: 'Dev Team',
      },
    ],
  },
  {
    name: 'Báo cáo tài chính Q4/2025',
    description: 'Tổng hợp và nộp báo cáo tài chính cuối năm',
    deadline: new Date('2026-01-31T17:00:00+07:00'),
    milestone: {
      name: 'Xong phần số liệu thô',
      deadline: new Date('2026-01-10T17:00:00+07:00'),
    },
    tasks: [
      {
        name: 'Tổng hợp doanh thu tháng 10',
        deadline: new Date('2025-11-05T17:00:00+07:00'),
        assigneeName: 'Phòng kế toán',
        status: TaskStatus.COMPLETED,
      },
      {
        name: 'Tổng hợp doanh thu tháng 11',
        deadline: new Date('2025-12-05T17:00:00+07:00'),
        assigneeName: 'Phòng kế toán',
        status: TaskStatus.COMPLETED,
      },
      {
        name: 'Tổng hợp doanh thu tháng 12',
        deadline: new Date('2026-01-05T17:00:00+07:00'),
        assigneeName: 'Phòng kế toán',
      },
      {
        name: 'Kiểm toán nội bộ',
        deadline: new Date('2026-01-20T17:00:00+07:00'),
        assigneeName: 'Giám đốc tài chính',
      },
    ],
  },
];

async function findExistingAuthUserId() {
  const { data, error } = await supabaseAdmin.auth.admin.listUsers();
  if (error) {
    throw new Error('DEMO_LIST_USERS_FAILED');
  }

  return data.users.find((user) => user.email === demoEmail)?.id ?? null;
}

async function ensureDemoAuthUser() {
  if (!isSupabaseConfigured()) {
    throw new Error('SUPABASE_NOT_CONFIGURED');
  }

  if (!demoPassword) {
    throw new Error('DEMO_USER_PASSWORD_REQUIRED');
  }

  const existingUserId = await findExistingAuthUserId();
  if (existingUserId) {
    await supabaseAdmin.auth.admin.updateUserById(existingUserId, {
      password: demoPassword,
      email_confirm: true,
    });
    return existingUserId;
  }

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: demoEmail,
    password: demoPassword,
    email_confirm: true,
  });

  if (error || !data.user) {
    throw new Error('DEMO_CREATE_AUTH_USER_FAILED');
  }

  return data.user.id;
}

async function seedDemoData() {
  const demoUserId = await ensureDemoAuthUser();

  await prisma.user.upsert({
    where: { id: demoUserId },
    create: {
      id: demoUserId,
      email: demoEmail,
      tier: Tier.PRO,
      timezone: 'Asia/Ho_Chi_Minh',
    },
    update: {
      email: demoEmail,
      tier: Tier.PRO,
      timezone: 'Asia/Ho_Chi_Minh',
    },
  });

  await prisma.project.deleteMany({
    where: {
      userId: demoUserId,
      name: { in: demoProjects.map((project) => project.name) },
    },
  });

  let campaignProjectId: string | null = null;

  for (const project of demoProjects) {
    const createdProject = await prisma.project.create({
      data: {
        user: { connect: { id: demoUserId } },
        name: project.name,
        description: project.description,
        deadline: project.deadline,
        status: ProjectStatus.ACTIVE,
        ...(project.milestone
          ? {
              milestone: {
                create: {
                  name: project.milestone.name,
                  deadline: project.milestone.deadline,
                },
              },
            }
          : {}),
      },
      include: { milestone: true },
    });

    if (project.name === 'Campaign Tết Nguyên Đán 2026') {
      campaignProjectId = createdProject.id;
    }

    await prisma.task.createMany({
      data: project.tasks.map((task) => ({
        projectId: createdProject.id,
        milestoneId: createdProject.milestone?.id ?? null,
        name: task.name,
        deadline: task.deadline,
        assigneeName: task.assigneeName,
        status: task.status ?? TaskStatus.ACTIVE,
      })),
    });
  }

  if (!campaignProjectId) {
    throw new Error('DEMO_CAMPAIGN_PROJECT_NOT_CREATED');
  }

  const shareLink = await prisma.shareLink.create({
    data: {
      projectId: campaignProjectId,
      expiresAt: new Date('2027-12-31T23:59:59+07:00'),
    },
  });

  logger.info('Đã tạo dữ liệu demo Kepiton.');
  logger.info(`Tài khoản demo: ${demoEmail}`);
  logger.info(`Share link demo: ${frontendUrl}/share/${shareLink.id}`);
}

seedDemoData()
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : 'UNKNOWN_DEMO_SEED_ERROR';
    logger.error(`Không thể seed dữ liệu demo: ${message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
