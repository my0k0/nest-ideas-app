import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';

@Catch(HttpException)
export class HttpErrorFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest();
    const res = ctx.getResponse();
    const status = exception.getStatus();

    const errorRespObject = {
      code: status,
      timestamp: new Date().toISOString(),
      path: req.url,
      method: req.method,
      message: exception.message,
    };

    res.status(status).json(errorRespObject);
  }
}
