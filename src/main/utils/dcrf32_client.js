'use strict'

function hexToString(hex) {
  let inData = hex.split('')
  let outData = ''
  let i, high, low

  for (i = 0; i < inData.length / 2; ++i) {
    switch (inData[i * 2]) {
      case '0': { high = 0; break; }
      case '1': { high = 1; break; }
      case '2': { high = 2; break; }
      case '3': { high = 3; break; }
      case '4': { high = 4; break; }
      case '5': { high = 5; break; }
      case '6': { high = 6; break; }
      case '7': { high = 7; break; }
      case '8': { high = 8; break; }
      case '9': { high = 9; break; }
      case 'A': { high = 10; break; }
      case 'B': { high = 11; break; }
      case 'C': { high = 12; break; }
      case 'D': { high = 13; break; }
      case 'E': { high = 14; break; }
      case 'F': { high = 15; break; }
      case 'a': { high = 10; break; }
      case 'b': { high = 11; break; }
      case 'c': { high = 12; break; }
      case 'd': { high = 13; break; }
      case 'e': { high = 14; break; }
      case 'f': { high = 15; break; }
      default: { return outData; }
    }
    switch (inData[i * 2 + 1]) {
      case '0': { low = 0; break; }
      case '1': { low = 1; break; }
      case '2': { low = 2; break; }
      case '3': { low = 3; break; }
      case '4': { low = 4; break; }
      case '5': { low = 5; break; }
      case '6': { low = 6; break; }
      case '7': { low = 7; break; }
      case '8': { low = 8; break; }
      case '9': { low = 9; break; }
      case 'A': { low = 10; break; }
      case 'B': { low = 11; break; }
      case 'C': { low = 12; break; }
      case 'D': { low = 13; break; }
      case 'E': { low = 14; break; }
      case 'F': { low = 15; break; }
      case 'a': { low = 10; break; }
      case 'b': { low = 11; break; }
      case 'c': { low = 12; break; }
      case 'd': { low = 13; break; }
      case 'e': { low = 14; break; }
      case 'f': { low = 15; break; }
      default: { return outData; }
    }
    outData += String.fromCharCode(high * 16 + low)
  }

  return outData
}

let ws

async function openWs(url, timeMs) {
  if (typeof (ws) !== 'undefined') {
    return false
  }

  try {
    ws = new WebSocket(url)
  } catch (error) {
    return false
  }

  let onopen = new Promise((resolve) => {
    ws.onopen = function (evt) {
      return resolve(true)
    }
  })

  let onclose = new Promise((resolve) => {
    ws.onclose = function (evt) {
      return resolve(false)
    }
  })

  let onmessage = new Promise((resolve) => {
    ws.onmessage = function (evt) {
      return resolve(false)
    }
  })

  let onerror = new Promise((resolve) => {
    ws.onerror = function (evt) {
      return resolve(false)
    }
  })

  let timeout = new Promise((resolve) => {
    setTimeout(function () {
      return resolve(false)
    }, timeMs)
  })

  await Promise.race([onopen, onclose, onmessage, onerror, timeout])

  ws.onopen = undefined
  ws.onclose = undefined
  ws.onmessage = undefined
  ws.onerror = undefined

  if (ws.readyState !== WebSocket.OPEN) {
    ws.close()
    ws = undefined
    return false
  }

  return true
}

async function closeWs() {
  if (typeof (ws) === 'undefined') {
    return
  }

  ws.close()
  ws = undefined
}

async function ReadMessage(timeMs) {
  if (typeof (ws) === 'undefined') {
    return
  }

  let onopen = new Promise((resolve) => {
    ws.onopen = function (evt) {
      return resolve(undefined)
    }
  })

  let onclose = new Promise((resolve) => {
    ws.onclose = function (evt) {
      return resolve(undefined)
    }
  })

  let onmessage = new Promise((resolve) => {
    ws.onmessage = function (evt) {
      return resolve(evt.data)
    }
  })

  let onerror = new Promise((resolve) => {
    ws.onerror = function (evt) {
      return resolve(undefined)
    }
  })

  let timeout = new Promise((resolve) => {
    setTimeout(function () {
      return resolve(undefined)
    }, timeMs)
  })

  let result = await Promise.race([onopen, onclose, onmessage, onerror, timeout])

  ws.onopen = undefined
  ws.onclose = undefined
  ws.onmessage = undefined
  ws.onerror = undefined

  return result
}

async function WriteMessage(msg) {
  if (typeof (ws) === 'undefined') {
    return false
  }

  try {
    ws.send(msg)
  } catch (error) {
    return false
  }

  return true
}

async function callDcrf32(data, timeMs) {
  let result

  result = await WriteMessage(data)
  if (!result) {
    return
  }

  return await ReadMessage(timeMs)
}

async function LibMain(flag, context) {
  let result = new Array()
  let inStr, outStr
  let obj

  inStr = '{"func":"LibMain","in":["' + flag.toString() + '","' + context + '"]}'
  outStr = await callDcrf32(inStr, 10000)
  if (typeof (outStr) === 'undefined') {
    return
  }

  try {
    obj = JSON.parse(outStr)
  } catch (error) {
    return
  }

  result[0] = obj.out[0]

  return result
}

async function dc_config_port_name(port, name) {
  let inStr, outStr
  let obj

  inStr = '{"func":"dc_config_port_name","in":["' + port.toString() + '","' + name + '"]}'
  outStr = await callDcrf32(inStr, 10000)
  if (typeof (outStr) === 'undefined') {
    return
  }

  try {
    obj = JSON.parse(outStr)
  } catch (error) {
    return
  }
}

async function dc_init(port, baud) {
  let result = new Array()
  let inStr, outStr
  let obj

  inStr = '{"func":"dc_init","in":["' + port.toString() + '","' + baud.toString() + '"]}'
  outStr = await callDcrf32(inStr, 10000)
  if (typeof (outStr) === 'undefined') {
    return
  }

  try {
    obj = JSON.parse(outStr)
  } catch (error) {
    return
  }

  result[0] = parseInt(obj.result)

  return result
}

async function dc_init_name(port, baud, name) {
  let result = new Array()
  let inStr, outStr
  let obj

  inStr = '{"func":"dc_init_name","in":["' + port.toString() + '","' + baud.toString() + '","' + name + '"]}'
  outStr = await callDcrf32(inStr, 10000)
  if (typeof (outStr) === 'undefined') {
    return
  }

  try {
    obj = JSON.parse(outStr)
  } catch (error) {
    return
  }

  result[0] = parseInt(obj.result)

  return result
}

async function dc_exit(icdev) {
  let result = new Array()
  let inStr, outStr
  let obj

  inStr = '{"func":"dc_exit","in":["' + icdev.toString() + '"]}'
  outStr = await callDcrf32(inStr, 10000)
  if (typeof (outStr) === 'undefined') {
    return
  }

  try {
    obj = JSON.parse(outStr)
  } catch (error) {
    return
  }

  result[0] = parseInt(obj.result)

  return result
}

async function dc_beep(icdev, _Msec) {
  let result = new Array()
  let inStr, outStr
  let obj

  inStr = '{"func":"dc_beep","in":["' + icdev.toString() + '","' + _Msec.toString() + '"]}'
  outStr = await callDcrf32(inStr, _Msec * 10 + 10000)
  if (typeof (outStr) === 'undefined') {
    return
  }

  try {
    obj = JSON.parse(outStr)
  } catch (error) {
    return
  }

  result[0] = parseInt(obj.result)

  return result
}

async function dc_getver(icdev) {
  let result = new Array()
  let inStr, outStr
  let obj

  inStr = '{"func":"dc_getver","in":["' + icdev.toString() + '"]}'
  outStr = await callDcrf32(inStr, 10000)
  if (typeof (outStr) === 'undefined') {
    return
  }

  try {
    obj = JSON.parse(outStr)
  } catch (error) {
    return
  }

  result[0] = parseInt(obj.result)
  if (result[0] === 0) {
    result[1] = obj.out[0]
  }

  return result
}

async function dc_ctlled(icdev, cLed, cOpenFlag) {
  let result = new Array()
  let inStr, outStr
  let obj

  inStr = '{"func":"dc_ctlled","in":["' + icdev.toString() + '","' + cLed.toString() + '","' + cOpenFlag.toString() + '"]}'
  outStr = await callDcrf32(inStr, 10000)
  if (typeof (outStr) === 'undefined') {
    return
  }

  try {
    obj = JSON.parse(outStr)
  } catch (error) {
    return
  }

  result[0] = parseInt(obj.result)

  return result
}

