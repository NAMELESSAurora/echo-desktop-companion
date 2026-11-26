import { describe, expect, it, vi } from 'vitest';
import { TurnCoordinator } from '../src/turns';
import type { TurnApi } from '../src/api';
import type { PipelineEvent, TurnPayload } from '../src/types';

function deferred<T>() { let resolve!: (value: T) => void; const promise = new Promise<T>(r => { resolve = r; }); return { promise, resolve }; }
const payload = (): TurnPayload => ({ request_id: crypto.randomUUID(), text: '你好', speak: true, supersede: true });
const tick = () => new Promise(resolve => setTimeout(resolve, 0));

describe('turn lifecycle', () => {
  it('cancels a POST that finishes after the user pressed interrupt', async () => {
    const pending = deferred<{ turn_id: string; events_url: string; replayed: boolean }>();
    const cancel = vi.fn(async () => ({}));
    const stream = vi.fn(async function* () { yield {} as PipelineEvent; });
    const api: TurnApi = { start: () => pending.promise, cancel, events: stream };
    const stopped = vi.fn();
    const c = new TurnCoordinator(api, { created: vi.fn(), event: vi.fn(), stopped, error: vi.fn() });
    c.send('session', 'hi', false, async () => payload());
    await tick(); c.cancel();
    expect(stopped).toHaveBeenCalledOnce();
    pending.resolve({ turn_id: 'late', events_url: '/events', replayed: false });
    await tick();
    expect(cancel).toHaveBeenCalledWith('late');
    expect(stream).not.toHaveBeenCalled();
  });

  it('serializes POST creation so an older request cannot supersede the newest one', async () => {
    const pending = deferred<{ turn_id: string; events_url: string; replayed: boolean }>();
    const starts: string[] = [];
    const api: TurnApi = {
      start: async (_, body) => { starts.push(body.text); return starts.length === 1 ? pending.promise : { turn_id: 'new', events_url: '/new', replayed: false }; },
      cancel: vi.fn(async () => ({})),
      events: async function* () { yield { id: 1, turn_id: 'new', type: 'turn.completed', data: {} } as PipelineEvent; },
    };
    const seen = vi.fn();
    const c = new TurnCoordinator(api, { created: vi.fn(), event: seen, stopped: vi.fn(), error: vi.fn() });
    c.send('s', 'old', false, async () => ({ ...payload(), text: 'old' }));
    await tick();
    c.send('s', 'new', false, async () => ({ ...payload(), text: 'new' }));
    await tick(); expect(starts).toEqual(['old']);
    pending.resolve({ turn_id: 'old', events_url: '/old', replayed: false });
    await tick(); await tick();
    expect(starts).toEqual(['old', 'new']);
    expect(api.cancel).toHaveBeenCalledWith('old');
    expect(seen).toHaveBeenCalledOnce();
    expect(c.current?.id).toBe('new');
  });

  it('drops duplicate ids and wrong-turn audio', async () => {
    const seen = vi.fn();
    const api: TurnApi = {
      start: async () => ({ turn_id: 't', events_url: '/e', replayed: false }),
      cancel: vi.fn(async () => ({})),
      events: async function* () {
        for (const [id, turn_id, type] of [[1,'t','turn.started'],[2,'old','audio.chunk'],[1,'t','audio.chunk'],[3,'t','turn.completed'],[4,'t','audio.chunk']] as const) {
          yield { id, turn_id, type, data: {} } as PipelineEvent;
        }
      },
    };
    const c = new TurnCoordinator(api, { created: vi.fn(), event: seen, stopped: vi.fn(), error: vi.fn() });
    c.send('s', 'hi', false, async () => payload());
    await tick();
    expect(seen.mock.calls.map(c => c[1].type)).toEqual(['turn.started', 'turn.completed']);
  });

  it('reports premature EOF and cancels the server task', async () => {
    const error = vi.fn();
    const api: TurnApi = {
      start: async () => ({ turn_id: 't', events_url: '/e', replayed: false }),
      cancel: vi.fn(async () => ({})),
      events: async function* () { yield { id: 1, turn_id: 't', type: 'text.delta', data: {} } as PipelineEvent; },
    };
    const c = new TurnCoordinator(api, { created: vi.fn(), event: vi.fn(), stopped: vi.fn(), error });
    c.send('s', 'hi', false, async () => payload()); await tick();
    expect(error.mock.calls[0][1].code).toBe('incomplete_stream');
    expect(api.cancel).toHaveBeenCalledWith('t');
  });
});
