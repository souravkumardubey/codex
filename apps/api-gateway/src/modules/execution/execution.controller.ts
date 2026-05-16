import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ExecutionService } from './execution.service';
import { CreateExecutionDto } from './dto/execution.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('executions')
export class ExecutionController {
  constructor(private executionService: ExecutionService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateExecutionDto,
  ) {
    return this.executionService.createExecution(userId, dto);
  }

  @Post('anonymous')
  async createAnonymous(@Body() dto: CreateExecutionDto) {
    return this.executionService.createExecution(undefined, dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getAll(
    @CurrentUser('id') userId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.executionService.getExecutions(userId, page, limit);
  }

  @Get('all')
  async getAllExecutions(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.executionService.getExecutions(undefined, page, limit);
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.executionService.getExecutionById(id);
  }

  @Post('challenge/:challengeId')
  @UseGuards(JwtAuthGuard)
  async submitChallenge(
    @CurrentUser('id') userId: string,
    @Param('challengeId') challengeId: string,
    @Body() dto: CreateExecutionDto,
  ) {
    return this.executionService.submitWithTestCases(userId, challengeId, dto);
  }

  @Get('metrics/summary')
  async getMetrics() {
    return this.executionService.getExecutionMetrics();
  }
}
