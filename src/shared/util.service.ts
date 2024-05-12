import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UtilService {
  constructor(private configService: ConfigService) {}

  get secret(): string {
    return this.configService.get('JWT_SECRET');
  }
}
