import { z } from 'zod';

export const authEmailPasswordSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(6),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email(),
});

export const projectCreateSchema = z.object({
  name: z.string().trim().min(1),
  description: z.string().trim().min(1).optional(),
  deadline: z.string().datetime(),
});

export const projectUpdateSchema = z.object({
  name: z.string().trim().min(1).optional(),
  description: z.string().trim().min(1).nullable().optional(),
  deadline: z.string().datetime().optional(),
});

export const milestoneSchema = z.object({
  name: z.string().trim().min(1),
  deadline: z.string().datetime(),
});

export const taskCreateSchema = z.object({
  name: z.string().trim().min(1),
  deadline: z.string().datetime(),
  milestoneId: z.string().uuid().nullable().optional(),
  assigneeName: z.string().trim().min(1).nullable().optional(),
  notes: z.string().trim().min(1).nullable().optional(),
});

export const taskUpdateSchema = z.object({
  name: z.string().trim().min(1).optional(),
  deadline: z.string().datetime().optional(),
  milestoneId: z.string().uuid().nullable().optional(),
  assigneeName: z.string().trim().min(1).nullable().optional(),
  notes: z.string().trim().min(1).nullable().optional(),
});

export function toDate(value: string) {
  return new Date(value);
}