async function dc_srd_eeprom(icdev, offset, length) {
  let result = new Array()
  let inStr, outStr
  let obj

  inStr = '{"func":"dc_srd_eeprom","in":["' + icdev.toString() + '","' + offset.toString() + '","' + length.toString() + '"]}'
  outStr = await callDcrf32(inStr, 10000)
  if (typeof (outStr) === 'undefined') {
    return
  }

  try {
    obj = JSON.parse(outStr)
  } catch (error) {
    return
  }

  result[0] = parseInt(obj.result)
  if (result[0] === 0) {
    result[1] = obj.out[0]
  }

  return result
}

async function dc_swr_eeprom(icdev, offset, length, send_buffer) {
  let result = new Array()
  let inStr, outStr
  let obj

  inStr = '{"func":"dc_swr_eeprom","in":["' + icdev.toString() + '","' + offset.toString() + '","' + length.toString() + '","' + send_buffer + '"]}'
  outStr = await callDcrf32(inStr, 10000)
  if (typeof (outStr) === 'undefined') {
    return
  }

  try {
    obj = JSON.parse(outStr)
  } catch (error) {
    return
  }

  result[0] = parseInt(obj.result)

  return result
}

async function dc_load_key(icdev, _Mode, _SecNr, _NKey) {
  let result = new Array()
  let inStr, outStr
  let obj

  inStr = '{"func":"dc_load_key","in":["' + icdev.toString() + '","' + _Mode.toString() + '","' + _SecNr.toString() + '","' + _NKey + '"]}'
  outStr = await callDcrf32(inStr, 10000)
  if (typeof (outStr) === 'undefined') {
    return
  }

  try {
    obj = JSON.parse(outStr)
  } catch (error) {
    return
  }

  result[0] = parseInt(obj.result)

  return result
}

async function dc_startreadmag(icdev) {
  let result = new Array()
  let inStr, outStr
  let obj

  inStr = '{"func":"dc_startreadmag","in":["' + icdev.toString() + '"]}'
  outStr = await callDcrf32(inStr, 10000)
  if (typeof (outStr) === 'undefined') {
    return
  }

  try {
    obj = JSON.parse(outStr)
  } catch (error) {
    return
  }

  result[0] = parseInt(obj.result)

  return result
}

async function dc_stopreadmag(icdev) {
  let result = new Array()
  let inStr, outStr
  let obj

  inStr = '{"func":"dc_stopreadmag","in":["' + icdev.toString() + '"]}'
  outStr = await callDcrf32(inStr, 10000)
  if (typeof (outStr) === 'undefined') {
    return
  }

  try {
    obj = JSON.parse(outStr)
  } catch (error) {
    return
  }

  result[0] = parseInt(obj.result)

  return result
}

async function dc_readmag(icdev) {
  let result = new Array()
  let inStr, outStr
  let obj

  inStr = '{"func":"dc_readmag","in":["' + icdev.toString() + '"]}'
  outStr = await callDcrf32(inStr, 10000)
  if (typeof (outStr) === 'undefined') {
    return
  }

  try {
    obj = JSON.parse(outStr)
  } catch (error) {
    return
  }

  result[0] = parseInt(obj.result)
  if (result[0] === 0) {
    result[1] = obj.out[0]
    result[2] = parseInt(obj.out[1])
    result[3] = obj.out[2]
    result[4] = parseInt(obj.out[3])
    result[5] = obj.out[4]
    result[6] = parseInt(obj.out[5])
  }

  return result
}

async function dc_setcpu(icdev, _Byte) {
  let result = new Array()
  let inStr, outStr
  let obj

  inStr = '{"func":"dc_setcpu","in":["' + icdev.toString() + '","' + _Byte.toString() + '"]}'
  outStr = await callDcrf32(inStr, 10000)
  if (typeof (outStr) === 'undefined') {
    return
  }

  try {
    obj = JSON.parse(outStr)
  } catch (error) {
    return
  }

  result[0] = parseInt(obj.result)

  return result
}

async function dc_cpureset(icdev) {
  let result = new Array()
  let inStr, outStr
  let obj

  inStr = '{"func":"dc_cpureset","in":["' + icdev.toString() + '"]}'
  outStr = await callDcrf32(inStr, 10000)
  if (typeof (outStr) === 'undefined') {
    return
  }

  try {
    obj = JSON.parse(outStr)
  } catch (error) {
    return
  }

  result[0] = parseInt(obj.result)
  if (result[0] === 0) {
    result[1] = parseInt(obj.out[0])
    result[2] = obj.out[1]
  }

  return result
}

async function dc_cpuapduInt(icdev, slen, sendbuffer) {
  let result = new Array()
  let inStr, outStr
  let obj

  inStr = '{"func":"dc_cpuapduInt","in":["' + icdev.toString() + '","' + slen.toString() + '","' + sendbuffer + '"]}'
  outStr = await callDcrf32(inStr, 100000)
  if (typeof (outStr) === 'undefined') {
    return
  }

  try {
    obj = JSON.parse(outStr)
  } catch (error) {
    return
  }

  result[0] = parseInt(obj.result)
  if (result[0] === 0) {
    result[1] = parseInt(obj.out[0])
    result[2] = obj.out[1]
  }

  return result
}

async function dc_reset(icdev, _Msec) {
  let result = new Array()
  let inStr, outStr
  let obj

  inStr = '{"func":"dc_reset","in":["' + icdev.toString() + '","' + _Msec.toString() + '"]}'
  outStr = await callDcrf32(inStr, _Msec * 10 + 10000)
  if (typeof (outStr) === 'undefined') {
    return
  }

  try {
    obj = JSON.parse(outStr)
  } catch (error) {
    return
  }

  result[0] = parseInt(obj.result)

  return result
}

async function dc_config_card(icdev, cardtype) {
  let result = new Array()
  let inStr, outStr
  let obj

  inStr = '{"func":"dc_config_card","in":["' + icdev.toString() + '","' + cardtype.toString() + '"]}'
  outStr = await callDcrf32(inStr, 10000)
  if (typeof (outStr) === 'undefined') {
    return
  }

  try {
    obj = JSON.parse(outStr)
  } catch (error) {
    return
  }

  result[0] = parseInt(obj.result)

  return result
}

async function dc_card_n(icdev, _Mode) {
  let result = new Array()
  let inStr, outStr
  let obj

  inStr = '{"func":"dc_card_n","in":["' + icdev.toString() + '","' + _Mode.toString() + '"]}'
  outStr = await callDcrf32(inStr, 10000)
  if (typeof (outStr) === 'undefined') {
    return
  }

  try {
    obj = JSON.parse(outStr)
  } catch (error) {
    return
  }

  result[0] = parseInt(obj.result)
  if (result[0] === 0) {
    result[1] = parseInt(obj.out[0])
    result[2] = obj.out[1]
  }

  return result
}

async function dc_pro_resetInt(icdev) {
  let result = new Array()
  let inStr, outStr
  let obj

  inStr = '{"func":"dc_pro_resetInt","in":["' + icdev.toString() + '"]}'
  outStr = await callDcrf32(inStr, 10000)
  if (typeof (outStr) === 'undefined') {
    return
  }

  try {
    obj = JSON.parse(outStr)
  } catch (error) {
    return
  }

  result[0] = parseInt(obj.result)
  if (result[0] === 0) {
    result[1] = parseInt(obj.out[0])
    result[2] = obj.out[1]
  }

  return result
}

async function dc_pro_commandlinkInt(icdev, slen, sendbuffer, timeout) {
  let result = new Array()
  let inStr, outStr
  let obj

  inStr = '{"func":"dc_pro_commandlinkInt","in":["' + icdev.toString() + '","' + slen.toString() + '","' + sendbuffer + '","' + timeout.toString() + '"]}'
  outStr = await callDcrf32(inStr, timeout * 250 + 10000)
  if (typeof (outStr) === 'undefined') {
    return
  }

  try {
    obj = JSON.parse(outStr)
  } catch (error) {
    return
  }

  result[0] = parseInt(obj.result)
  if (result[0] === 0) {
    result[1] = parseInt(obj.out[0])
    result[2] = obj.out[1]
  }

  return result
}

async function dc_card_b(icdev) {
  let result = new Array()
  let inStr, outStr
  let obj

  inStr = '{"func":"dc_card_b","in":["' + icdev.toString() + '"]}'
  outStr = await callDcrf32(inStr, 10000)
  if (typeof (outStr) === 'undefined') {
    return
  }

  try {
    obj = JSON.parse(outStr)
  } catch (error) {
    return
  }

  result[0] = parseInt(obj.result)
  if (result[0] === 0) {
    result[1] = obj.out[0]
  }

  return result
}

