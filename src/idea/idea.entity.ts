import { CommentEntity } from 'src/comment/comment.entity';
import { UserEntity } from 'src/user/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('idea')
export class IdeaEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdon: Date;

  @UpdateDateColumn()
  updatedon: Date;

  @Column('text')
  idea: string;

  @Column('text')
  description: string;

  @ManyToOne(() => UserEntity, (author) => author.ideas)
  author: UserEntity;

  @ManyToMany(() => UserEntity, { cascade: true })
  @JoinTable()
  upvotes: Array<UserEntity>;

  @ManyToMany(() => UserEntity, { cascade: true })
  @JoinTable()
  downvotes: Array<UserEntity>;

  @OneToMany(() => CommentEntity, (comment) => comment.idea, { cascade: true })
  comments: Array<CommentEntity>;
}
