import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { UserRO } from './dto/user.dto';
import { IdeaEntity } from 'src/idea/idea.entity';

@Entity('user')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdon: Date;

  @Column({
    type: 'text',
    unique: true,
  })
  username: string;

  @Column('text')
  password: string;

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }

  @OneToMany(() => IdeaEntity, (idea) => idea.author)
  ideas: Array<IdeaEntity>;

  @ManyToMany(() => IdeaEntity, { cascade: true })
  @JoinTable()
  bookmarks: Array<IdeaEntity>;

  async comparePassword(attempt: string) {
    return await bcrypt.compare(attempt, this.password);
  }

  toResponseObject(showToken: boolean = false): UserRO {
    const { id, username, createdon, token } = this;

    const responseObject: any = { id, username, createdon };

    if (showToken) responseObject.token = token;
    if (this.ideas) responseObject.ideas = this.ideas;
    if (this.bookmarks) responseObject.bookmarks = this.bookmarks;

    return responseObject;
  }

  private get token() {
    const { id, username } = this;
    return jwt.sign({ id, username }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });
  }
}
