import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { ValidationPipe } from 'src/shared/validation.pipe';
import { UserDto } from './dto/user.dto';
import { AuthGuard } from 'src/shared/auth.guard';
import { User } from './user.decorator';

@Controller()
export class UserController {
  constructor(private userService: UserService) {}

  @Get('api/users')
  @UseGuards(AuthGuard)
  showAllUsers(@User() user) {
    console.log(user);
    return this.userService.showAll();
  }

  @Post('auth/login')
  login(@Body(ValidationPipe) user: UserDto) {
    return this.userService.login(user);
  }

  @Post('auth/register')
  register(@Body(ValidationPipe) user: UserDto) {
    return this.userService.register(user);
  }
}
