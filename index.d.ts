export interface IAliyunTtsWebSocketOpts {
  ws: string;
  mediaStreamHandler?: (stream: MediaStream, send: WebSocket["send"]) => void;
  ttsConfig?: Record<string, any>;
  ttsHeaders: {
    appkey: string;
    [key: string]: any;
  }
}

interface EventMap {
  'ws:open': Event;
  'ws:message': CustomEvent;
  'ws:close': Event;
  'tts:begin': CustomEvent;
  'tts:change': CustomEvent;
  'tts:end': CustomEvent;
  'tts:stop': CustomEvent;
  'ready': Event;
}
export default class AliyunTtsWebSocket extends EventTarget{
  constructor(options: IAliyunTtsWebSocketOpts);
  start(): void;
  stop(): void;
  addEventListener<K extends keyof EventMap>(type: K, listener: (this: AliyunTtsWebSocket, ev: EventMap[K]) => any, options?: AddEventListenerOptions | boolean): void;

  on: typeof this.addEventListener;
}
