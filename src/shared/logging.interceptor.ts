import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    const req = context.switchToHttp().getRequest();

    return next
      .handle()
      .pipe(
        tap(() =>
          Logger.log(
            `${req.method} ${req.url} ${Date.now() - now}ms`,
            context.getClass().name,
          ),
        ),
      );
  }
}
