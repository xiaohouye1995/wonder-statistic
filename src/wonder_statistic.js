export class WonderStatistic {
  constructor() {
    const id = localStorage.getItem('userId')
    if (id) {
      this.userId = id
    } else {
      this.userId = this.uuid()
      localStorage.setItem('userId', this.userId)
    }
  }
  /**
   * 初始化配置
   * @param requestUrl 请求路径
   * @param appName 应用名
   */
  init(options = {}) {
    console.log('options', options)
    this.requestUrl = options.requestUrl || ''
    this._options = {
      appName: options.appName || '',
      userId: this.userId
    }
    this.getPageInfo()
    this.event('pv', this._options)
  }
  // 获取一个随机字符串(全局唯一标识符)
  uuid() {
    const date = new Date();
    // yyyy-MM-dd的16进制表示,7位数字
    const hexDate = parseInt(`${date.getFullYear()}${this.pad(date.getMonth() + 1, 2)}${this.pad(date.getDate(), 2)}`, 10).toString(16);
    // hh-mm-ss-ms的16进制表示，最大也是7位
    const hexTime = parseInt(`${this.pad(date.getHours(), 2)}${this.pad(date.getMinutes(), 2)}${this.pad(date.getSeconds(), 2)}${this.pad(date.getMilliseconds(), 3)}`, 10).toString(16);
    // 第8位数字表示后面的time字符串的长度
    let guid = hexDate + hexTime.length + hexTime;
    // 补充随机数，补足32位的16进制数
    while (guid.length < 32) {
      guid += Math.floor(Math.random() * 16).toString(16);
    }
    // 分为三段，前两段包含时间戳信息
    return `${guid.slice(0, 8)}-${guid.slice(8, 16)}-${guid.slice(16)}`;
  }
  /**
   * 补全字符
   * @param {*} num 初始值
   * @param {*} len 需要补全的位数
   * @param {*} placeholder 补全的值
   * @returns 补全后的值
   */
  pad(num, len, placeholder = '0') {
    const str = String(num);
    if (str.length < len) {
      let result = str;
      for (let i = 0; i < len - str.length; i += 1) {
        result = placeholder + result;
      }
      return result;
    }
    return str;
  }
  // 发送消息
  send(data = {}) {
    if (navigator.sendBeacon) {
      // 新特性
      navigator.sendBeacon(this.requestUrl, JSON.stringify(data))
    } else {
      // 传统方式传递参数
      const beacon = new Image();
      beacon.src = `${url}?v=${encodeURIComponent(JSON.stringify(data))}`;
    }
  }
  /**
   * 自定义事件
   * @param name 事件名
   * @param val 数据
   */
  event(typeName, data) {
    this.send({ ...this._options, typeName, eventInfo: data })
  }
  // 获取页面信息
  getPageInfo() {
    this._options.path = window.location.pathname
  }
}