async function dc_authentication_pass(icdev, _Mode, _Addr, passbuff) {
  let result = new Array()
  let inStr, outStr
  let obj

  inStr = '{"func":"dc_authentication_pass","in":["' + icdev.toString() + '","' + _Mode.toString() + '","' + _Addr.toString() + '","' + passbuff + '"]}'
  outStr = await callDcrf32(inStr, 10000)
  if (typeof (outStr) === 'undefined') {
    return
  }

  try {
    obj = JSON.parse(outStr)
  } catch (error) {
    return
  }

  result[0] = parseInt(obj.result)

  return result
}

async function dc_read(icdev, _Adr) {
  let result = new Array()
  let inStr, outStr
  let obj

  inStr = '{"func":"dc_read","in":["' + icdev.toString() + '","' + _Adr.toString() + '"]}'
  outStr = await callDcrf32(inStr, 10000)
  if (typeof (outStr) === 'undefined') {
    return
  }

  try {
    obj = JSON.parse(outStr)
  } catch (error) {
    return
  }

  result[0] = parseInt(obj.result)
  if (result[0] === 0) {
    result[1] = obj.out[0]
  }

  return result
}

async function dc_write(icdev, _Adr, _Data) {
  let result = new Array()
  let inStr, outStr
  let obj

  inStr = '{"func":"dc_write","in":["' + icdev.toString() + '","' + _Adr.toString() + '","' + _Data + '"]}'
  outStr = await callDcrf32(inStr, 10000)
  if (typeof (outStr) === 'undefined') {
    return
  }

  try {
    obj = JSON.parse(outStr)
  } catch (error) {
    return
  }

  result[0] = parseInt(obj.result)

  return result
}

async function dc_initval(icdev, _Adr, _Value) {
  let result = new Array()
  let inStr, outStr
  let obj

  inStr = '{"func":"dc_initval","in":["' + icdev.toString() + '","' + _Adr.toString() + '","' + _Value.toString() + '"]}'
  outStr = await callDcrf32(inStr, 10000)
  if (typeof (outStr) === 'undefined') {
    return
  }

  try {
    obj = JSON.parse(outStr)
  } catch (error) {
    return
  }

  result[0] = parseInt(obj.result)

  return result
}

async function dc_increment(icdev, _Adr, _Value) {
  let result = new Array()
  let inStr, outStr
  let obj

  inStr = '{"func":"dc_increment","in":["' + icdev.toString() + '","' + _Adr.toString() + '","' + _Value.toString() + '"]}'
  outStr = await callDcrf32(inStr, 10000)
  if (typeof (outStr) === 'undefined') {
    return
  }

  try {
    obj = JSON.parse(outStr)
  } catch (error) {
    return
  }

  result[0] = parseInt(obj.result)

  return result
}

async function dc_decrement(icdev, _Adr, _Value) {
  let result = new Array()
  let inStr, outStr
  let obj

  inStr = '{"func":"dc_decrement","in":["' + icdev.toString() + '","' + _Adr.toString() + '","' + _Value.toString() + '"]}'
  outStr = await callDcrf32(inStr, 10000)
  if (typeof (outStr) === 'undefined') {
    return
  }

  try {
    obj = JSON.parse(outStr)
  } catch (error) {
    return
  }

  result[0] = parseInt(obj.result)

  return result
}

async function dc_readval(icdev, _Adr) {
  let result = new Array()
  let inStr, outStr
  let obj

  inStr = '{"func":"dc_readval","in":["' + icdev.toString() + '","' + _Adr.toString() + '"]}'
  outStr = await callDcrf32(inStr, 10000)
  if (typeof (outStr) === 'undefined') {
    return
  }

  try {
    obj = JSON.parse(outStr)
  } catch (error) {
    return
  }

  result[0] = parseInt(obj.result)
  if (result[0] === 0) {
    result[1] = parseInt(obj.out[0])
  }

  return result
}

async function dc_write_24c(icdev, offset, length, snd_buffer) {
  let result = new Array()
  let inStr, outStr
  let obj

  inStr = '{"func":"dc_write_24c","in":["' + icdev.toString() + '","' + offset.toString() + '","' + length.toString() + '","' + snd_buffer + '"]}'
  outStr = await callDcrf32(inStr, 10000)
  if (typeof (outStr) === 'undefined') {
    return
  }

  try {
    obj = JSON.parse(outStr)
  } catch (error) {
    return
  }

  result[0] = parseInt(obj.result)

  return result
}

async function dc_read_24c(icdev, offset, length) {
  let result = new Array()
  let inStr, outStr
  let obj

  inStr = '{"func":"dc_read_24c","in":["' + icdev.toString() + '","' + offset.toString() + '","' + length.toString() + '"]}'
  outStr = await callDcrf32(inStr, 10000)
  if (typeof (outStr) === 'undefined') {
    return
  }

  try {
    obj = JSON.parse(outStr)
  } catch (error) {
    return
  }

  result[0] = parseInt(obj.result)
  if (result[0] === 0) {
    result[1] = obj.out[0]
  }

  return result
}

async function dc_write_24c64(icdev, offset, length, snd_buffer) {
  let result = new Array()
  let inStr, outStr
  let obj

  inStr = '{"func":"dc_write_24c64","in":["' + icdev.toString() + '","' + offset.toString() + '","' + length.toString() + '","' + snd_buffer + '"]}'
  outStr = await callDcrf32(inStr, 10000)
  if (typeof (outStr) === 'undefined') {
    return
  }

  try {
    obj = JSON.parse(outStr)
  } catch (error) {
    return
  }

  result[0] = parseInt(obj.result)

  return result
}

async function dc_read_24c64(icdev, offset, length) {
  let result = new Array()
  let inStr, outStr
  let obj

  inStr = '{"func":"dc_read_24c64","in":["' + icdev.toString() + '","' + offset.toString() + '","' + length.toString() + '"]}'
  outStr = await callDcrf32(inStr, 10000)
  if (typeof (outStr) === 'undefined') {
    return
  }

  try {
    obj = JSON.parse(outStr)
  } catch (error) {
    return
  }

  result[0] = parseInt(obj.result)
  if (result[0] === 0) {
    result[1] = obj.out[0]
  }

  return result
}

async function dc_verifypin_4442(icdev, passwd) {
  let result = new Array()
  let inStr, outStr
  let obj

  inStr = '{"func":"dc_verifypin_4442","in":["' + icdev.toString() + '","' + passwd + '"]}'
  outStr = await callDcrf32(inStr, 10000)
  if (typeof (outStr) === 'undefined') {
    return
  }

  try {
    obj = JSON.parse(outStr)
  } catch (error) {
    return
  }

  result[0] = parseInt(obj.result)

  return result
}

async function dc_read_4442(icdev, offset, length) {
  let result = new Array()
  let inStr, outStr
  let obj

  inStr = '{"func":"dc_read_4442","in":["' + icdev.toString() + '","' + offset.toString() + '","' + length.toString() + '"]}'
  outStr = await callDcrf32(inStr, 10000)
  if (typeof (outStr) === 'undefined') {
    return
  }

  try {
    obj = JSON.parse(outStr)
  } catch (error) {
    return
  }

  result[0] = parseInt(obj.result)
  if (result[0] === 0) {
    result[1] = obj.out[0]
  }

  return result
}

async function dc_write_4442(icdev, offset, length, data_buffer) {
  let result = new Array()
  let inStr, outStr
  let obj

  inStr = '{"func":"dc_write_4442","in":["' + icdev.toString() + '","' + offset.toString() + '","' + length.toString() + '","' + data_buffer + '"]}'
  outStr = await callDcrf32(inStr, 10000)
  if (typeof (outStr) === 'undefined') {
    return
  }

  try {
    obj = JSON.parse(outStr)
  } catch (error) {
    return
  }

  result[0] = parseInt(obj.result)

  return result
}

async function dc_readprotect_4442(icdev, offset, length) {
  let result = new Array()
  let inStr, outStr
  let obj

  inStr = '{"func":"dc_readprotect_4442","in":["' + icdev.toString() + '","' + offset.toString() + '","' + length.toString() + '"]}'
  outStr = await callDcrf32(inStr, 10000)
  if (typeof (outStr) === 'undefined') {
    return
  }

  try {
    obj = JSON.parse(outStr)
  } catch (error) {
    return
  }

  result[0] = parseInt(obj.result)
  if (result[0] === 0) {
    result[1] = obj.out[0]
  }

  return result
}

async function dc_writeprotect_4442(icdev, offset, length, data_buffer) {
  let result = new Array()
  let inStr, outStr
  let obj

  inStr = '{"func":"dc_writeprotect_4442","in":["' + icdev.toString() + '","' + offset.toString() + '","' + length.toString() + '","' + data_buffer + '"]}'
  outStr = await callDcrf32(inStr, 10000)
  if (typeof (outStr) === 'undefined') {
    return
  }

  try {
    obj = JSON.parse(outStr)
  } catch (error) {
    return
  }

  result[0] = parseInt(obj.result)

  return result
}

