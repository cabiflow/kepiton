import Anthropic from '@anthropic-ai/sdk';
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

const parsedTasksSchema = z.array(parsedTaskSchema);

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function parseFileWithClaude(fileContent: string): Promise<ParsedTask[]> {
  const message = await anthropic.messages.create({
    model: 'claude-opus-4-5',
    max_tokens: 4096,
    messages: [
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

  const responseText = message.content
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('');

  if (!responseText) {
    throw new Error('CLAUDE_EMPTY_RESPONSE');
  }

  return parsedTasksSchema.parse(JSON.parse(responseText));
}
