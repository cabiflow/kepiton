import type { Request, Response } from 'express';

export function notImplemented(_request: Request, response: Response) {
  response.status(501).json({
    error: 'Tính năng này chưa được bật trong Sprint hiện tại.',
    code: 'NOT_IMPLEMENTED',
  });
}