async function dc_verifypin_4428(icdev, passwd) {
  let result = new Array()
  let inStr, outStr
  let obj

  inStr = '{"func":"dc_verifypin_4428","in":["' + icdev.toString() + '","' + passwd + '"]}'
  outStr = await callDcrf32(inStr, 10000)
  if (typeof (outStr) === 'undefined') {
    return
  }

  try {
    obj = JSON.parse(outStr)
  } catch (error) {
    return
  }

  result[0] = parseInt(obj.result)

  return result
}

async function dc_read_4428(icdev, offset, length) {
  let result = new Array()
  let inStr, outStr
  let obj

  inStr = '{"func":"dc_read_4428","in":["' + icdev.toString() + '","' + offset.toString() + '","' + length.toString() + '"]}'
  outStr = await callDcrf32(inStr, 10000)
  if (typeof (outStr) === 'undefined') {
    return
  }

  try {
    obj = JSON.parse(outStr)
  } catch (error) {
    return
  }

  result[0] = parseInt(obj.result)
  if (result[0] === 0) {
    result[1] = obj.out[0]
  }

  return result
}

async function dc_write_4428(icdev, offset, length, data_buffer) {
  let result = new Array()
  let inStr, outStr
  let obj

  inStr = '{"func":"dc_write_4428","in":["' + icdev.toString() + '","' + offset.toString() + '","' + length.toString() + '","' + data_buffer + '"]}'
  outStr = await callDcrf32(inStr, 10000)
  if (typeof (outStr) === 'undefined') {
    return
  }

  try {
    obj = JSON.parse(outStr)
  } catch (error) {
    return
  }

  result[0] = parseInt(obj.result)

  return result
}

async function dc_readprotect_4428(icdev, offset, length) {
  let result = new Array()
  let inStr, outStr
  let obj

  inStr = '{"func":"dc_readprotect_4428","in":["' + icdev.toString() + '","' + offset.toString() + '","' + length.toString() + '"]}'
  outStr = await callDcrf32(inStr, 10000)
  if (typeof (outStr) === 'undefined') {
    return
  }

  try {
    obj = JSON.parse(outStr)
  } catch (error) {
    return
  }

  result[0] = parseInt(obj.result)
  if (result[0] === 0) {
    result[1] = obj.out[0]
  }

  return result
}

async function dc_writeprotect_4428(icdev, offset, length, data_buffer) {
  let result = new Array()
  let inStr, outStr
  let obj

  inStr = '{"func":"dc_writeprotect_4428","in":["' + icdev.toString() + '","' + offset.toString() + '","' + length.toString() + '","' + data_buffer + '"]}'
  outStr = await callDcrf32(inStr, 10000)
  if (typeof (outStr) === 'undefined') {
    return
  }

  try {
    obj = JSON.parse(outStr)
  } catch (error) {
    return
  }

  result[0] = parseInt(obj.result)

  return result
}

async function dc_get_idsnr(icdev) {
  let result = new Array()
  let inStr, outStr
  let obj

  inStr = '{"func":"dc_get_idsnr","in":["' + icdev.toString() + '"]}'
  outStr = await callDcrf32(inStr, 10000)
  if (typeof (outStr) === 'undefined') {
    return
  }

  try {
    obj = JSON.parse(outStr)
  } catch (error) {
    return
  }

  result[0] = parseInt(obj.result)
  if (result[0] === 0) {
    result[1] = obj.out[0]
  }

  return result
}

async function dc_SamAReadSerialNumber(icdev) {
  let result = new Array()
  let inStr, outStr
  let obj

  inStr = '{"func":"dc_SamAReadSerialNumber","in":["' + icdev.toString() + '"]}'
  outStr = await callDcrf32(inStr, 10000)
  if (typeof (outStr) === 'undefined') {
    return
  }

  try {
    obj = JSON.parse(outStr)
  } catch (error) {
    return
  }

  result[0] = parseInt(obj.result)
  if (result[0] === 0) {
    result[1] = obj.out[0]
  }

  return result
}

async function dc_SamAReadCardInfo(icdev, type) {
  let result = new Array()
  let inStr, outStr
  let obj

  inStr = '{"func":"dc_SamAReadCardInfo","in":["' + icdev.toString() + '","' + type.toString() + '"]}'
  outStr = await callDcrf32(inStr, 10000)
  if (typeof (outStr) === 'undefined') {
    return
  }

  try {
    obj = JSON.parse(outStr)
  } catch (error) {
    return
  }

  result[0] = parseInt(obj.result)
  if (result[0] === 0) {
    result[1] = parseInt(obj.out[0])
    result[2] = obj.out[1]
    result[3] = parseInt(obj.out[2])
    result[4] = obj.out[3]
    result[5] = parseInt(obj.out[4])
    result[6] = obj.out[5]
    result[7] = parseInt(obj.out[6])
    result[8] = obj.out[7]
  }

  return result
}

async function dc_ParseTextInfo(icdev, charset, info_len, info) {
  let result = new Array()
  let inStr, outStr
  let obj

  inStr = '{"func":"dc_ParseTextInfo","in":["' + icdev.toString() + '","' + charset.toString() + '","' + info_len.toString() + '","' + info + '"]}'
  outStr = await callDcrf32(inStr, 10000)
  if (typeof (outStr) === 'undefined') {
    return
  }

  try {
    obj = JSON.parse(outStr)
  } catch (error) {
    return
  }

  result[0] = parseInt(obj.result)
  if (result[0] === 0) {
    result[1] = obj.out[0]
    result[2] = obj.out[1]
    result[3] = obj.out[2]
    result[4] = obj.out[3]
    result[5] = obj.out[4]
    result[6] = obj.out[5]
    result[7] = obj.out[6]
    result[8] = obj.out[7]
    result[9] = obj.out[8]
    result[10] = obj.out[9]
  }

  return result
}

async function dc_ParseTextInfoForForeigner(icdev, charset, info_len, info) {
  let result = new Array()
  let inStr, outStr
  let obj

  inStr = '{"func":"dc_ParseTextInfoForForeigner","in":["' + icdev.toString() + '","' + charset.toString() + '","' + info_len.toString() + '","' + info + '"]}'
  outStr = await callDcrf32(inStr, 10000)
  if (typeof (outStr) === 'undefined') {
    return
  }

  try {
    obj = JSON.parse(outStr)
  } catch (error) {
    return
  }

  result[0] = parseInt(obj.result)
  if (result[0] === 0) {
    result[1] = obj.out[0]
    result[2] = obj.out[1]
    result[3] = obj.out[2]
    result[4] = obj.out[3]
    result[5] = obj.out[4]
    result[6] = obj.out[5]
    result[7] = obj.out[6]
    result[8] = obj.out[7]
    result[9] = obj.out[8]
    result[10] = obj.out[9]
    result[11] = obj.out[10]
    result[12] = obj.out[11]
  }

  return result
}

async function dc_ParseTextInfoForHkMoTw(icdev, charset, info_len, info) {
  let result = new Array()
  let inStr, outStr
  let obj

  inStr = '{"func":"dc_ParseTextInfoForHkMoTw","in":["' + icdev.toString() + '","' + charset.toString() + '","' + info_len.toString() + '","' + info + '"]}'
  outStr = await callDcrf32(inStr, 10000)
  if (typeof (outStr) === 'undefined') {
    return
  }

  try {
    obj = JSON.parse(outStr)
  } catch (error) {
    return
  }

  result[0] = parseInt(obj.result)
  if (result[0] === 0) {
    result[1] = obj.out[0]
    result[2] = obj.out[1]
    result[3] = obj.out[2]
    result[4] = obj.out[3]
    result[5] = obj.out[4]
    result[6] = obj.out[5]
    result[7] = obj.out[6]
    result[8] = obj.out[7]
    result[9] = obj.out[8]
    result[10] = obj.out[9]
    result[11] = obj.out[10]
    result[12] = obj.out[11]
    result[13] = obj.out[12]
    result[14] = obj.out[13]
  }

  return result
}

async function dc_ParsePhotoInfo(icdev, type, info_len, info, photo_len, photo) {
  let result = new Array()
  let inStr, outStr
  let obj

  inStr = '{"func":"dc_ParsePhotoInfo","in":["' + icdev.toString() + '","' + type.toString() + '","' + info_len.toString() + '","' + info + '","' + photo_len.toString() + '","' + photo + '"]}'
  outStr = await callDcrf32(inStr, 10000)
  if (typeof (outStr) === 'undefined') {
    return
  }

  try {
    obj = JSON.parse(outStr)
  } catch (error) {
    return
  }

  result[0] = parseInt(obj.result)
  if (result[0] === 0) {
    result[1] = parseInt(obj.out[0])
    result[2] = obj.out[1]
  }

  return result
}

