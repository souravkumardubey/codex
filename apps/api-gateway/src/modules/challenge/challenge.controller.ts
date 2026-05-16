import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ChallengeService } from './challenge.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('challenges')
export class ChallengeController {
  constructor(private challengeService: ChallengeService) {}

  @Get()
  async getAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('difficulty') difficulty?: string,
    @Query('tag') tag?: string,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    return this.challengeService.getAllChallenges({
      page,
      limit,
      difficulty,
      tag,
      search,
      sortBy,
      sortOrder,
    });
  }

  @Get('by-id/:id')
  async getById(@Param('id') id: string) {
    return this.challengeService.getChallengeById(id);
  }

  @Get('by-id/:id/submissions')
  async getSubmissions(
    @Param('id') id: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.challengeService.getSubmissions(id, undefined, page, limit);
  }

  @Get('by-id/:id/my-submissions')
  @UseGuards(JwtAuthGuard)
  async getMySubmissions(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.challengeService.getSubmissions(id, userId, page, limit);
  }

  @Get('by-id/:id/leaderboard')
  async getLeaderboard(
    @Param('id') id: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.challengeService.getLeaderboard(id, page, limit);
  }

  @Get(':slug')
  async getBySlug(@Param('slug') slug: string) {
    return this.challengeService.getChallengeBySlug(slug);
  }
}
