/**
 * Error de aplicación con código HTTP. Los controllers/servicios lanzan
 * instancias de esto y el middleware de errores las traduce a respuestas
 * JSON consistentes.
 */
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code?: string;
  public readonly details?: Record<string, string[]>;

  constructor(
    statusCode: number,
    message: string,
    options?: { code?: string; details?: Record<string, string[]> },
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = options?.code;
    this.details = options?.details;
  }

  static badRequest(message: string, details?: Record<string, string[]>) {
    return new ApiError(400, message, { code: 'BAD_REQUEST', details });
  }
  static unauthorized(message = 'No autorizado') {
    return new ApiError(401, message, { code: 'UNAUTHORIZED' });
  }
  static forbidden(message = 'Prohibido') {
    return new ApiError(403, message, { code: 'FORBIDDEN' });
  }
  static notFound(message = 'No encontrado') {
    return new ApiError(404, message, { code: 'NOT_FOUND' });
  }
  static conflict(message: string) {
    return new ApiError(409, message, { code: 'CONFLICT' });
  }
}