async function dc_ParseOtherInfo(icdev, flag, in_info) {
  let result = new Array()
  let inStr, outStr
  let obj

  inStr = '{"func":"dc_ParseOtherInfo","in":["' + icdev.toString() + '","' + flag.toString() + '","' + in_info + '"]}'
  outStr = await callDcrf32(inStr, 10000)
  if (typeof (outStr) === 'undefined') {
    return
  }

  try {
    obj = JSON.parse(outStr)
  } catch (error) {
    return
  }

  result[0] = parseInt(obj.result)
  if (result[0] === 0) {
    result[1] = obj.out[0]
  }

  return result
}

async function dc_KeypadOpen(icdev, number) {
  let result = new Array()
  let inStr, outStr
  let obj

  inStr = '{"func":"dc_KeypadOpen","in":["' + icdev.toString() + '","' + number.toString() + '"]}'
  outStr = await callDcrf32(inStr, 10000)
  if (typeof (outStr) === 'undefined') {
    return
  }

  try {
    obj = JSON.parse(outStr)
  } catch (error) {
    return
  }

  result[0] = parseInt(obj.result)
  if (result[0] === 0) {
    result[1] = obj.out[0]
  }

  return result
}

async function dc_KeypadClose(icdev, number) {
  let result = new Array()
  let inStr, outStr
  let obj

  inStr = '{"func":"dc_KeypadClose","in":["' + icdev.toString() + '","' + number.toString() + '"]}'
  outStr = await callDcrf32(inStr, 10000)
  if (typeof (outStr) === 'undefined') {
    return
  }

  try {
    obj = JSON.parse(outStr)
  } catch (error) {
    return
  }

  result[0] = parseInt(obj.result)

  return result
}

async function dc_KeypadLoadKey(icdev, number, set_index, sub_index, type, mode, key_data, key_len, flag, ex_data, ex_len) {
  let result = new Array()
  let inStr, outStr
  let obj

  inStr = '{"func":"dc_KeypadLoadKey","in":["' + icdev.toString() + '","' + number.toString() + '","' + set_index.toString() + '","' + sub_index.toString() + '","' + type.toString() + '","' + mode.toString() + '","' + key_data + '","' + key_len.toString() + '","' + flag.toString() + '","' + ex_data + '","' + ex_len.toString() + '"]}'
  outStr = await callDcrf32(inStr, 10000)
  if (typeof (outStr) === 'undefined') {
    return
  }

  try {
    obj = JSON.parse(outStr)
  } catch (error) {
    return
  }

  result[0] = parseInt(obj.result)
  if (result[0] === 0) {
    result[1] = obj.out[0]
    result[2] = parseInt(obj.out[1])
  }

  return result
}

async function dc_KeypadClearKey(icdev, number, set_index, sub_index) {
  let result = new Array()
  let inStr, outStr
  let obj

  inStr = '{"func":"dc_KeypadClearKey","in":["' + icdev.toString() + '","' + number.toString() + '","' + set_index.toString() + '","' + sub_index.toString() + '"]}'
  outStr = await callDcrf32(inStr, 10000)
  if (typeof (outStr) === 'undefined') {
    return
  }

  try {
    obj = JSON.parse(outStr)
  } catch (error) {
    return
  }

  result[0] = parseInt(obj.result)

  return result
}

async function dc_KeypadGetKeyType(icdev, number, set_index, sub_index) {
  let result = new Array()
  let inStr, outStr
  let obj

  inStr = '{"func":"dc_KeypadGetKeyType","in":["' + icdev.toString() + '","' + number.toString() + '","' + set_index.toString() + '","' + sub_index.toString() + '"]}'
  outStr = await callDcrf32(inStr, 10000)
  if (typeof (outStr) === 'undefined') {
    return
  }

  try {
    obj = JSON.parse(outStr)
  } catch (error) {
    return
  }

  result[0] = parseInt(obj.result)
  if (result[0] === 0) {
    result[1] = parseInt(obj.out[0])
  }

  return result
}

async function dc_KeypadAlgorithm(icdev, number, set_index, sub_index, flag, mode, in_data, in_len) {
  let result = new Array()
  let inStr, outStr
  let obj

  inStr = '{"func":"dc_KeypadAlgorithm","in":["' + icdev.toString() + '","' + number.toString() + '","' + set_index.toString() + '","' + sub_index.toString() + '","' + flag.toString() + '","' + mode.toString() + '","' + in_data + '","' + in_len.toString() + '"]}'
  outStr = await callDcrf32(inStr, 10000)
  if (typeof (outStr) === 'undefined') {
    return
  }

  try {
    obj = JSON.parse(outStr)
  } catch (error) {
    return
  }

  result[0] = parseInt(obj.result)
  if (result[0] === 0) {
    result[1] = obj.out[0]
    result[2] = parseInt(obj.out[1])
  }

  return result
}

async function dc_KeypadStartInput(icdev, number, mode, set_index, sub_index, in_data, in_len, min_len, max_len, auto_end, enable_beep, time_s) {
  let result = new Array()
  let inStr, outStr
  let obj

  inStr = '{"func":"dc_KeypadStartInput","in":["' + icdev.toString() + '","' + number.toString() + '","' + mode.toString() + '","' + set_index.toString() + '","' + sub_index.toString() + '","' + in_data + '","' + in_len.toString() + '","' + min_len.toString() + '","' + max_len.toString() + '","' + auto_end.toString() + '","' + enable_beep.toString() + '","' + time_s.toString() + '"]}'
  outStr = await callDcrf32(inStr, 10000)
  if (typeof (outStr) === 'undefined') {
    return
  }

  try {
    obj = JSON.parse(outStr)
  } catch (error) {
    return
  }

  result[0] = parseInt(obj.result)
  if (result[0] === 0) {
    result[1] = obj.out[0]
    result[2] = parseInt(obj.out[1])
  }

  return result
}

async function dc_KeypadGetKeyValue(icdev, number) {
  let result = new Array()
  let inStr, outStr
  let obj

  inStr = '{"func":"dc_KeypadGetKeyValue","in":["' + icdev.toString() + '","' + number.toString() + '"]}'
  outStr = await callDcrf32(inStr, 10000)
  if (typeof (outStr) === 'undefined') {
    return
  }

  try {
    obj = JSON.parse(outStr)
  } catch (error) {
    return
  }

  result[0] = parseInt(obj.result)
  if (result[0] === 0) {
    result[1] = parseInt(obj.out[0])
  }

  return result
}

async function dc_KeypadExitAndGetInput(icdev, number, mode) {
  let result = new Array()
  let inStr, outStr
  let obj

  inStr = '{"func":"dc_KeypadExitAndGetInput","in":["' + icdev.toString() + '","' + number.toString() + '","' + mode.toString() + '"]}'
  outStr = await callDcrf32(inStr, 10000)
  if (typeof (outStr) === 'undefined') {
    return
  }

  try {
    obj = JSON.parse(outStr)
  } catch (error) {
    return
  }

  result[0] = parseInt(obj.result)
  if (result[0] === 0) {
    result[1] = obj.out[0]
    result[2] = parseInt(obj.out[1])
  }

  return result
}

async function dc_KeypadSetKeyValue(icdev, number, value) {
  let result = new Array()
  let inStr, outStr
  let obj

  inStr = '{"func":"dc_KeypadSetKeyValue","in":["' + icdev.toString() + '","' + number.toString() + '","' + value.toString() + '"]}'
  outStr = await callDcrf32(inStr, 10000)
  if (typeof (outStr) === 'undefined') {
    return
  }

  try {
    obj = JSON.parse(outStr)
  } catch (error) {
    return
  }

  result[0] = parseInt(obj.result)

  return result
}

async function dc_Scan2DBarcodeStart(icdev, mode) {
  let result = new Array()
  let inStr, outStr
  let obj

  inStr = '{"func":"dc_Scan2DBarcodeStart","in":["' + icdev.toString() + '","' + mode.toString() + '"]}'
  outStr = await callDcrf32(inStr, 10000)
  if (typeof (outStr) === 'undefined') {
    return
  }

  try {
    obj = JSON.parse(outStr)
  } catch (error) {
    return
  }

  result[0] = parseInt(obj.result)

  return result
}

