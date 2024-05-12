import { IsNotEmpty, IsString } from 'class-validator';
import { UserRO } from 'src/user/dto/user.dto';

export class IdeaDto {
  @IsString()
  @IsNotEmpty()
  readonly idea: string;

  @IsString()
  @IsNotEmpty()
  readonly description: string;
}

export class IdeaRO {
  readonly author: UserRO;
  readonly id: string;
  readonly createdon: Date;
  readonly updatedon: Date;
  readonly idea: string;
  readonly description: string;
  readonly upvotes?: number;
  readonly downvotes?: number;
}
