import { ApiError } from './api';
import type { TurnApi } from './api';
import type { PipelineEvent, TurnPayload } from './types';

export interface TurnRecord {
  localId: string; id: string | null; text: string; hasScreen: boolean;
  cancelled: boolean; terminal: boolean; lastEvent: number; abort: AbortController;
}
export interface TurnCallbacks {
  created(record: TurnRecord): void;
  event(record: TurnRecord, event: PipelineEvent): void;
  stopped(record: TurnRecord): void;
  error(record: TurnRecord, error: unknown): void;
}

export class TurnCoordinator {
  current: TurnRecord | null = null;
  private creationQueue: Promise<void> = Promise.resolve();
  constructor(private api: TurnApi, private callbacks: TurnCallbacks) {}

  send(sid: string, text: string, hasScreen: boolean, prepare: () => Promise<TurnPayload>) {
    this.cancel();
    const record: TurnRecord = {
      localId: crypto.randomUUID(), id: null, text, hasScreen, cancelled: false,
      terminal: false, lastEvent: 0, abort: new AbortController(),
    };
    this.current = record;
    this.callbacks.created(record);
    // Only POST creation is serialized, never the event stream. This prevents a late
    // earlier POST from superseding a more recent message on the server.
    this.creationQueue = this.creationQueue.catch(() => {}).then(async () => {
      try {
        if (record.cancelled) return;
        const payload = await prepare();
        if (record.cancelled || this.current !== record) return;
        const created = await this.api.start(sid, payload);
        record.id = created.turn_id;
        if (record.cancelled || this.current !== record) {
          await this.api.cancel(record.id);
          return;
        }
        void this.consume(record, created.events_url);
      } catch (error) {
        if (!record.cancelled) {
          record.terminal = true;
          this.callbacks.error(record, error);
        }
      }
    });
    return record;
  }

  private async consume(record: TurnRecord, path: string) {
    try {
      for await (const event of this.api.events(path, record.abort.signal)) {
        if (record.cancelled || this.current !== record) return;
        if ((event as unknown as { code?: string }).code === 'event_history_lost') {
          throw new ApiError('event_history_lost');
        }
        if (event.turn_id !== record.id || !Number.isInteger(event.id) || event.id <= record.lastEvent) continue;
        record.lastEvent = event.id;
        if (['turn.completed', 'turn.failed', 'turn.cancelled'].includes(event.type)) record.terminal = true;
        this.callbacks.event(record, event);
        if (record.terminal) break;
      }
      if (!record.terminal && !record.cancelled) throw new ApiError('incomplete_stream');
    } catch (error) {
      if (!record.cancelled && this.current === record) {
        record.terminal = true;
        this.callbacks.error(record, error);
        if (record.id) void this.api.cancel(record.id).catch(() => {});
      }
    }
  }

  cancel(keepalive = false) {
    const record = this.current;
    if (!record || record.cancelled) return;
    // Stop browser playback immediately, even if generation already completed.
    record.cancelled = true;
    record.abort.abort();
    this.callbacks.stopped(record);
    if (record.id && !record.terminal) {
      void this.api.cancel(record.id, keepalive).catch(error => this.callbacks.error(record, error));
    }
  }
}
