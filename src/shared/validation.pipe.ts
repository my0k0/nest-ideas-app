import {
  ArgumentMetadata,
  HttpException,
  HttpStatus,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';

@Injectable()
export class ValidationPipe implements PipeTransform {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (value instanceof Object && this.isEmpty(value))
      throw new HttpException(
        'Validation failed: No body submitted',
        HttpStatus.BAD_REQUEST,
      );

    if (!metatype || !this.toValidate(metatype)) return value;

    const object = plainToClass(metatype, value);
    const errors = await validate(object);

    if (errors.length > 0)
      throw new HttpException(
        `Validation failed. ${this.formatErrors(errors)}`,
        HttpStatus.BAD_REQUEST,
      );

    return value;
  }

  private toValidate(meta: any) {
    const types = [String, Number, Boolean, Array, Object];
    return !types.includes(meta);
  }

  private isEmpty(value: any) {
    if (Object.keys(value).length > 0) return false;
    return true;
  }

  private formatErrors(errors: any[]) {
    return errors
      .map((error) => {
        for (const property in error.constraints)
          return error.constraints[property];
      })
      .join(', ');
  }
}
