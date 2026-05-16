import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@CurrentUser('id') userId: string) {
    return this.userService.getProfile(userId);
  }

  @Get('me/executions')
  @UseGuards(JwtAuthGuard)
  async getExecutions(
    @CurrentUser('id') userId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.userService.getExecutionHistory(userId, page, limit);
  }

  @Get('me/stats')
  @UseGuards(JwtAuthGuard)
  async getStats(@CurrentUser('id') userId: string) {
    return this.userService.getStats(userId);
  }
}
