import OpenAI from 'openai';
import { z } from 'zod';

export interface ParsedTask {
  ten_task: string;
  deadline: string | null;
  nguoi_phu_trach: string | null;
}

const parsedTaskSchema = z.object({
  ten_task: z.string().trim().min(1),
  deadline: z.string().nullable(),
  nguoi_phu_trach: z.string().nullable(),
});

const parsedTasksSchema = z.object({
  tasks: z.array(parsedTaskSchema),
});

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function parsePlanWithOpenAI(fileContent: string): Promise<ParsedTask[]> {
  const response = await client.chat.completions.create({
    model: process.env.OPENAI_IMPORT_MODEL ?? 'gpt-4o',
    messages: [
      {
        role: 'system',
        content:
          'Bạn là trợ lý đọc file kế hoạch công việc. Chỉ trả về JSON object hợp lệ theo schema.',
      },
      {
        role: 'user',
        content: `Bạn là trợ lý đọc file kế hoạch công việc.
Hãy đọc nội dung sau và trích xuất danh sách task theo định dạng JSON.

YÊU CẦU:
- Mỗi task cần có: ten_task (string), deadline (ISO 8601 date string), nguoi_phu_trach (string hoặc null)
- Nếu không tìm thấy deadline rõ ràng, hãy đặt deadline = null
- Nếu không có người phụ trách, đặt nguoi_phu_trach = null
- Chỉ trả về JSON array, không có text khác

Format trả về:
[
  {
    "ten_task": "Tên công việc",
    "deadline": "2025-12-31",
    "nguoi_phu_trach": "Nguyễn Văn A"
  }
]

Nội dung file:
${fileContent}`,
      },
    ],
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'kepiton_import_tasks',
        strict: true,
        schema: {
          type: 'object',
          additionalProperties: false,
          properties: {
            tasks: {
              type: 'array',
              items: {
                type: 'object',
                additionalProperties: false,
                properties: {
                  ten_task: { type: 'string' },
                  deadline: {
                    anyOf: [{ type: 'string' }, { type: 'null' }],
                  },
                  nguoi_phu_trach: {
                    anyOf: [{ type: 'string' }, { type: 'null' }],
                  },
                },
                required: ['ten_task', 'deadline', 'nguoi_phu_trach'],
              },
            },
          },
          required: ['tasks'],
        },
      },
    },
  });

  const content = response.choices[0]?.message.content;

  if (!content) {
    throw new Error('OPENAI_EMPTY_RESPONSE');
  }

  const parsed = parsedTasksSchema.parse(JSON.parse(content));
  return parsed.tasks;
}
