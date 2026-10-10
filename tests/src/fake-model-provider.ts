import { z } from 'zod';

export interface ModelMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  toolCalls?: ModelToolCall[];
  toolCallId?: string;
}

export interface ModelToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

export interface ModelResponse {
  content: string;
  toolCalls?: ModelToolCall[];
  finishReason: 'stop' | 'tool_calls' | 'length' | 'error';
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface ModelProvider {
  complete(messages: ModelMessage[]): Promise<ModelResponse>;
  streamComplete(messages: ModelMessage[]): AsyncIterable<ModelResponse>;
}

export interface FakeModelProviderOptions {
  responses?: ModelResponse[];
  delay?: number;
  shouldFail?: boolean;
  failureError?: Error;
}

export class FakeModelProvider implements ModelProvider {
  private responses: ModelResponse[];
  private callIndex = 0;
  private readonly delay: number;
  private readonly shouldFail: boolean;
  private readonly failureError: Error;
  public calls: Array<{ messages: ModelMessage[]; timestamp: number }> = [];

  constructor(options: FakeModelProviderOptions = {}) {
    this.responses = options.responses ?? [];
    this.delay = options.delay ?? 0;
    this.shouldFail = options.shouldFail ?? false;
    this.failureError = options.failureError ?? new Error('Fake model provider configured to fail');
  }

  setResponses(responses: ModelResponse[]): void {
    this.responses = responses;
    this.callIndex = 0;
  }

  addResponse(response: ModelResponse): void {
    this.responses.push(response);
  }

  clear(): void {
    this.responses = [];
    this.callIndex = 0;
    this.calls = [];
  }

  async complete(messages: ModelMessage[]): Promise<ModelResponse> {
    this.calls.push({ messages, timestamp: Date.now() });

    if (this.delay > 0) {
      await new Promise(resolve => setTimeout(resolve, this.delay));
    }

    if (this.shouldFail) {
      throw this.failureError;
    }

    const response =
      this.responses[this.callIndex % Math.max(this.responses.length, 1)] ?? this.defaultResponse();
    this.callIndex++;
    return response;
  }

  async *streamComplete(messages: ModelMessage[]): AsyncIterable<ModelResponse> {
    this.calls.push({ messages, timestamp: Date.now() });

    if (this.shouldFail) {
      throw this.failureError;
    }

    const response =
      this.responses[this.callIndex % Math.max(this.responses.length, 1)] ?? this.defaultResponse();
    this.callIndex++;

    if (this.delay > 0) {
      await new Promise(resolve => setTimeout(resolve, this.delay));
    }

    yield response;
  }

  private defaultResponse(): ModelResponse {
    return {
      content: 'Fake response',
      finishReason: 'stop',
      usage: {
        promptTokens: 10,
        completionTokens: 20,
        totalTokens: 30,
      },
    };
  }

  getCallCount(): number {
    return this.calls.length;
  }

  getLastCall(): { messages: ModelMessage[]; timestamp: number } | undefined {
    return this.calls[this.calls.length - 1];
  }

  getCalls(): Array<{ messages: ModelMessage[]; timestamp: number }> {
    return [...this.calls];
  }
}

export function createFakeModelProvider(options?: FakeModelProviderOptions): FakeModelProvider {
  return new FakeModelProvider(options);
}

export function createToolCallResponse(toolCalls: ModelToolCall[]): ModelResponse {
  return {
    content: '',
    toolCalls,
    finishReason: 'tool_calls',
    usage: {
      promptTokens: 10,
      completionTokens: 50,
      totalTokens: 60,
    },
  };
}

export function createTextResponse(content: string): ModelResponse {
  return {
    content,
    finishReason: 'stop',
    usage: {
      promptTokens: 10,
      completionTokens: content.length / 4,
      totalTokens: 10 + content.length / 4,
    },
  };
}

export const ModelMessageSchema = z.object({
  role: z.enum(['system', 'user', 'assistant', 'tool']),
  content: z.string(),
  toolCalls: z
    .array(
      z.object({
        id: z.string(),
        type: z.literal('function'),
        function: z.object({
          name: z.string(),
          arguments: z.string(),
        }),
      })
    )
    .optional(),
  toolCallId: z.string().optional(),
});

export const ModelToolCallSchema = z.object({
  id: z.string(),
  type: z.literal('function'),
  function: z.object({
    name: z.string(),
    arguments: z.string(),
  }),
});

export const ModelResponseSchema = z.object({
  content: z.string(),
  toolCalls: z.array(ModelToolCallSchema).optional(),
  finishReason: z.enum(['stop', 'tool_calls', 'length', 'error']),
  usage: z.object({
    promptTokens: z.number(),
    completionTokens: z.number(),
    totalTokens: z.number(),
  }),
});
