# Aliyun-tts-websocket

This repo is developed for `aliyun` tts websocket. For more information, please see: https://help.aliyun.com/document_detail/324262.html?spm=a2c4g.324262.0.0.7dd87d63BjFUFh

English | [简体中文](./docs/zh_CN.md)

## Installation

```shell
$ npm install aliyun-tts-websocket --save
```

## Usage

With webpack, vite or other build tools:

```javascript
import AliyunTtsWebSocket from 'aliyun-tts-websocket'

const service = new AliyunTtsWebSocket({
  ws: '', // A websocket address with your token.
  ttsHeaders: {
    appkey: '' // Your aliyun cloud appkey
  }
})

service.start()
service.stop()
```

## Constructor options
| name               | type                                          | default            | description                                                              |
|--------------------|-----------------------------------------------|--------------------|--------------------------------------------------------------------------|
| ws                 | string                                        | ''                 | Websocket url.                                                           |
| mediaStreamHandler | (stream: MediaStream, send: Function) => void | null               | A function which can make you change audio stream and send to websocket. |
| ttsConfig          | object                                        | tts default config | Same as the payload of `StartTranscription` directive.                   |
| ttsHeaders         | object                                        | tts default header | Same as the header of each directive.                                    |

### mediaStreamHandler

This function make you convert audio format by your self. `PCM` is used by default.

### Default config value

```json5
{
  enable_intermediate_result: true,
  enable_punctuation_prediction: true
}
```

This params is used for `StartTranscription` directive's payload. For more information, see: https://help.aliyun.com/document_detail/324262.html?spm=a2c4g.324262.0.0.7dd87d63BjFUFh#sectiondiv-rz2-i36-2gv

### Default header value

```json5
{
  appkey: ''
}
```

This params is used for each directive. For more information, see: https://help.aliyun.com/document_detail/324262.html?spm=a2c4g.324262.0.0.7dd87d63BjFUFh#sectiondiv-mkk-cs4-5kh 

Notice that only `appkey` field is required, other fields is not recommended to pass.

## Public methods

| name  | description                                                                                                                                                                 |
|-------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| start | Open a websocket connection, send `StartTranscription` directive to server and weakup microphone device.                                                                    |
| stop  | Disconnect the microphone devece and send `StopTranscription` directive to serve. The websocket connection will be closed after receive the `TranscriptionCompleted` event. |
| on    | Alias of `addEventListener`.                                                                                                                                                |

## Events

Aliyun-tts-websocket extends `EventTarget`, you can listen events as same as DOM events.

```javascript
const service = new AliyunTtsWebSocket({
  // ...
})
service.addEventListener('ws:open', function () {
  // do something.
})
service.addEventListener('tts:change', function (event) {
  console.log(event.detail); // get event data.
})
```

| name       | event data                                 | description                                                                  |
|------------|--------------------------------------------|------------------------------------------------------------------------------|
| ws:open    | undefined                                  | Will be called after websocket connected.                                    |
| ws:message | Websocket MessageEvent                     | Will be called after receive websocket messages.                             |
| ws:close   | undefined                                  | Will be called after websocket disconnected.                                 |
| tts:begin  | same as `SentenceBegin` event              | Will be called after receive `SentenceBegin` event.                          |
| tts:change | same as `TranscriptionResultChanged` event | Will be called after receive `TranscriptionResultChanged` event.             |
| tts:end    | same as `SentenceEnd` event                | Will be called after receive `SentenceEnd` event.                            |
| tts:stop   | same as `TranscriptionCompleted` event     | Will be called after receive `TranscriptionCompleted` event.                 |
| ready      | undefined                                  | Will be called after weakup microphone device.                               |

## Thanks

Some code is referenced from this article: https://juejin.cn/post/7028003824912564231, thanks!
