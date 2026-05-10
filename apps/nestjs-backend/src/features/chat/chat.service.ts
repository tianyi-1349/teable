import { HttpException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { axios } from '@teable/openapi';
import type { Response, Request } from 'express';
import { getSsrfSafeAgents } from '../../utils';

const allowedResponseHeaders = new Set([
  'content-type',
  'content-length',
  'content-encoding',
  'cache-control',
  'x-request-id',
]);

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(private readonly configService: ConfigService) {}

  async completions(req: Request, res: Response) {
    const openAIEndPoint = this.configService.get<string>('OPENAI_API_ENDPOINT');
    const openAiKey = this.configService.get<string>('OPENAI_API_KEY');

    if (!openAIEndPoint || !openAiKey) {
      throw new HttpException('OPENAI_API_ENDPOINT or OPENAI_API_KEY is undefined', 500);
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(openAIEndPoint);
    } catch {
      throw new HttpException('OPENAI_API_ENDPOINT is not a valid URL', 500);
    }

    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      throw new HttpException('OPENAI_API_ENDPOINT must use http or https', 500);
    }

    const targetPath = `${parsedUrl.pathname.replace(/\/$/, '')}/v1/chat/completions`;
    const targetUrl = `${parsedUrl.origin}${targetPath}`;

    try {
      const response = await axios.post(targetUrl, req.body, {
        headers: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openAiKey}`,
        },
        ...getSsrfSafeAgents(),
        responseType: 'stream',
      });

      const safeHeaders: Record<string, string> = {};
      for (const [key, value] of Object.entries(response.headers)) {
        if (allowedResponseHeaders.has(key.toLowerCase()) && typeof value === 'string') {
          safeHeaders[key] = value;
        }
      }
      res.set(safeHeaders);
      response.data.pipe(res);
    } catch (error) {
      this.logger.error('Error while proxying request:', error);
      res.status(500).send('Error while proxying request');
    }
  }
}