async function dc_Scan2DBarcodeGetData(icdev) {
  let result = new Array()
  let inStr, outStr
  let obj

  inStr = '{"func":"dc_Scan2DBarcodeGetData","in":["' + icdev.toString() + '"]}'
  outStr = await callDcrf32(inStr, 10000)
  if (typeof (outStr) === 'undefined') {
    return
  }

  try {
    obj = JSON.parse(outStr)
  } catch (error) {
    return
  }

  result[0] = parseInt(obj.result)
  if (result[0] === 0) {
    result[1] = parseInt(obj.out[0])
    result[2] = obj.out[1]
  }

  return result
}

async function dc_Scan2DBarcodeExit(icdev) {
  let result = new Array()
  let inStr, outStr
  let obj

  inStr = '{"func":"dc_Scan2DBarcodeExit","in":["' + icdev.toString() + '"]}'
  outStr = await callDcrf32(inStr, 10000)
  if (typeof (outStr) === 'undefined') {
    return
  }

  try {
    obj = JSON.parse(outStr)
  } catch (error) {
    return
  }

  result[0] = parseInt(obj.result)

  return result
}

async function SD_IFD_GetVersion(icdev) {
  let result = new Array()
  let inStr, outStr
  let obj

  inStr = '{"func":"SD_IFD_GetVersion","in":["' + icdev.toString() + '"]}'
  outStr = await callDcrf32(inStr, 10000)
  if (typeof (outStr) === 'undefined') {
    return
  }

  try {
    obj = JSON.parse(outStr)
  } catch (error) {
    return
  }

  result[0] = parseInt(obj.result)
  if (result[0] === 0) {
    result[1] = obj.out[0]
  }

  return result
}

async function SD_IFD_PlayVoice(icdev, _playmode) {
  let result = new Array()
  let inStr, outStr
  let obj

  inStr = '{"func":"SD_IFD_PlayVoice","in":["' + icdev.toString() + '","' + _playmode.toString() + '"]}'
  outStr = await callDcrf32(inStr, 10000)
  if (typeof (outStr) === 'undefined') {
    return
  }

  try {
    obj = JSON.parse(outStr)
  } catch (error) {
    return
  }

  result[0] = parseInt(obj.result)

  return result
}

async function SD_IFD_LEDDisplay(icdev, line, row, leddata, timeout) {
  let result = new Array()
  let inStr, outStr
  let obj

  inStr = '{"func":"SD_IFD_LEDDisplay","in":["' + icdev.toString() + '","' + line.toString() + '","' + row.toString() + '","' + leddata + '","' + timeout.toString() + '"]}'
  outStr = await callDcrf32(inStr, 10000)
  if (typeof (outStr) === 'undefined') {
    return
  }

  try {
    obj = JSON.parse(outStr)
  } catch (error) {
    return
  }

  result[0] = parseInt(obj.result)

  return result
}

async function SD_IFD_SelecetDes(icdev, desmode) {
  let result = new Array()
  let inStr, outStr
  let obj

  inStr = '{"func":"SD_IFD_SelecetDes","in":["' + icdev.toString() + '","' + desmode.toString() + '"]}'
  outStr = await callDcrf32(inStr, 10000)
  if (typeof (outStr) === 'undefined') {
    return
  }

  try {
    obj = JSON.parse(outStr)
  } catch (error) {
    return
  }

  result[0] = parseInt(obj.result)

  return result
}

async function SD_IFD_SetMainKey(icdev, keyset, oldkey, newkey) {
  let result = new Array()
  let inStr, outStr
  let obj

  inStr = '{"func":"SD_IFD_SetMainKey","in":["' + icdev.toString() + '","' + keyset.toString() + '","' + oldkey + '","' + newkey + '"]}'
  outStr = await callDcrf32(inStr, 10000)
  if (typeof (outStr) === 'undefined') {
    return
  }

  try {
    obj = JSON.parse(outStr)
  } catch (error) {
    return
  }

  result[0] = parseInt(obj.result)

  return result
}

async function SD_IFD_SetWorkKey(icdev, keysetmain, keysetwork, enkeywork) {
  let result = new Array()
  let inStr, outStr
  let obj

  inStr = '{"func":"SD_IFD_SetWorkKey","in":["' + icdev.toString() + '","' + keysetmain.toString() + '","' + keysetwork.toString() + '","' + enkeywork + '"]}'
  outStr = await callDcrf32(inStr, 10000)
  if (typeof (outStr) === 'undefined') {
    return
  }

  try {
    obj = JSON.parse(outStr)
  } catch (error) {
    return
  }

  result[0] = parseInt(obj.result)

  return result
}

async function SD_IFD_Init(icdev) {
  let result = new Array()
  let inStr, outStr
  let obj

  inStr = '{"func":"SD_IFD_Init","in":["' + icdev.toString() + '"]}'
  outStr = await callDcrf32(inStr, 10000)
  if (typeof (outStr) === 'undefined') {
    return
  }

  try {
    obj = JSON.parse(outStr)
  } catch (error) {
    return
  }

  result[0] = parseInt(obj.result)

  return result
}

async function SD_IFD_ActWorkKey(icdev, keysetmain, keysetwork) {
  let result = new Array()
  let inStr, outStr
  let obj

  inStr = '{"func":"SD_IFD_ActWorkKey","in":["' + icdev.toString() + '","' + keysetmain.toString() + '","' + keysetwork.toString() + '"]}'
  outStr = await callDcrf32(inStr, 10000)
  if (typeof (outStr) === 'undefined') {
    return
  }

  try {
    obj = JSON.parse(outStr)
  } catch (error) {
    return
  }

  result[0] = parseInt(obj.result)

  return result
}

async function SD_IFD_DesCaculate(icdev, srclen, srcdata, flag) {
  let result = new Array()
  let inStr, outStr
  let obj

  inStr = '{"func":"SD_IFD_DesCaculate","in":["' + icdev.toString() + '","' + srclen.toString() + '","' + srcdata + '","' + flag.toString() + '"]}'
  outStr = await callDcrf32(inStr, 10000)
  if (typeof (outStr) === 'undefined') {
    return
  }

  try {
    obj = JSON.parse(outStr)
  } catch (error) {
    return
  }

  result[0] = parseInt(obj.result)
  if (result[0] === 0) {
    result[1] = obj.out[0]
  }

  return result
}

async function SD_IFD_CreateMac(icdev, srclen, srcdata) {
  let result = new Array()
  let inStr, outStr
  let obj

  inStr = '{"func":"SD_IFD_CreateMac","in":["' + icdev.toString() + '","' + srclen.toString() + '","' + srcdata + '"]}'
  outStr = await callDcrf32(inStr, 10000)
  if (typeof (outStr) === 'undefined') {
    return
  }

  try {
    obj = JSON.parse(outStr)
  } catch (error) {
    return
  }

  result[0] = parseInt(obj.result)
  if (result[0] === 0) {
    result[1] = obj.out[0]
  }

  return result
}

async function SD_IFD_SetKeyLength(icdev, keylength) {
  let result = new Array()
  let inStr, outStr
  let obj

  inStr = '{"func":"SD_IFD_SetKeyLength","in":["' + icdev.toString() + '","' + keylength.toString() + '"]}'
  outStr = await callDcrf32(inStr, 10000)
  if (typeof (outStr) === 'undefined') {
    return
  }

  try {
    obj = JSON.parse(outStr)
  } catch (error) {
    return
  }

  result[0] = parseInt(obj.result)

  return result
}

async function SD_IFD_GetPINPro(icdev, yyflag, timeout) {
  let result = new Array()
  let inStr, outStr
  let obj

  inStr = '{"func":"SD_IFD_GetPINPro","in":["' + icdev.toString() + '","' + yyflag.toString() + '","' + timeout.toString() + '"]}'
  outStr = await callDcrf32(inStr, timeout * 1000 + 10000)
  if (typeof (outStr) === 'undefined') {
    return
  }

  try {
    obj = JSON.parse(outStr)
  } catch (error) {
    return
  }

  result[0] = parseInt(obj.result)
  if (result[0] === 0) {
    result[1] = obj.out[0]
  }

  return result
}

async function SD_IFD_GetEnPINPro(icdev, yyflag, modeflag, timeout) {
  let result = new Array()
  let inStr, outStr
  let obj

  inStr = '{"func":"SD_IFD_GetEnPINPro","in":["' + icdev.toString() + '","' + yyflag.toString() + '","' + modeflag.toString() + '","' + timeout.toString() + '"]}'
  outStr = await callDcrf32(inStr, timeout * 1000 + 10000)
  if (typeof (outStr) === 'undefined') {
    return
  }

  try {
    obj = JSON.parse(outStr)
  } catch (error) {
    return
  }

  result[0] = parseInt(obj.result)
  if (result[0] === 0) {
    result[1] = obj.out[0]
  }

  return result
}

