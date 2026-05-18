import { EntityType, ProjectStatus, TaskStatus } from '@prisma/client';
import { logger } from '../lib/logger.js';
import { prisma } from '../lib/prisma.js';
import { sendEmail } from './emailService.js';

const ONE_HOUR_MS = 60 * 60 * 1000;
const ONE_DAY_MS = 24 * ONE_HOUR_MS;

interface ReminderCandidate {
  entityType: EntityType;
  entityId: string;
  name: string;
  deadline: Date;
  user: {
    id: string;
    email: string;
    remindAt7Days: boolean;
    remindAt3Days: boolean;
    remindAt1Day: boolean;
    remindAtDeadline: boolean;
  };
}

interface ReminderRule {
  key: string;
  label: string;
  maxRemainingMs: number;
  isEnabled: (candidate: ReminderCandidate) => boolean;
}

const reminderRules: ReminderRule[] = [
  {
    key: 'deadline',
    label: 'đến hạn',
    maxRemainingMs: 0,
    isEnabled: (candidate) => candidate.user.remindAtDeadline,
  },
  {
    key: '1-day',
    label: 'còn 1 ngày',
    maxRemainingMs: ONE_DAY_MS,
    isEnabled: (candidate) => candidate.user.remindAt1Day,
  },
  {
    key: '3-days',
    label: 'còn 3 ngày',
    maxRemainingMs: 3 * ONE_DAY_MS,
    isEnabled: (candidate) => candidate.user.remindAt3Days,
  },
  {
    key: '7-days',
    label: 'còn 7 ngày',
    maxRemainingMs: 7 * ONE_DAY_MS,
    isEnabled: (candidate) => candidate.user.remindAt7Days,
  },
];

function getReminderRule(candidate: ReminderCandidate, now: Date) {
  const remainingMs = candidate.deadline.getTime() - now.getTime();

  if (remainingMs <= 0 && remainingMs >= -ONE_DAY_MS) {
    return reminderRules.find((rule) => rule.key === 'deadline' && rule.isEnabled(candidate));
  }

  if (remainingMs < 0) {
    return undefined;
  }

  return reminderRules.find(
    (rule) =>
      rule.key !== 'deadline' && remainingMs <= rule.maxRemainingMs && rule.isEnabled(candidate),
  );
}

function getReminderKey(candidate: ReminderCandidate, rule: ReminderRule) {
  const deadlineDate = candidate.deadline.toISOString().slice(0, 10);
  return `${rule.key}:${deadlineDate}`;
}

function formatDeadline(deadline: Date) {
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Ho_Chi_Minh',
  }).format(deadline);
}

function buildReminderEmail(candidate: ReminderCandidate, rule: ReminderRule) {
  const title = `Kepiton nhắc deadline: ${candidate.name}`;
  const deadline = formatDeadline(candidate.deadline);
  const html = `
    <div style="font-family: Arial, sans-serif; color: #1e293b; line-height: 1.6;">
      <h1 style="font-size: 20px;">${title}</h1>
      <p>Deadline <strong>${candidate.name}</strong> hiện đang ${rule.label}.</p>
      <p>Thời hạn: <strong>${deadline}</strong></p>
      <p>Hãy mở Kepiton để kiểm tra và cập nhật tiến độ.</p>
    </div>
  `;

  return {
    subject: title,
    html,
  };
}

async function collectReminderCandidates(now: Date): Promise<ReminderCandidate[]> {
  const maxDeadline = new Date(now.getTime() + 7 * ONE_DAY_MS);
  const minDeadline = new Date(now.getTime() - ONE_DAY_MS);

  const [projects, tasks] = await Promise.all([
    prisma.project.findMany({
      where: {
        status: ProjectStatus.ACTIVE,
        deadline: {
          gte: minDeadline,
          lte: maxDeadline,
        },
      },
      select: {
        id: true,
        name: true,
        deadline: true,
        user: {
          select: {
            id: true,
            email: true,
            remindAt7Days: true,
            remindAt3Days: true,
            remindAt1Day: true,
            remindAtDeadline: true,
          },
        },
      },
    }),
    prisma.task.findMany({
      where: {
        status: TaskStatus.ACTIVE,
        deadline: {
          gte: minDeadline,
          lte: maxDeadline,
        },
        project: {
          status: ProjectStatus.ACTIVE,
        },
      },
      select: {
        id: true,
        name: true,
        deadline: true,
        project: {
          select: {
            user: {
              select: {
                id: true,
                email: true,
                remindAt7Days: true,
                remindAt3Days: true,
                remindAt1Day: true,
                remindAtDeadline: true,
              },
            },
          },
        },
      },
    }),
  ]);

  return [
    ...projects.map((project) => ({
      entityType: EntityType.PROJECT,
      entityId: project.id,
      name: project.name,
      deadline: project.deadline,
      user: project.user,
    })),
    ...tasks.map((task) => ({
      entityType: EntityType.TASK,
      entityId: task.id,
      name: task.name,
      deadline: task.deadline,
      user: task.project.user,
    })),
  ];
}

export async function runReminderJob(now = new Date()) {
  const candidates = await collectReminderCandidates(now);

  for (const candidate of candidates) {
    const rule = getReminderRule(candidate, now);
    if (!rule) {
      continue;
    }

    const reminderKey = getReminderKey(candidate, rule);
    const existingLog = await prisma.reminderLog.findUnique({
      where: {
        userId_entityType_entityId_reminderKey: {
          userId: candidate.user.id,
          entityType: candidate.entityType,
          entityId: candidate.entityId,
          reminderKey,
        },
      },
      select: { id: true },
    });

    if (existingLog) {
      continue;
    }

    const email = buildReminderEmail(candidate, rule);
    await sendEmail({
      to: candidate.user.email,
      subject: email.subject,
      html: email.html,
    });

    await prisma.reminderLog.create({
      data: {
        userId: candidate.user.id,
        entityType: candidate.entityType,
        entityId: candidate.entityId,
        reminderKey,
      },
    });
  }
}

export function startReminderJob() {
  if (process.env.ENABLE_REMINDER_JOB === 'false') {
    logger.info('Reminder job is disabled');
    return;
  }

  logger.info('Reminder job is ready');
  const run = async () => {
    try {
      await runReminderJob();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể chạy email reminder.';
      logger.error(message);
    }
  };

  void run();
  globalThis.setInterval(() => {
    void run();
  }, ONE_HOUR_MS);
}
