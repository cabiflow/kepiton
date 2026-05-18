import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { ZodError } from 'zod';

export function notImplemented(_request: Request, response: Response) {
  response.status(501).json({
    error: 'Tính năng này chưa được bật trong Sprint hiện tại.',
    code: 'NOT_IMPLEMENTED',
  });
}

export function asyncHandler(handler: RequestHandler): RequestHandler {
  return (request: Request, response: Response, next: NextFunction) => {
    Promise.resolve(handler(request, response, next)).catch(next);
  };
}

export function sendError(response: Response, status: number, error: string, code?: string) {
  response.status(status).json(code ? { error, code } : { error });
}

export function handleRouteError(error: unknown, response: Response) {
  if (error instanceof ZodError) {
    sendError(response, 400, 'Dữ liệu gửi lên chưa đúng, vui lòng kiểm tra lại.', 'VALIDATION_ERROR');
    return;
  }

  sendError(response, 500, 'Hệ thống đang gặp lỗi, vui lòng thử lại sau.', 'SERVER_ERROR');
}
