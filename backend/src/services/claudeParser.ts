import OpenAI from 'openai';

export interface ParsedTask {
  ten_task: string;
  deadline: string | null;
  nguoi_phu_trach: string | null;
}

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
          'Bạn là trợ lý đọc file kế hoạch công việc. Chỉ trả về JSON array hợp lệ, không kèm giải thích.',
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
  });

  const content = response.choices[0]?.message.content;

  if (!content) {
    throw new Error('OPENAI_EMPTY_RESPONSE');
  }

  const parsed = JSON.parse(content) as unknown;

  if (Array.isArray(parsed)) {
    return parsed.filter(isParsedTask);
  }

  if (isTaskObject(parsed)) {
    return parsed.tasks.filter(isParsedTask);
  }

  return [];
}

function isTaskObject(value: unknown): value is { tasks: unknown[] } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'tasks' in value &&
    Array.isArray((value as { tasks: unknown }).tasks)
  );
}

function isParsedTask(value: unknown): value is ParsedTask {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const task = value as Record<string, unknown>;
  return (
    typeof task.ten_task === 'string' &&
    (typeof task.deadline === 'string' || task.deadline === null) &&
    (typeof task.nguoi_phu_trach === 'string' || task.nguoi_phu_trach === null)
  );
}
