export interface BackendConfig {
  mode: 'mock' | 'live';
  models: { dialogue: string; vision: string; memory: string; tts: string; realtime?: string };
  audio: { format: string; sample_rate: number; channels: number };
  configured?: { deepseek: boolean; qwen_tts: boolean; moss_live: boolean };
  moss_live?: {
    model: string;
    configured: boolean;
    input_audio: { format: string; sample_rate: number; channels: number };
    output_audio: { format: string; sample_rate: number; channels: number };
    voice: string | null;
    persona_name: string;
    memory_scope: 'session' | 'user';
    delegation: 'none' | 'client' | 'server';
    idle_timeout_s: number;
  };
}

export interface MossVoice {
  id: string;
  name: string;
  gender?: string;
  source?: string;
}

export interface MossLiveReady {
  mode: 'mock' | 'live';
  model: string;
  remote_session_id: string | null;
  memory_scope: string;
  delegation: string;
  voice: string | null;
  input_audio: { format: string; sample_rate: number; channels: number };
  output_audio: { format: string; sample_rate: number; channels: number };
  idle_timeout_s: number;
  mock_audio: boolean;
}

export interface Session { id: string; character_id: string }
export interface CreatedTurn { turn_id: string; events_url: string; replayed: boolean }
export interface ScreenFrame {
  image_base64: string;
  mime_type: 'image/jpeg';
  source_id: string;
  policy_epoch: number;
  captured_at: string;
}
export interface PipelineEvent {
  schema_version: number;
  id: number;
  type: string;
  session_id: string;
  turn_id: string;
  data: Record<string, unknown>;
}
export interface TurnPayload {
  request_id: string;
  text: string;
  speak: boolean;
  supersede: boolean;
  screen?: ScreenFrame;
}

export interface MemoryProposal {
  id: string;
  job_id: string;
  character_id: string;
  epoch: number;
  text: string;
  source_message_ids: number[];
  status: 'pending' | 'accepted' | 'stale';
}

export interface MemoryJob {
  id: string;
  session_id: string;
  character_id: string;
  epoch: number;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'stale' | 'cancelled' | 'interrupted';
  error_code: string | null;
  proposal_count: number;
  proposals: MemoryProposal[];
}

export interface MemoryFact {
  id: string;
  text: string;
  character_id?: string;
  created_at?: string;
  updated_at?: string;
}
