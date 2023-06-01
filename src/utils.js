function floatTo16BitPCM(bytes) {
  let offset = 0
  const dataLen = bytes.length
  const buffer = new ArrayBuffer(dataLen * 2)
  const data = new DataView(buffer)

  for (let i = 0; i < bytes.length; i++, offset += 2) {
    let s = Math.max(-1, Math.min(1, bytes[i]))
    data.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true)
  }
  return data
}

export function compress(data, inputSampleRate, outputSampleRate) {
  const rate = inputSampleRate / outputSampleRate
  const compression = Math.max(rate, 1)
  const length = Math.floor(data.length / rate)
  const result = new Float32Array(length)
  let index = 0
  let j = 0
  while (index < length) {
    let temp = Math.floor(j)
    result[index] = data[temp]
    index++
    j += compression
  }
  return floatTo16BitPCM(result)
}

export function get32HEX() {
  let str = '';
  for (let i = 0; i < 32; i++) {
    const index = Math.floor(Math.random() * 100) % 16;
    str += index.toString(16);
  }
  return str;
}
