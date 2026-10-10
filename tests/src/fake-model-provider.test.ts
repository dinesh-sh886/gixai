import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  createFakeModelProvider,
  createTextResponse,
  createToolCallResponse,
  ModelMessageSchema,
  ModelResponseSchema,
} from './fake-model-provider.js';
import type {
  FakeModelProvider,
  ModelMessage,
  ModelToolCall,
  ModelResponse,
} from './fake-model-provider.js';

describe('FakeModelProvider', () => {
  let provider: FakeModelProvider;

  beforeEach(() => {
    provider = createFakeModelProvider();
  });

  afterEach(() => {
    provider.clear();
  });

  describe('basic functionality', () => {
    it('should return default response when no responses configured', async () => {
      const messages: ModelMessage[] = [{ role: 'user', content: 'Hello' }];
      const response = await provider.complete(messages);

      expect(response.content).toBe('Fake response');
      expect(response.finishReason).toBe('stop');
      expect(response.usage.promptTokens).toBe(10);
      expect(response.usage.completionTokens).toBe(20);
      expect(response.usage.totalTokens).toBe(30);
    });

    it('should return configured responses in order', async () => {
      const responses: ModelResponse[] = [
        createTextResponse('First response'),
        createTextResponse('Second response'),
        createTextResponse('Third response'),
      ];
      provider.setResponses(responses);

      const messages: ModelMessage[] = [{ role: 'user', content: 'Hello' }];

      const response1 = await provider.complete(messages);
      expect(response1.content).toBe('First response');

      const response2 = await provider.complete(messages);
      expect(response2.content).toBe('Second response');

      const response3 = await provider.complete(messages);
      expect(response3.content).toBe('Third response');
    });

    it('should cycle through responses when more calls than responses', async () => {
      const responses: ModelResponse[] = [
        createTextResponse('Response 1'),
        createTextResponse('Response 2'),
      ];
      provider.setResponses(responses);

      const messages: ModelMessage[] = [{ role: 'user', content: 'Hello' }];

      const response1 = await provider.complete(messages);
      expect(response1.content).toBe('Response 1');

      const response2 = await provider.complete(messages);
      expect(response2.content).toBe('Response 2');

      const response3 = await provider.complete(messages);
      expect(response3.content).toBe('Response 1');
    });

    it('should track call history', async () => {
      const messages: ModelMessage[] = [{ role: 'user', content: 'Hello' }];

      await provider.complete(messages);
      await provider.complete(messages);

      expect(provider.getCallCount()).toBe(2);
      expect(provider.getCalls().length).toBe(2);
      expect(provider.getLastCall()).toBeDefined();
    });

    it('should support tool call responses', async () => {
      const toolCalls: ModelToolCall[] = [
        {
          id: 'call_123',
          type: 'function',
          function: {
            name: 'read_file',
            arguments: JSON.stringify({ path: 'test.txt' }),
          },
        },
      ];
      const toolResponse = createToolCallResponse(toolCalls);
      provider.setResponses([toolResponse]);

      const messages: ModelMessage[] = [{ role: 'user', content: 'Read file' }];
      const completion = await provider.complete(messages);

      expect(completion.toolCalls).toEqual(toolCalls);
      expect(completion.finishReason).toBe('tool_calls');
    });

    it('should support streaming', async () => {
      const response = createTextResponse('Streaming response');
      provider.setResponses([response]);

      const messages: ModelMessage[] = [{ role: 'user', content: 'Hello' }];
      const stream = provider.streamComplete(messages);

      const chunks: ModelResponse[] = [];
      for await (const chunk of stream) {
        chunks.push(chunk);
      }

      expect(chunks).toHaveLength(1);
      expect(chunks[0]!.content).toBe('Streaming response');
    });

    it('should support custom delay', async () => {
      const start = Date.now();
      const providerWithDelay = createFakeModelProvider({ delay: 50 });
      const messages: ModelMessage[] = [{ role: 'user', content: 'Hello' }];

      await providerWithDelay.complete(messages);
      const elapsed = Date.now() - start;

      expect(elapsed).toBeGreaterThanOrEqual(40);
    });

    it('should support failure mode', async () => {
      const error = new Error('Model unavailable');
      const failingProvider = createFakeModelProvider({ shouldFail: true, failureError: error });

      const messages: ModelMessage[] = [{ role: 'user', content: 'Hello' }];

      await expect(failingProvider.complete(messages)).rejects.toThrow('Model unavailable');
    });

    it('should clear state correctly', async () => {
      provider.setResponses([createTextResponse('Test')]);
      await provider.complete([{ role: 'user', content: 'Hello' }]);

      provider.clear();

      expect(provider.getCallCount()).toBe(0);
      expect(provider.getCalls()).toHaveLength(0);
    });

    it('should add responses dynamically', async () => {
      provider.setResponses([createTextResponse('First')]);
      provider.addResponse(createTextResponse('Second'));

      const messages: ModelMessage[] = [{ role: 'user', content: 'Hello' }];

      const response1 = await provider.complete(messages);
      expect(response1.content).toBe('First');

      const response2 = await provider.complete(messages);
      expect(response2.content).toBe('Second');
    });
  });

  describe('createTextResponse', () => {
    it('should create a valid text response', () => {
      const response = createTextResponse('Hello, World!');

      expect(response.content).toBe('Hello, World!');
      expect(response.finishReason).toBe('stop');
      expect(response.toolCalls).toBeUndefined();
      expect(response.usage.promptTokens).toBe(10);
      expect(response.usage.completionTokens).toBeGreaterThan(0);
    });
  });

  describe('createToolCallResponse', () => {
    it('should create a valid tool call response', () => {
      const toolCalls = [
        {
          id: 'call_1',
          type: 'function' as const,
          function: {
            name: 'test_function',
            arguments: '{"arg": "value"}',
          },
        },
      ];

      const response = createToolCallResponse(toolCalls);

      expect(response.content).toBe('');
      expect(response.toolCalls).toEqual(toolCalls);
      expect(response.finishReason).toBe('tool_calls');
      expect(response.usage.promptTokens).toBe(10);
      expect(response.usage.completionTokens).toBe(50);
    });
  });

  describe('Zod schemas', () => {
    it('should validate ModelMessage schema', () => {
      const validMessage = {
        role: 'user',
        content: 'Hello',
      };

      const result = ModelMessageSchema.safeParse(validMessage);
      expect(result.success).toBe(true);
    });

    it('should reject invalid ModelMessage', () => {
      const invalidMessage = {
        role: 'invalid',
        content: 'Hello',
      };

      const result = ModelMessageSchema.safeParse(invalidMessage);
      expect(result.success).toBe(false);
    });

    it('should validate ModelResponse schema', () => {
      const validResponse = {
        content: 'Test',
        finishReason: 'stop',
        usage: {
          promptTokens: 10,
          completionTokens: 20,
          totalTokens: 30,
        },
      };

      const result = ModelResponseSchema.safeParse(validResponse);
      expect(result.success).toBe(true);
    });
  });
});
