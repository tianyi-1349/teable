import * as http from 'http';
import * as https from 'https';
import { URL } from 'url';
import { HttpException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiStreamErrorCode, type IAiViewContextQuery } from '@teable/openapi';
import type { Response, Request } from 'express';
import { AiService } from '../ai/ai.service';
import { createAiStreamError, handleAiStreamErrorResponse } from '../ai/stream-error.helper';

type IChatMessage = {
  role: string;
  content: unknown;
};

type IChatCompletionBody = {
  messages?: IChatMessage[];
  teableContext?: unknown;
  viewContext?: unknown;
  baseId?: string;
  tableId?: string;
  viewId?: string;
  ignoreViewQuery?: boolean;
  filter?: IAiViewContextQuery['filter'];
  orderBy?: IAiViewContextQuery['orderBy'];
  groupBy?: IAiViewContextQuery['groupBy'];
  search?: IAiViewContextQuery['search'];
  sampleSize?: number;
} & Record<string, unknown>;

@Injectable()
export class ChatService {
  constructor(
    private readonly configService: ConfigService,
    private readonly aiService: AiService
  ) {}

  private getProxyTarget(openAIEndPoint: string) {
    const endpoint = new URL(openAIEndPoint);
    const basePath = endpoint.pathname.replace(/\/$/, '');
    const path = `${basePath || '/v1'}/chat/completions`;

    return {
      protocol: endpoint.protocol,
      hostname: endpoint.hostname,
      port: endpoint.port ? Number(endpoint.port) : undefined,
      path,
    };
  }

  private handleStreamingProxyError(res: Response, code: AiStreamErrorCode, message: string) {
    handleAiStreamErrorResponse(res, createAiStreamError(code, message));
  }

  private async resolveTeableContext(body: IChatCompletionBody) {
    if (body.teableContext ?? body.viewContext) {
      return body.teableContext ?? body.viewContext;
    }

    if (!body.baseId || !body.tableId) {
      return undefined;
    }

    return await this.aiService.getViewContext(body.baseId, {
      tableId: body.tableId,
      viewId: body.viewId,
      ignoreViewQuery: body.ignoreViewQuery,
      filter: body.filter,
      orderBy: body.orderBy,
      groupBy: body.groupBy,
      search: body.search,
      sampleSize: body.sampleSize,
    });
  }

  private appendTeableContext(
    body: IChatCompletionBody,
    context: unknown
  ): Record<string, unknown> {
    const {
      teableContext: _teableContext,
      viewContext: _viewContext,
      baseId: _baseId,
      tableId: _tableId,
      viewId: _viewId,
      ignoreViewQuery: _ignoreViewQuery,
      filter: _filter,
      orderBy: _orderBy,
      groupBy: _groupBy,
      search: _search,
      sampleSize: _sampleSize,
      ...payload
    } = body;

    if (!context) {
      return payload;
    }

    const contextMessage: IChatMessage = {
      role: 'system',
      content: [
        'You are operating inside Teable.',
        'Use the following current table view context when answering questions or planning data operations.',
        'Treat this context as the active scope. Do not assume access outside it unless the user explicitly asks.',
        JSON.stringify(context),
      ].join('\n\n'),
    };

    return {
      ...payload,
      messages: [contextMessage, ...(Array.isArray(body.messages) ? body.messages : [])],
    };
  }

  async completions(req: Request, res: Response) {
    const openAIEndPoint = this.configService.get<string>('OPENAI_API_ENDPOINT');
    const openAiKey = this.configService.get<string>('OPENAI_API_KEY');

    if (!openAIEndPoint || !openAiKey) {
      throw new HttpException('OPENAI_API_ENDPOINT or OPENAI_API_KEY is undefined', 500);
    }

    const { protocol, hostname, port, path } = this.getProxyTarget(openAIEndPoint);
    const options = {
      method: 'POST',
      hostname,
      port,
      path,
      headers: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openAiKey}`,
      },
    };

    const requestBody = req.body as IChatCompletionBody;
    const teableContext = await this.resolveTeableContext(requestBody);
    const body = this.appendTeableContext(requestBody, teableContext);

    const proxyReq = (protocol === 'https' ? https : http).request(options, (proxyRes) => {
      res.status(proxyRes.statusCode ?? 500);
      res.set(proxyRes.headers);

      proxyRes.on('aborted', () => {
        this.handleStreamingProxyError(
          res,
          AiStreamErrorCode.StreamReadError,
          'Upstream response stream was aborted'
        );
      });

      proxyRes.on('error', (error) => {
        this.handleStreamingProxyError(res, AiStreamErrorCode.StreamReadError, error.message);
      });

      proxyRes.pipe(res);
    });

    proxyReq.on('error', (error) => {
      this.handleStreamingProxyError(res, AiStreamErrorCode.StreamProxyError, error.message);
    });

    req.on('aborted', () => {
      proxyReq.destroy();
    });

    proxyReq.write(JSON.stringify(body));

    proxyReq.end();
  }
}
