import { describe, expect, it } from 'vitest';
import { readSSE } from '../src/api';

describe('SSE reader', () => {
  it('reads UTF-8 split across chunks, comments, CRLF and multi-line data', async () => {
    const input = ': heartbeat\r\n\r\ndata: {"id":1,\r\ndata: "type":"text.delta","data":{"text":"你好"}}\r\n\r\ndata: {"id":2,"type":"turn.completed","data":{}}';
    const bytes = new TextEncoder().encode(input);
    const stream = new ReadableStream({ start(controller) {
      for (let i = 0; i < bytes.length; i += 2) controller.enqueue(bytes.slice(i, i + 2));
      controller.close();
    } });
    const events = [];
    for await (const event of readSSE(stream)) events.push(event);
    expect(events.map(e => e.id)).toEqual([1, 2]);
    expect(events[0].data.text).toBe('你好');
  });
  it('releases a reader when JSON is invalid', async () => {
    let cancelled = false;
    const stream = new ReadableStream<Uint8Array>({
      start(controller) { controller.enqueue(new TextEncoder().encode('data: invalid\n\n')); },
      cancel() { cancelled = true; },
    });
    await expect(async () => { for await (const _ of readSSE(stream)) { /* consume */ } }).rejects.toThrow();
    expect(cancelled).toBe(true);
    expect(stream.locked).toBe(false);
  });
});
