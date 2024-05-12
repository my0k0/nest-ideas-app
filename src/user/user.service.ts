import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';
import { Repository } from 'typeorm';
import { UserDto } from './dto/user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  async showAll() {
    const users = await this.userRepository.find({
      relations: ['ideas', 'bookmarks'],
    });

    return users.map((user) => user.toResponseObject());
  }

  async read(username: string) {
    const user = await this.userRepository.findOne({
      where: { username },
      relations: ['ideas', 'bookmarks'],
    });
    if (!user) throw new HttpException('Not found', HttpStatus.NOT_FOUND);

    return user;
  }

  async login(data: UserDto) {
    const { username, password } = data;
    const user = await this.userRepository.findOne({
      where: { username },
    });

    if (!user || !(await user.comparePassword(password)))
      throw new HttpException(
        'Invalid username/password',
        HttpStatus.BAD_REQUEST,
      );

    return user.toResponseObject(true);
  }

  async register(data: UserDto) {
    const { username } = data;

    let user = await this.userRepository.findOne({ where: { username } });

    if (user)
      throw new HttpException('User already exists', HttpStatus.BAD_REQUEST);

    user = this.userRepository.create(data);
    await this.userRepository.save(user);

    return user.toResponseObject();
  }
}
