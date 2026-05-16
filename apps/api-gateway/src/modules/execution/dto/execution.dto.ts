import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  ValidateNested,
  MinLength,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SUPPORTED_LANGUAGES } from '@codex/shared';

export class TestCaseDto {
  @IsString()
  @IsOptional()
  input?: string;

  @IsString()
  expectedOutput: string;

  @IsOptional()
  hidden?: boolean;
}

export class CreateExecutionDto {
  @IsString()
  @IsEnum(SUPPORTED_LANGUAGES, {
    message: `Language must be one of: ${SUPPORTED_LANGUAGES.join(', ')}`,
  })
  language: string;

  @IsString()
  @MinLength(1, { message: 'Source code cannot be empty' })
  @MaxLength(50000, { message: 'Source code too long' })
  sourceCode: string;

  @IsString()
  @IsOptional()
  stdin?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TestCaseDto)
  @IsOptional()
  testCases?: TestCaseDto[];
}

export class ExecutionResponseDto {
  id: string;
  language: string;
  status: string;
  stdout: string;
  stderr: string;
  runtime: number;
  memoryUsed: number;
  exitCode: number;
  createdAt: Date;
  testResults?: TestResultDto[];
}

export class TestResultDto {
  input: string;
  expectedOutput: string;
  actualOutput: string;
  passed: boolean;
  runtime: number;
}
