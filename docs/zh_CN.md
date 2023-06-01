# Aliyun-tts-websocket

这是一个使用阿里云实时语音识别服务的 websocket JavaScript SDK。关于阿里云实时语音识别的更多信息，请浏览：https://help.aliyun.com/document_detail/324262.html?spm=a2c4g.324262.0.0.7dd87d63BjFUFh

[English](../README.md) | 简体中文

## 安装

```shell
$ npm install aliyun-tts-websocket --save
```

## 使用

在 `webpack` `vite` 或其他需要构建的项目中使用：

```javascript
import AliyunTtsWebSocket from 'aliyun-tts-websocket'

const service = new AliyunTtsWebSocket({
  ws: '', // websocket地址.
  ttsHeaders: {
    appkey: '' // 阿里云实时语音识别 appkey
  }
})

service.start()
service.stop()
```

## 构造函数参数
| name               | type                                          | default            | description                                             |
|--------------------|-----------------------------------------------|--------------------|---------------------------------------------------------|
| ws                 | string                                        | ''                 | Websocket 连接地址。                                         |
| mediaStreamHandler | (stream: MediaStream, send: Function) => void | null               | 用于自定义处理音频的方法。                                           |
| ttsConfig          | object                                        | tts 默认配置           | 和阿里云 `StartTranscription` 指令的 `payload` 参数一致。           |
| ttsHeaders         | object                                        | tts 默认 header      | 和阿里云所有指令的 header 参数一致。                                  |

### mediaStreamHandler

这个方法用于自定义音频处理方法，可以将 `MediaStream` 处理成项目所需要的格式。本SDK默认使用 `PCM` 格式。

### ttsConfig 默认值

```json5
{
  enable_intermediate_result: true,
  enable_punctuation_prediction: true
}
```
这个对象会被当做 `payload` 参数传递给 `StartTranscription` 指令。关于这个指令参数的详细信息，请参考：https://help.aliyun.com/document_detail/324262.html?spm=a2c4g.324262.0.0.7dd87d63BjFUFh#sectiondiv-rz2-i36-2gv

### ttsHeaders 默认值

```json5
{
  appkey: ''
}
```

这个对象会被当做 `header` 传递给所有指令。有关 `header` 的更多信息，请参考：https://help.aliyun.com/document_detail/324262.html?spm=a2c4g.324262.0.0.7dd87d63BjFUFh#sectiondiv-mkk-cs4-5kh

注意：只有 `appkey` 字段是必传的，不建议再指定其他参数。

## 方法

| name  | description                                                                                  |
|-------|----------------------------------------------------------------------------------------------|
| start | 建立一个 `websocket` 连接, 发送 `StartTranscription` 指令并调用麦克风。                                       |
| stop  | 停止使用麦克风并且发送 `StopTranscription` 指令到服务器，`websocket` 会在收到服务端的 `TranscriptionCompleted` 事件之后断开。 |
| on    | `addEventListener` 的别名。                                                                      |

## 事件

Aliyun-tts-websocket 继承了 `EventTarget`，所以可以像DOM事件那样使用 `addEventListener` 来监听事件。

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

| name       | event data                        | description                            |
|------------|-----------------------------------|----------------------------------------|
| ws:open    | undefined                         | `websocket` 连接建立后触发。                   |
| ws:message | Websocket MessageEvent            | `websocket` 接收到服务端的 `messages`后触发。     |
| ws:close   | undefined                         | `websocket` 断开后触发。                     |
| tts:begin  | 同 `SentenceBegin` 事件              | 收到 `SentenceBegin` 事件后触发。              |
| tts:change | 同 `TranscriptionResultChanged` 事件 | 收到 `TranscriptionResultChanged` 事件后触发。 |
| tts:end    | 同 `SentenceEnd` 事件                | 收到 `SentenceEnd` 事件后触发。                |
| tts:stop   | 同 `TranscriptionCompleted` 事件     | 收到 `TranscriptionCompleted` 事件后触发。     |
| ready      | undefined                         | 成功调用麦克风后触发。                            |

## Thanks

一些代码片段参考了这篇文章: https://juejin.cn/post/7028003824912564231, 非常感谢！
