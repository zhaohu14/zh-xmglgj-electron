


// 默认 ws://127.0.0.1:50150
const ws_url = 'ws://192.168.110.100:50150'
// 读取身份证信息
async function readyIdCard() {
  var info, maskText, maskPhoto, maskFingerprint, maskExtra, type
  var textLen, text
  var photoLen, photo
  var fingerprintLen, fingerprint
  var extraLen, extra
  var result
  var myFlag = await openWs(ws_url, 10000)
  var handle = await dc_init(100, 115200)
  if (handle <= 0) {
    console.log('await dc_beep error!', handle)
    return
  }
  result = await dc_beep(handle, 5)
  if (result[0] != 0) {
    console.log('await dc_beep error!', result[0])
    await dc_exit(handle)
    return
  }
  result = await dc_SamAReadCardInfo(handle, 3)
  if (result[0] !== 0) {
    alert('读取失败。')
    await dc_exit(handle)
    return
  }

  textLen = result[1]
  text = result[2]
  photoLen = result[3]
  photo = result[4]
  fingerprintLen = result[5]
  fingerprint = result[6]
  extraLen = result[7]
  extra = result[8]
  type = 0
  if (text.substr(496, 4) === '4900') {
    type = 1
  }
  else if (text.substr(496, 4) === '4A00') {
    type = 2
  }

  if (type == 0) {
    result = await dc_ParseTextInfo(handle, 2, textLen, text)
    if (result[0] !== 0) {
      alert('读取失败。')
      await dc_exit(handle)
      return
    }
    name = result[1]
    // sex = result[2]
    nation = result[3]
    birth_day = result[4]
    address = result[5]
    id_number = result[6]
    department = result[7]
    expire_start_day = result[8]
    expire_end_day = result[9]
    reserved = result[10]

    info += '姓名: ' + name + '\n'
    // result = await dc_ParseOtherInfo(handle, 0x20, sex)
    // sex = result[1]
    // info += '性别: ' + sex + '\n'
    result = await dc_ParseOtherInfo(handle, 0x21, nation)
    nation = result[1]
    info += '民族: ' + nation + '\n'
    info += '出生日期: ' + birth_day + '\n'
    info += '住址: ' + address + '\n'
    info += '公民身份号码: ' + id_number + '\n'
    info += '签发机关: ' + department + '\n'
    info += '证件签发日期: ' + expire_start_day + '\n'
    info += '证件终止日期: ' + expire_end_day + '\n'
    // console.log('中国身份证信息', info)
    const obj = {
      name,
      nation,
      address,
      idCardNo: id_number,
    }
    return obj
  }
  if (type == 1) {
    result = await dc_ParseTextInfoForForeigner(handle, 2, textLen, text)
    if (result[0] !== 0) {
      alert('读取失败。')
      await dc_exit(handle)
      return
    }
    english_name = result[1]
    // sex = result[2]
    id_number = result[3]
    citizenship = result[4]
    chinese_name = result[5]
    expire_start_day = result[6]
    expire_end_day = result[7]
    birth_day = result[8]
    version_number = result[9]
    department_code = result[10]
    type_sign = result[11]
    reserved = result[12]

    info += '英文姓名: ' + english_name + '\n'
    // result = await dc_ParseOtherInfo(handle, 0x20, sex)
    // sex = result[1]
    // info += '性别: ' + sex + '/' + ((sex === '男') ? 'M' : 'F') + '\n'
    info += '永久居留证号码: ' + id_number + '\n'
    result = await dc_ParseOtherInfo(handle, 0x22, citizenship)
    info += '国籍或所在地区代码: ' + result[1] + '/' + citizenship + '\n'
    info += '中文姓名: ' + chinese_name + '\n'
    info += '证件签发日期: ' + expire_start_day + '\n'
    info += '证件终止日期: ' + expire_end_day + '\n'
    info += '出生日期: ' + birth_day + '\n'
    info += '证件版本号: ' + version_number + '\n'
    info += '当次申请受理机关代码: ' + department_code + '\n'
    info += '证件类型标识: ' + type_sign + '\n'
    console.log('外国身份证：', info)
  }
  if (type == 2) {
    result = await dc_ParseTextInfoForHkMoTw(handle, 2, textLen, text)
    if (result[0] !== 0) {
      alert('读取失败。')
      await dc_exit(handle)
      return
    }
    name = result[1]
    // sex = result[2]
    reserved = result[3]
    birth_day = result[4]
    address = result[5]
    id_number = result[6]
    department = result[7]
    expire_start_day = result[8]
    expire_end_day = result[9]
    pass_number = result[10]
    sign_count = result[11]
    reserved2 = result[12]
    type_sign = result[13]
    reserved3 = result[14]

    info += '姓名: ' + name + '\n'
    // result = await dc_ParseOtherInfo(handle, 0x20, sex)
    // sex = result[1]
    // info += '性别: ' + sex + '\n'
    result = await dc_ParseOtherInfo(handle, 0x21, nation)
    nation = result[1]
    info += '出生日期: ' + birth_day + '\n'
    info += '住址: ' + address + '\n'
    info += '公民身份号码: ' + id_number + '\n'
    info += '签发机关: ' + department + '\n'
    info += '证件签发日期: ' + expire_start_day + '\n'
    info += '证件终止日期: ' + expire_end_day + '\n'
    info += '通行证号码: ' + pass_number + '\n'
    info += '签发次数: ' + sign_count + '\n'
    info += '证件类型标识: ' + type_sign + '\n'
    console.log('港澳台身份证：', info)
  }



  result = await dc_ParsePhotoInfo(handle, 2, photoLen, photo, 65536, "")
  if (result[0] !== 0) {
    alert('读取失败。')
    await dc_exit(handle)
    return
  }
  // attr('src', 'data:image/bmpbase64,' + result[2])
  // console.log('图片信息', 'data:image/bmpbase64,' + result[2])
  await dc_exit(handle)
  return
}
// 扫码方法
/*
  @time 超时时间 单位秒 Number 默认 10s
  @_callback 回调方法 接受参数 必填 类型 Function
*/
async function getQRcode(time = 10, _callback) {
  var myFlag = await openWs(ws_url, 10000)
  var handle = await dc_init(100, 115200)
  if (handle <= 0) {
    console.log('await dc_init error!', handle)
    return
  }
  result = await dc_beep(handle, 5)
  if (result[0] != 0) {
    console.log('await dc_beep error!', result[0])
    await dc_exit(handle)
    return
  }
  // let codeResult = await dc_Scan2DBarcode(handle, 60 * 1000)
  dc_Scan2DBarcodeStart(handle, '0x00', time, function(e) {
    console.log('二维码数据：', e)
    dc_exit(handle)
    if (_callback && typeof _callback === 'function') {
      _callback(e)
    }
    // _callback(e)
  })
  // await dc_exit(handle)
}