async function SD_IFD_GetEnPINBlock(icdev, yyflag, modeflag, cardno, timeout) {
  let result = new Array()
  let inStr, outStr
  let obj

  inStr = '{"func":"SD_IFD_GetEnPINBlock","in":["' + icdev.toString() + '","' + yyflag.toString() + '","' + modeflag.toString() + '","' + cardno + '","' + timeout.toString() + '"]}'
  outStr = await callDcrf32(inStr, timeout * 1000 + 10000)
  if (typeof (outStr) === 'undefined') {
    return
  }

  try {
    obj = JSON.parse(outStr)
  } catch (error) {
    return
  }

  result[0] = parseInt(obj.result)
  if (result[0] === 0) {
    result[1] = obj.out[0]
  }

  return result
}

async function SD_IFD_Scan2DBarcodeStart(icdev, mode) {
  let result = new Array()
  let inStr, outStr
  let obj

  inStr = '{"func":"SD_IFD_Scan2DBarcodeStart","in":["' + icdev.toString() + '","' + mode.toString() + '"]}'
  outStr = await callDcrf32(inStr, 10000)
  if (typeof (outStr) === 'undefined') {
    return
  }

  try {
    obj = JSON.parse(outStr)
  } catch (error) {
    return
  }

  result[0] = parseInt(obj.result)

  return result
}

async function SD_IFD_Scan2DBarcodeGetData(icdev) {
  let result = new Array()
  let inStr, outStr
  let obj

  inStr = '{"func":"SD_IFD_Scan2DBarcodeGetData","in":["' + icdev.toString() + '"]}'
  outStr = await callDcrf32(inStr, 10000)
  if (typeof (outStr) === 'undefined') {
    return
  }

  try {
    obj = JSON.parse(outStr)
  } catch (error) {
    return
  }

  result[0] = parseInt(obj.result)
  if (result[0] === 0) {
    result[1] = parseInt(obj.out[0])
    result[2] = obj.out[1]
  }

  return result
}

async function SD_IFD_Scan2DBarcodeExit(icdev) {
  let result = new Array()
  let inStr, outStr
  let obj

  inStr = '{"func":"SD_IFD_Scan2DBarcodeExit","in":["' + icdev.toString() + '"]}'
  outStr = await callDcrf32(inStr, 10000)
  if (typeof (outStr) === 'undefined') {
    return
  }

  try {
    obj = JSON.parse(outStr)
  } catch (error) {
    return
  }

  result[0] = parseInt(obj.result)

  return result
}

async function dc_GetSocialSecurityCardBaseInfo(icdev, type) {
  let result = new Array()
  let inStr, outStr
  let obj

  inStr = '{"func":"dc_GetSocialSecurityCardBaseInfo","in":["' + icdev.toString() + '","' + type.toString() + '"]}'
  outStr = await callDcrf32(inStr, 10000)
  if (typeof (outStr) === 'undefined') {
    return
  }

  try {
    obj = JSON.parse(outStr)
  } catch (error) {
    return
  }

  result[0] = parseInt(obj.result)
  if (result[0] === 0) {
    result[1] = obj.out[0]
    result[2] = obj.out[1]
    result[3] = obj.out[2]
    result[4] = obj.out[3]
    result[5] = obj.out[4]
    result[6] = obj.out[5]
    result[7] = obj.out[6]
    result[8] = obj.out[7]
    result[9] = obj.out[8]
    result[10] = obj.out[9]
    result[11] = obj.out[10]
    result[12] = obj.out[11]
    result[13] = obj.out[12]
    result[14] = obj.out[13]
  }

  return result
}

async function dc_GetBankAccountNumber(icdev, type) {
  let result = new Array()
  let inStr, outStr
  let obj

  inStr = '{"func":"dc_GetBankAccountNumber","in":["' + icdev.toString() + '","' + type.toString() + '"]}'
  outStr = await callDcrf32(inStr, 10000)
  if (typeof (outStr) === 'undefined') {
    return
  }

  try {
    obj = JSON.parse(outStr)
  } catch (error) {
    return
  }

  result[0] = parseInt(obj.result)
  if (result[0] === 0) {
    result[1] = obj.out[0]
  }

  return result
}

async function dc_SelfServiceDeviceCardStatus(icdev) {
  let result = new Array()
  let inStr, outStr
  let obj

  inStr = '{"func":"dc_SelfServiceDeviceCardStatus","in":["' + icdev.toString() + '"]}'
  outStr = await callDcrf32(inStr, 10000)
  if (typeof (outStr) === 'undefined') {
    return
  }

  try {
    obj = JSON.parse(outStr)
  } catch (error) {
    return
  }

  result[0] = parseInt(obj.result)
  if (result[0] === 0) {
    result[1] = parseInt(obj.out[0])
  }

  return result
}

async function dc_SelfServiceDeviceCardInject(icdev, time_s, mode) {
  let result = new Array()
  let inStr, outStr
  let obj

  inStr = '{"func":"dc_SelfServiceDeviceCardInject","in":["' + icdev.toString() + '","' + time_s.toString() + '","' + mode.toString() + '"]}'
  outStr = await callDcrf32(inStr, time_s * 1000 + 10000)
  if (typeof (outStr) === 'undefined') {
    return
  }

  try {
    obj = JSON.parse(outStr)
  } catch (error) {
    return
  }

  result[0] = parseInt(obj.result)

  return result
}

async function dc_SelfServiceDeviceCardEject(icdev, time_s, mode) {
  let result = new Array()
  let inStr, outStr
  let obj

  inStr = '{"func":"dc_SelfServiceDeviceCardEject","in":["' + icdev.toString() + '","' + time_s.toString() + '","' + mode.toString() + '"]}'
  outStr = await callDcrf32(inStr, time_s * 1000 + 10000)
  if (typeof (outStr) === 'undefined') {
    return
  }

  try {
    obj = JSON.parse(outStr)
  } catch (error) {
    return
  }

  result[0] = parseInt(obj.result)

  return result
}

async function dc_SelfServiceDeviceCardMove(icdev, time_s, mode) {
  let result = new Array()
  let inStr, outStr
  let obj

  inStr = '{"func":"dc_SelfServiceDeviceCardMove","in":["' + icdev.toString() + '","' + time_s.toString() + '","' + mode.toString() + '"]}'
  outStr = await callDcrf32(inStr, time_s * 1000 + 10000)
  if (typeof (outStr) === 'undefined') {
    return
  }

  try {
    obj = JSON.parse(outStr)
  } catch (error) {
    return
  }

  result[0] = parseInt(obj.result)

  return result
}

async function dc_SelfServiceDeviceSensorStatus(icdev) {
  let result = new Array()
  let inStr, outStr
  let obj

  inStr = '{"func":"dc_SelfServiceDeviceSensorStatus","in":["' + icdev.toString() + '"]}'
  outStr = await callDcrf32(inStr, 10000)
  if (typeof (outStr) === 'undefined') {
    return
  }

  try {
    obj = JSON.parse(outStr)
  } catch (error) {
    return
  }

  result[0] = parseInt(obj.result)
  if (result[0] === 0) {
    result[1] = parseInt(obj.out[0])
  }

  return result
}

async function dc_SelfServiceDeviceConfig(icdev, mode) {
  let result = new Array()
  let inStr, outStr
  let obj

  inStr = '{"func":"dc_SelfServiceDeviceConfig","in":["' + icdev.toString() + '","' + mode.toString() + '"]}'
  outStr = await callDcrf32(inStr, 10000)
  if (typeof (outStr) === 'undefined') {
    return
  }

  try {
    obj = JSON.parse(outStr)
  } catch (error) {
    return
  }

  result[0] = parseInt(obj.result)

  return result
}

async function dc_SelfServiceDeviceConfigFront(icdev, mode) {
  let result = new Array()
  let inStr, outStr
  let obj

  inStr = '{"func":"dc_SelfServiceDeviceConfigFront","in":["' + icdev.toString() + '","' + mode.toString() + '"]}'
  outStr = await callDcrf32(inStr, 10000)
  if (typeof (outStr) === 'undefined') {
    return
  }

  try {
    obj = JSON.parse(outStr)
  } catch (error) {
    return
  }

  result[0] = parseInt(obj.result)

  return result
}

async function dc_SelfServiceDeviceConfigBack(icdev, mode) {
  let result = new Array()
  let inStr, outStr
  let obj

  inStr = '{"func":"dc_SelfServiceDeviceConfigBack","in":["' + icdev.toString() + '","' + mode.toString() + '"]}'
  outStr = await callDcrf32(inStr, 10000)
  if (typeof (outStr) === 'undefined') {
    return
  }

  try {
    obj = JSON.parse(outStr)
  } catch (error) {
    return
  }

  result[0] = parseInt(obj.result)

  return result
}

