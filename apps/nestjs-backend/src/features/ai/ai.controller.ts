import { Body, Controller, Get, Param, Post, Query, Res } from '@nestjs/common';
import {
  aiGenerateRoSchema,
  aiExtractWriteApplyRoSchema,
  aiExtractWritePreviewRoSchema,
  aiRecordOperationRoSchema,
  aiViewContextQuerySchema,
  getNativeAICapabilitiesQuerySchema,
  IAiExtractWriteApplyRo,
  IAiExtractWritePreviewRo,
  IAiGenerateRo,
  IAiRecordOperationRo,
  IAiViewContextQuery,
  IGetNativeAICapabilitiesQuery,
  IQueryNativeAICapabilitiesRo,
  queryNativeAICapabilitiesRoSchema,
} from '@teable/openapi';
import { Response } from 'express';
import { ZodValidationPipe } from '../../zod.validation.pipe';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { TablePipe } from '../table/open-api/table.pipe';
import { AiService } from './ai.service';

@Controller('api/:baseId/ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('/generate-stream')
  @Permissions('base|read')
  async generateStream(
    @Param('baseId') baseId: string,
    @Body(new ZodValidationPipe(aiGenerateRoSchema), TablePipe) aiGenerateRo: IAiGenerateRo,
    @Res() res: Response
  ) {
    await this.aiService.generateStream(baseId, aiGenerateRo, res);
  }

  @Get('/config')
  @Permissions('base|read')
  async getAIConfig(@Param('baseId') baseId: string) {
    return await this.aiService.getSimplifiedAIConfig(baseId);
  }

  @Get('/disable-ai-actions')
  @Permissions('base|read')
  async getAIDisableAIActions(@Param('baseId') baseId: string) {
    return await this.aiService.getAIDisableAIActions(baseId);
  }

  @Get('/view-context')
  @Permissions('base|read')
  async getViewContext(
    @Param('baseId') baseId: string,
    @Query(new ZodValidationPipe(aiViewContextQuerySchema)) query: IAiViewContextQuery
  ) {
    return await this.aiService.getViewContext(baseId, query);
  }

  @Post('/record-operations')
  async recordOperations(
    @Param('baseId') baseId: string,
    @Body(new ZodValidationPipe(aiRecordOperationRoSchema)) body: IAiRecordOperationRo
  ) {
    return await this.aiService.recordOperation(baseId, body);
  }

  @Post('/extract-and-write/preview')
  @Permissions('base|read')
  async previewExtractAndWrite(
    @Param('baseId') baseId: string,
    @Body(new ZodValidationPipe(aiExtractWritePreviewRoSchema)) body: IAiExtractWritePreviewRo
  ) {
    return await this.aiService.previewExtractAndWrite(baseId, body);
  }

  @Post('/extract-and-write/apply')
  async applyExtractAndWrite(
    @Param('baseId') baseId: string,
    @Body(new ZodValidationPipe(aiExtractWriteApplyRoSchema)) body: IAiExtractWriteApplyRo
  ) {
    return await this.aiService.applyExtractAndWrite(baseId, body);
  }

  @Get('/native-capabilities')
  @Permissions('base|read')
  async getNativeCapabilities(
    @Param('baseId') baseId: string,
    @Query(new ZodValidationPipe(getNativeAICapabilitiesQuerySchema))
    query: IGetNativeAICapabilitiesQuery
  ) {
    return await this.aiService.getNativeCapabilities(baseId, query);
  }

  @Post('/native-capabilities/query')
  @Permissions('base|read')
  async queryNativeCapabilities(
    @Param('baseId') baseId: string,
    @Body(new ZodValidationPipe(queryNativeAICapabilitiesRoSchema))
    queryRo: IQueryNativeAICapabilitiesRo
  ) {
    return await this.aiService.queryNativeCapabilities(baseId, queryRo);
  }
}
