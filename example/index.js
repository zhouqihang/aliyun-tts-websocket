(function () {
  const btn = document.getElementById('btn');
  const stopBtn = document.getElementById('btn_stop');
  const content = document.getElementById('content');

  let ws = null;
  btn.addEventListener('click', function () {
    console.log('click');
    ws = new AliyunTtsWebSocket({
      ws: `wss://nls-gateway.cn-shanghai.aliyuncs.com/ws/v1?token=put your token here`,
      ttsHeaders: {
        appkey: 'put your appkey here'
      }
    });
    ws.start();
    ws.addEventListener('tts:change', function (data) {
      console.log(data);
      content.innerHTML = data.detail.payload.result
    })
    ws.addEventListener('tts:end', function () {
      ws.stop();
    })
  })

  stopBtn.addEventListener('click', function () {
    ws.stop();
  })
})();