var ws
// 调起服务
async function openWs(url, timeMs) {
  if (typeof ws !== "undefined") {
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
// 打开设备
async function dc_init(port, baud) {
  let result = new Array()
  let inStr, outStr
  let obj

  inStr =
    '{"func":"dc_init","in":["' +
    port.toString() +
    '","' +
    baud.toString() +
    '"]}'
  outStr = await callDcrf32(inStr, 10000)
  if (typeof outStr === "undefined") {
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

// 设备蜂鸣器发出指定时间的蜂鸣声
// icdev 设备标识符。
// _Msec 蜂鸣时间，单位为10毫秒。
async function dc_beep(icdev, _Msec) {
  let result = new Array()
  let inStr, outStr
  let obj

  inStr =
    '{"func":"dc_beep","in":["' +
    icdev.toString() +
    '","' +
    _Msec.toString() +
    '"]}'
  outStr = await callDcrf32(inStr, _Msec * 10 + 10000)
  if (typeof outStr === "undefined") {
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
// 建立设备的通讯并且分配相应的资源，大部分功能接口都需要在此过程后才能进行，在不需要使用设备后，必须使用 ::dc_exit 去关闭设备的通讯和释放资源。
// icdev 设备标识符。
async function dc_exit(icdev) {
  let result = new Array()
  let inStr, outStr
  let obj

  inStr = '{"func":"dc_exit","in":["' + icdev.toString() + '"]}'
  outStr = await callDcrf32(inStr, 10000)
  if (typeof outStr === "undefined") {
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

//  解析文字信息。
// icdev 设备标识符。
//  charset 获取条目将采用的字符集，0表示GBK，1表示UCS-2LE，2表示UTF-8。
// info_len 文字信息的长度。
//  info 文字信息。
async function dc_ParseTextInfo(icdev, charset, info_len, info) {
  let result = new Array()
  let inStr, outStr
  let obj

  inStr =
    '{"func":"dc_ParseTextInfo","in":["' +
    icdev.toString() +
    '","' +
    charset.toString() +
    '","' +
    info_len.toString() +
    '","' +
    info +
    '"]}'
  outStr = await callDcrf32(inStr, 10000)
  if (typeof outStr === "undefined") {
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

// 解析其它信息。
// icdev 设备标识符。
//  flag 标志。
// in_info 传入信息。
// out_info 返回的信息。
async function dc_ParseOtherInfo(icdev, flag, in_info) {
  let result = new Array()
  let inStr, outStr
  let obj

  inStr =
    '{"func":"dc_ParseOtherInfo","in":["' +
    icdev.toString() +
    '","' +
    flag.toString() +
    '","' +
    in_info +
    '"]}'
  outStr = await callDcrf32(inStr, 10000)
  if (typeof outStr === "undefined") {
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


async function dc_ParseTextInfoForForeigner(icdev, charset, info_len, info) {
  let result = new Array()
  let inStr, outStr
  let obj

  inStr =
    '{"func":"dc_ParseTextInfoForForeigner","in":["' +
    icdev.toString() +
    '","' +
    charset.toString() +
    '","' +
    info_len.toString() +
    '","' +
    info +
    '"]}'
  outStr = await callDcrf32(inStr, 10000)
  if (typeof outStr === "undefined") {
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



async function WriteMessage(msg) {
  if (typeof ws === "undefined") {
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



async function ReadMessage(timeMs) {
  if (typeof ws === "undefined") {
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

  let result = await Promise.race([
    onopen,
    onclose,
    onmessage,
    onerror,
    timeout,
  ])

  ws.onopen = undefined
  ws.onclose = undefined
  ws.onmessage = undefined
  ws.onerror = undefined

  return result
}


async function dc_SamAReadCardInfo(icdev, type) {
  let result = new Array()
  let inStr, outStr
  let obj

  inStr =
    '{"func":"dc_SamAReadCardInfo","in":["' +
    icdev.toString() +
    '","' +
    type.toString() +
    '"]}'
  outStr = await callDcrf32(inStr, 10000)
  if (typeof outStr === "undefined") {
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

async function dc_ParsePhotoInfo(
  icdev,
  type,
  info_len,
  info,
  photo_len,
  photo
) {
  let result = new Array()
  let inStr, outStr
  let obj

  inStr =
    '{"func":"dc_ParsePhotoInfo","in":["' +
    icdev.toString() +
    '","' +
    type.toString() +
    '","' +
    info_len.toString() +
    '","' +
    info +
    '","' +
    photo_len.toString() +
    '","' +
    photo +
    '"]}'
  outStr = await callDcrf32(inStr, 10000)
  if (typeof outStr === "undefined") {
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
// 开启扫码
async function dc_Scan2DBarcodeStart(icdev, mode, time, _callback) {
  mode = '0x00'
  inStr =
    '{"func":"dc_Scan2DBarcodeStart","in":["' +
    icdev.toString() +
    '","' +
    mode.toString() +
    '"]}'
  outStr = await callDcrf32(inStr, 10000)
  if (typeof outStr === "undefined") {
    return
  }

  try {
    obj = JSON.parse(outStr)
  } catch (error) {
    return
  }
  if (obj.result === '0') {
    // await dc_Scan2DBarcode(icdev, 60 * 1000)
    // let result
    dc_Scan2DBarcodeGetData(icdev, 0, time, (e) => {
      _callback(e)
      dc_exit(icdev)
    })
  }
}
// 扫码获取数据 接受一个_callback回调函数
async function dc_Scan2DBarcodeGetData(icdev, index = 0, time, _callback) {
  // console.log('dc_Scan2DBarcodeGetData方法入参：', {
  //   icdev, index, time, _callback
  // })
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

  if (obj.result === '0') {
    _callback(obj)
    await dc_exit(icdev)
  }
  if (result[0] < 0 && index < time) {
    setTimeout(() => {
      dc_Scan2DBarcodeGetData(icdev, index + 1, time, _callback)
    }, 1000)
    return
  }
  if (result[0] < 0 && index >= time) {
    console.log('扫码失败')
    dc_exit(icdev)
    return alert('扫码失败，请重试')
  }
}



module.exports = {
  readyIdCard, // 读取身份证信息
  getQRcode, // 获取二维码数据
}