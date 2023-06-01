import {compress, get32HEX} from './utils.js';

const defaultOpts = {
  /**
   * websocket addr
   */
  ws: '',
  mediaStreamHandler: undefined,
  /**
   * Payload of StartTranscription directive, it will be passed when 'start' method is called.
   */
  ttsConfig: {
    enable_intermediate_result: true,
    enable_punctuation_prediction: true
  },
  /**
   * Headers of websocket params, only 'appkey' is required.
   */
  ttsHeaders: {
    appkey: ''
  },
}

const DIRECTIVES = {
  StartTranscription: 'StartTranscription',
  StopTranscription: 'StopTranscription',
}

const MSGS = {
  TranscriptionStarted: 'TranscriptionStarted',
  SentenceBegin: 'SentenceBegin',
  TranscriptionResultChanged: 'TranscriptionResultChanged',
  SentenceEnd: 'SentenceEnd',
  TranscriptionCompleted: 'TranscriptionCompleted'
}

export default class AliyunTtsWebSocket extends EventTarget {
  constructor(opts) {
    super();
    this.options = Object.assign({}, defaultOpts, opts);
    if (!this.options.ws) {
      throw new Error('ws is required for AliyunTtsWebSocket constructor.')
    }
    if (!this.options.ttsHeaders || !this.options.ttsHeaders.appkey) {
      throw new Error('appkey is required for AliyunTtsWebSocket constructor.')
    }
    this.on = this.addEventListener;
    this._stream = null;
    this._socket = null;
    this._taskId = get32HEX();
  }

  /**
   * Open a websocket and call browser's media API.
   */
  start() {
    if (this.__isWorking()) return;
    this._socket = this.__initSocket();
    this._socket.addEventListener('open', () => {
      this.__sendDirective(DIRECTIVES.StartTranscription, this.options.ttsConfig);
    })
  }

  /**
   * Stop use media API and close the websocket.
   * The websocket will be disconnected after accept server's message.
   */
  stop() {
    if (!this.__isWorking()) return;
    if (this._stream) {
      const tracks = this._stream.getTracks();
      tracks.forEach(item => {
        item.stop();
      });
      this._stream = null;
    }
    this._scriptProcessor.disconnect();
    this._sourceAudio.disconnect();
    this._ctxAudio = null;
    this._scriptProcessor = null;
    this._sourceAudio = null;
    // 发送 StopTranscription 指令
    this.__sendDirective(DIRECTIVES.StopTranscription)
  }

  __isWorking() {
    return this._stream ? 1 : 0;
  }

  __initSocket() {
    const socket = new WebSocket(this.options.ws);
    socket.addEventListener('open', () => {
      this.dispatchEvent(new Event('ws:open'))
    })
    socket.addEventListener('message', (event) => {
      this.dispatchEvent(new CustomEvent('ws:message'), { detail: event });
      this.__registerSocketMessage(JSON.parse(event.data), event);
    })
    socket.addEventListener('close', () => {
      this.dispatchEvent(new Event('ws:close'))
    })
    return socket;
  }

  __registerSocketMessage(data, event) {
    const msgType = data.header.name || '';
    switch (msgType) {
      case MSGS.TranscriptionStarted:
        this.__useAudioMedia();
        break;
      case MSGS.SentenceBegin:
        this.dispatchEvent(new CustomEvent('tts:begin', {
          detail: data
        }));
        break;
      case MSGS.TranscriptionResultChanged:
        this.dispatchEvent(new CustomEvent('tts:change', {
          detail: data
        }));
        break;
      case MSGS.SentenceEnd:
        this.dispatchEvent(new CustomEvent('tts:end', {
          detail: data
        }));
        break;
      case MSGS.TranscriptionCompleted:
        this._socket.close();
        this._socket = null;
        this.dispatchEvent(new CustomEvent('tts:stop', {
          detail: data
        }));
        break;
      default:
        break;
    }
  }

  __getHeaders(directive) {
    return Object.assign({}, {
      message_id: directive === DIRECTIVES.StartTranscription ? this._taskId : get32HEX(),
      task_id: this._taskId,
      namespace: 'SpeechTranscriber',
      name: directive,
    }, this.options.ttsHeaders);
  }

  __sendDirective(directive, data) {
    this._socket.send(JSON.stringify({
      header: this.__getHeaders(directive),
      payload: data
    }))
  }

  __useAudioMedia() {
    const promise = navigator.mediaDevices.getUserMedia({ audio: true });
    promise.then((stream) => {
      this._stream = stream;
      this.dispatchEvent(new Event('ready'));
      if (this.options.mediaStreamHandler) {
        this.options.mediaStreamHandler.call(this, stream, this._socket.send);
      }
      else {
        this._ctxAudio = new window.AudioContext()
        this._sourceAudio = this._ctxAudio.createMediaStreamSource(this._stream)
        this._scriptProcessor = this._ctxAudio.createScriptProcessor(4096, 1, 1)
        this._sourceAudio.connect(this._scriptProcessor)
        this._scriptProcessor.connect(this._ctxAudio.destination)
        this._scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
          const buffer = audioProcessingEvent.inputBuffer.getChannelData(0)

          let sum = 0
          let outputData = []
          for (let i = 0; i < buffer.length; i++) {
            sum += buffer[i] * buffer[i]
          }
          // this.maxVol = Math.round(Math.sqrt(sum / buffer.length) * 100)
          const inputSampleRate = this._ctxAudio.sampleRate
          outputData = compress(buffer, inputSampleRate, 16000)

          this._socket.send(outputData)
        }
      }
    }).catch(err => {
      console.error(err);
      this.stop();
    });
  }
}
