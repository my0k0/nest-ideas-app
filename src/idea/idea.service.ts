import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IdeaEntity } from './idea.entity';
import { Repository } from 'typeorm';
import { IdeaDto, IdeaRO } from './dto/idea.dto';
import { UserEntity } from 'src/user/user.entity';
import { Votes } from '../shared/votes.enum';

@Injectable()
export class IdeaService {
  constructor(
    @InjectRepository(IdeaEntity)
    private ideaRepository: Repository<IdeaEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  async showAll(): Promise<Array<IdeaRO>> {
    const ideas = await this.ideaRepository.find({
      relations: ['author', 'upvotes', 'downvotes'],
    });
    return ideas.map((idea) => this.toResponseObject(idea));
  }

  async read(id: string): Promise<IdeaRO> {
    const idea = await this.ideaRepository.findOne({
      where: { id },
      relations: ['author', 'upvotes', 'downvotes'],
    });

    if (!idea) throw new HttpException('Not found', HttpStatus.NOT_FOUND);

    return this.toResponseObject(idea);
  }

  async create(data: IdeaDto, userId: string): Promise<IdeaRO> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    const idea = this.ideaRepository.create({ ...data, author: user });
    await this.ideaRepository.save(idea);

    return this.toResponseObject(idea);
  }

  async update(
    id: string,
    data: Partial<IdeaDto>,
    userId: string,
  ): Promise<IdeaRO> {
    let idea = await this.ideaRepository.findOne({
      where: { id },
      relations: ['author'],
    });
    if (!idea) throw new HttpException('Not found', HttpStatus.NOT_FOUND);

    this.ensureOwnership(idea, userId);
    await this.ideaRepository.update({ id }, data);
    idea = await this.ideaRepository.findOne({
      where: { id },
      relations: ['author', 'upvotes', 'downvotes'],
    });

    return this.toResponseObject(idea);
  }

  async destroy(id: string, userId: string) {
    const idea = await this.ideaRepository.findOne({
      where: { id },
      relations: ['author', 'upvotes', 'downvotes'],
    });
    if (!idea) throw new HttpException('Not found', HttpStatus.NOT_FOUND);

    this.ensureOwnership(idea, userId);
    await this.ideaRepository.remove(idea);
    return this.toResponseObject(idea);
  }

  async bookmark(id: string, userId: string) {
    const idea = await this.ideaRepository.findOne({ where: { id } });
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['bookmarks'],
    });

    const bookmarks = user.bookmarks.filter(
      (bookmark) => bookmark.id === idea.id,
    );
    if (bookmarks.length > 0) {
      throw new HttpException(
        'Idea already bookmarked',
        HttpStatus.BAD_REQUEST,
      );
    }

    user.bookmarks.push(idea);
    await this.userRepository.save(user);

    return user.toResponseObject();
  }

  async unbookmark(id: string, userId: string) {
    const idea = await this.ideaRepository.findOne({ where: { id } });
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['bookmarks'],
    });

    const bookmarks = user.bookmarks.filter(
      (bookmark) => bookmark.id === idea.id,
    );

    if (bookmarks.length < 1) {
      throw new HttpException(
        'Idea was not bookmarked',
        HttpStatus.BAD_REQUEST,
      );
    }

    user.bookmarks = user.bookmarks.filter(
      (bookmark) => bookmark.id !== idea.id,
    );
    await this.userRepository.save(user);

    return user.toResponseObject();
  }

  async upvote(id: string, userId: string) {
    let idea = await this.ideaRepository.findOne({
      where: { id },
      relations: ['author', 'upvotes', 'downvotes'],
    });
    const user = await this.userRepository.findOne({ where: { id: userId } });

    idea = await this.vote(idea, user, Votes.UP);

    return this.toResponseObject(idea);
  }

  async downvote(id: string, userId: string) {
    let idea = await this.ideaRepository.findOne({
      where: { id },
      relations: ['author', 'upvotes', 'downvotes'],
    });
    const user = await this.userRepository.findOne({ where: { id: userId } });

    idea = await this.vote(idea, user, Votes.DOWN);

    return this.toResponseObject(idea);
  }

  private toResponseObject(idea: IdeaEntity, showToken: boolean = false) {
    const responseObject: any = {
      ...idea,
      author: idea.author.toResponseObject(showToken),
    };

    if (idea.upvotes) responseObject.upvotes = idea.upvotes.length;
    if (idea.downvotes) responseObject.downvotes = idea.downvotes.length;

    return responseObject;
  }

  private ensureOwnership(idea: IdeaEntity, userId: string) {
    if (idea.author.id !== userId)
      throw new HttpException('Incorrect user', HttpStatus.UNAUTHORIZED);
  }

  private async vote(idea: IdeaEntity, user: UserEntity, vote: Votes) {
    const opposite = vote === Votes.UP ? Votes.DOWN : Votes.UP;

    const votes = idea[vote].filter((voter) => voter.id === user.id);
    const opposites = idea[opposite].filter((voter) => voter.id === user.id);

    if (opposites.length > 0 || votes.length > 0) {
      idea[opposite] = idea[opposite].filter((voter) => voter.id !== user.id);
      idea[vote] = idea[vote].filter((voter) => voter.id !== user.id);

      await this.ideaRepository.save(idea);
    } else if (votes.length < 1) {
      idea[vote].push(user);

      this.ideaRepository.save(idea);
    } else {
      throw new HttpException('Unable to cast vote', HttpStatus.BAD_REQUEST);
    }

    return idea;
  }
}
