import { IsNotEmpty } from 'class-validator';
import { IdeaRO } from 'src/idea/dto/idea.dto';

export class UserDto {
  @IsNotEmpty()
  readonly username: string;

  @IsNotEmpty()
  readonly password: string;
}

export class UserRO {
  readonly id: string;
  readonly username: string;
  readonly createdon: Date;
  readonly token?: string;
  readonly ideas?: Array<IdeaRO>;
  readonly bookmarks?: Array<IdeaRO>;
}
