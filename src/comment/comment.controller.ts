import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { AuthGuard } from 'src/shared/auth.guard';
import { ValidationPipe } from 'src/shared/validation.pipe';
import { CommentDto } from './dto/comment.dto';
import { User } from 'src/user/user.decorator';

@Controller('api/comments')
export class CommentController {
  constructor(private commentService: CommentService) {}

  @Get('idea/:id')
  showCommentsByIdea(@Param('id') idea: string) {
    return this.commentService.showByIdea(idea);
  }

  @Get('user/:id')
  showCommentsByUser(@Param('id') user: string) {
    return this.commentService.showByUser(user);
  }

  @Post('idea/:id')
  @UseGuards(AuthGuard)
  @UsePipes(ValidationPipe)
  createComment(
    @Param('id') idea: string,
    @User('id') user: string,
    @Body() comment: CommentDto,
  ) {
    return this.commentService.create(idea, user, comment);
  }

  @Get(':id')
  showComment(@Param('id') id: string) {
    return this.commentService.show(id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  destroyComment(@Param('id') id: string, @User('id') user: string) {
    return this.commentService.destory(id, user);
  }
}