async function dc_SelfServiceDeviceConfigPlace(icdev, mode) {
  let result = new Array()
  let inStr, outStr
  let obj

  inStr = '{"func":"dc_SelfServiceDeviceConfigPlace","in":["' + icdev.toString() + '","' + mode.toString() + '"]}'
  outStr = await callDcrf32(inStr, 10000)
  if (typeof (outStr) === 'undefined') {
    return
  }

  try {
    obj = JSON.parse(outStr)
  } catch (error) {
    return
  }

  result[0] = parseInt(obj.result)

  return result
}

async function dc_SelfServiceDeviceCheckCardType(icdev) {
  let result = new Array()
  let inStr, outStr
  let obj

  inStr = '{"func":"dc_SelfServiceDeviceCheckCardType","in":["' + icdev.toString() + '"]}'
  outStr = await callDcrf32(inStr, 10000)
  if (typeof (outStr) === 'undefined') {
    return
  }

  try {
    obj = JSON.parse(outStr)
  } catch (error) {
    return
  }

  result[0] = parseInt(obj.result)

  return result
}

async function dc_SelfServiceDeviceReset(icdev) {
  let result = new Array()
  let inStr, outStr
  let obj

  inStr = '{"func":"dc_SelfServiceDeviceReset","in":["' + icdev.toString() + '"]}'
  outStr = await callDcrf32(inStr, 10000)
  if (typeof (outStr) === 'undefined') {
    return
  }

  try {
    obj = JSON.parse(outStr)
  } catch (error) {
    return
  }

  result[0] = parseInt(obj.result)

  return result
}

async function dc_SelfServiceDeviceWriteMagConfig(icdev, mode) {
  let result = new Array()
  let inStr, outStr
  let obj

  inStr = '{"func":"dc_SelfServiceDeviceWriteMagConfig","in":["' + icdev.toString() + '","' + mode.toString() + '"]}'
  outStr = await callDcrf32(inStr, 10000)
  if (typeof (outStr) === 'undefined') {
    return
  }

  try {
    obj = JSON.parse(outStr)
  } catch (error) {
    return
  }

  result[0] = parseInt(obj.result)

  return result
}

async function dc_SelfServiceDeviceReadMagConfig(icdev, track1, track2, track3) {
  let result = new Array()
  let inStr, outStr
  let obj

  inStr = '{"func":"dc_SelfServiceDeviceReadMagConfig","in":["' + icdev.toString() + '","' + track1.toString() + '","' + track2.toString() + '","' + track3.toString() + '"]}'
  outStr = await callDcrf32(inStr, 10000)
  if (typeof (outStr) === 'undefined') {
    return
  }

  try {
    obj = JSON.parse(outStr)
  } catch (error) {
    return
  }

  result[0] = parseInt(obj.result)

  return result
}

async function dc_SelfServiceDeviceShakeConfig(icdev, mode) {
  let result = new Array()
  let inStr, outStr
  let obj

  inStr = '{"func":"dc_SelfServiceDeviceShakeConfig","in":["' + icdev.toString() + '","' + mode.toString() + '"]}'
  outStr = await callDcrf32(inStr, 10000)
  if (typeof (outStr) === 'undefined') {
    return
  }

  try {
    obj = JSON.parse(outStr)
  } catch (error) {
    return
  }

  result[0] = parseInt(obj.result)

  return result
}

async function dc_SelfServiceDeviceSetFrontSwitch(icdev, mode) {
  let result = new Array()
  let inStr, outStr
  let obj

  inStr = '{"func":"dc_SelfServiceDeviceSetFrontSwitch","in":["' + icdev.toString() + '","' + mode.toString() + '"]}'
  outStr = await callDcrf32(inStr, 10000)
  if (typeof (outStr) === 'undefined') {
    return
  }

  try {
    obj = JSON.parse(outStr)
  } catch (error) {
    return
  }

  result[0] = parseInt(obj.result)

  return result
}

async function dc_SelfServiceDeviceGetFrontSwitch(icdev) {
  let result = new Array()
  let inStr, outStr
  let obj

  inStr = '{"func":"dc_SelfServiceDeviceGetFrontSwitch","in":["' + icdev.toString() + '"]}'
  outStr = await callDcrf32(inStr, 10000)
  if (typeof (outStr) === 'undefined') {
    return
  }

  try {
    obj = JSON.parse(outStr)
  } catch (error) {
    return
  }

  result[0] = parseInt(obj.result)
  if (result[0] === 0) {
    result[1] = parseInt(obj.out[0])
  }

  return result
}

async function dc_SelfServiceDeviceRecoverError(icdev, type) {
  let result = new Array()
  let inStr, outStr
  let obj

  inStr = '{"func":"dc_SelfServiceDeviceRecoverError","in":["' + icdev.toString() + '","' + type.toString() + '"]}'
  outStr = await callDcrf32(inStr, 10000)
  if (typeof (outStr) === 'undefined') {
    return
  }

  try {
    obj = JSON.parse(outStr)
  } catch (error) {
    return
  }

  result[0] = parseInt(obj.result)

  return result
}

async function dc_SelfServiceDeviceSensorStatusEx(icdev) {
  let result = new Array()
  let inStr, outStr
  let obj

  inStr = '{"func":"dc_SelfServiceDeviceSensorStatusEx","in":["' + icdev.toString() + '"]}'
  outStr = await callDcrf32(inStr, 10000)
  if (typeof (outStr) === 'undefined') {
    return
  }

  try {
    obj = JSON.parse(outStr)
  } catch (error) {
    return
  }

  result[0] = parseInt(obj.result)
  if (result[0] === 0) {
    result[1] = parseInt(obj.out[0])
    result[2] = obj.out[1]
  }

  return result
}

async function dc_SelfServiceDeviceKeepUpDown(icdev, mode) {
  let result = new Array()
  let inStr, outStr
  let obj

  inStr = '{"func":"dc_SelfServiceDeviceKeepUpDown","in":["' + icdev.toString() + '","' + mode.toString() + '"]}'
  outStr = await callDcrf32(inStr, 10000)
  if (typeof (outStr) === 'undefined') {
    return
  }

  try {
    obj = JSON.parse(outStr)
  } catch (error) {
    return
  }

  result[0] = parseInt(obj.result)

  return result
}

async function dc_SelfServiceDeviceWriteMag(icdev, t1_data, t1_len, t2_data, t2_len, t3_data, t3_len) {
  let result = new Array()
  let inStr, outStr
  let obj

  inStr = '{"func":"dc_SelfServiceDeviceWriteMag","in":["' + icdev.toString() + '","' + t1_data + '","' + t1_len.toString() + '","' + t2_data + '","' + t2_len.toString() + '","' + t3_data + '","' + t3_len.toString() + '"]}'
  outStr = await callDcrf32(inStr, 10000)
  if (typeof (outStr) === 'undefined') {
    return
  }

  try {
    obj = JSON.parse(outStr)
  } catch (error) {
    return
  }

  result[0] = parseInt(obj.result)

  return result
}

async function dc_SelfServiceDeviceInit(icdev, gate_check_mode, card_move_mode, request_mode) {
  let result = new Array()
  let inStr, outStr
  let obj

  inStr = '{"func":"dc_SelfServiceDeviceInit","in":["' + icdev.toString() + '","' + gate_check_mode.toString() + '","' + card_move_mode.toString() + '","' + request_mode.toString() + '"]}'
  outStr = await callDcrf32(inStr, 10000)
  if (typeof (outStr) === 'undefined') {
    return
  }

  try {
    obj = JSON.parse(outStr)
  } catch (error) {
    return
  }

  result[0] = parseInt(obj.result)
  if (result[0] === 0) {
    result[1] = obj.out[0]
    result[2] = parseInt(obj.out[1])
  }

  return result
}

async function dc_SelfServiceDeviceWriteMagSpeed(icdev, value) {
  let result = new Array()
  let inStr, outStr
  let obj

  inStr = '{"func":"dc_SelfServiceDeviceWriteMagSpeed","in":["' + icdev.toString() + '","' + value.toString() + '"]}'
  outStr = await callDcrf32(inStr, 10000)
  if (typeof (outStr) === 'undefined') {
    return
  }

  try {
    obj = JSON.parse(outStr)
  } catch (error) {
    return
  }

  result[0] = parseInt(obj.result)

  return result
}
export default {
  openWs, // 开启wx连接
  closeWs, // 关闭ws连接
  dc_SamAReadCardInfo, // 读取身份证
  dc_Scan2DBarcode,
  dc_Scan2DBarcodeExit
}