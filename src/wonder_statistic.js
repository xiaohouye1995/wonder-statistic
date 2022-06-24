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
    console.log('初始化参数：', options)
    this.requestUrl = options.requestUrl || ''
    this._options = {
      appName: options.appName || '',
      userId: this.userId,
      pagePath: window.location.pathname,
      deviceInfo: { ...this.getDeviceInfo() }
    }
    this.event('pv')
  }
  // 获取设备信息
  getDeviceInfo() {
    const ua = navigator.userAgent.toLowerCase();
    console.log('ua', ua)
    const testUa = regexp => regexp.test(ua);
    const testVs = regexp => ua.match(regexp).toString().replace(/[^0-9|_.]/g, "").replace(/_/g, ".");
    // 系统
    let system = "unknow";
    if (testUa(/windows|win32|win64|wow32|wow64/g)) {
      system = "windows"; // windows系统
    } else if (testUa(/macintosh|macintel/g)) {
      system = "macos"; // macos系统
    } else if (testUa(/x11/g)) {
      system = "linux"; // linux系统
    } else if (testUa(/android|adr/g)) {
      system = "android"; // android系统
    } else if (testUa(/ios|iphone|ipad|ipod|iwatch/g)) {
      system = "ios"; // ios系统
    }

    // 系统版本
    let systemVs = "unknow";
    if (system === "windows") {
      if (testUa(/windows nt 5.0|windows 2000/g)) {
        systemVs = "2000";
      } else if (testUa(/windows nt 5.1|windows xp/g)) {
        systemVs = "xp";
      } else if (testUa(/windows nt 5.2|windows 2003/g)) {
        systemVs = "2003";
      } else if (testUa(/windows nt 6.0|windows vista/g)) {
        systemVs = "vista";
      } else if (testUa(/windows nt 6.1|windows 7/g)) {
        systemVs = "7";
      } else if (testUa(/windows nt 6.2|windows 8/g)) {
        systemVs = "8";
      } else if (testUa(/windows nt 6.3|windows 8.1/g)) {
        systemVs = "8.1";
      } else if (testUa(/windows nt 10.0|windows 10/g)) {
        systemVs = "10";
      }
    } else if (system === "macos") {
      systemVs = testVs(/os x [\d._]+/g);
    } else if (system === "android") {
      systemVs = testVs(/android [\d._]+/g);
    } else if (system === "ios") {
      systemVs = testVs(/os [\d._]+/g);
    }

    // 平台
    let platform = "unknow";
    if (system === "windows" || system === "macos" || system === "linux") {
      platform = "pc"; // 桌面端
    } else if (system === "android" || system === "ios" || testUa(/mobile/g)) {
      platform = "mobile"; // 移动端
    }

    // 内核+载体
    let engine = "unknow";
    let supporter = "unknow";
    if (testUa(/applewebkit/g)) {
      engine = "webkit"; // webkit内核
      if (testUa(/edg/g)) {
        supporter = "edge-chrome"; // edge浏览器使用chrome内核
      } else if (testUa(/edge/g)) {
        supporter = "edge"; // edge浏览器
      } else if (testUa(/opr/g)) {
        supporter = "opera"; // opera浏览器
      } else if (testUa(/chrome/g)) {
        supporter = "chrome"; // chrome浏览器
      } else if (testUa(/safari/g)) {
        supporter = "safari"; // safari浏览器
      }
    } else if (testUa(/gecko/g) && testUa(/firefox/g)) {
      engine = "gecko"; // gecko内核
      supporter = "firefox"; // firefox浏览器
    } else if (testUa(/presto/g)) {
      engine = "presto"; // presto内核
      supporter = "opera"; // opera浏览器
    } else if (testUa(/trident|compatible|msie/g)) {
      engine = "trident"; // trident内核
      supporter = "iexplore"; // iexplore浏览器
    }

    // 内核版本
    let engineVs = "unknow";
    if (engine === "webkit") {
      engineVs = testVs(/applewebkit\/[\d._]+/g);
    } else if (engine === "gecko") {
      engineVs = testVs(/gecko\/[\d._]+/g);
    } else if (engine === "presto") {
      engineVs = testVs(/presto\/[\d._]+/g);
    } else if (engine === "trident") {
      engineVs = testVs(/trident\/[\d._]+/g);
    }

    // 载体版本
    let supporterVs = "unknow";
    if (supporter === "chrome") {
      supporterVs = testVs(/chrome\/[\d._]+/g);
    } else if (supporter === "safari") {
      supporterVs = testVs(/version\/[\d._]+/g);
    } else if (supporter === "firefox") {
      supporterVs = testVs(/firefox\/[\d._]+/g);
    } else if (supporter === "opera") {
      supporterVs = testVs(/opr\/[\d._]+/g);
    } else if (supporter === "iexplore") {
      supporterVs = testVs(/(msie [\d._]+)|(rv:[\d._]+)/g);
    } else if (supporter === "edge") {
      supporterVs = testVs(/edge\/[\d._]+/g);
    } else if (supporter === "edge-chrome") {
      supporterVs = testVs(/edg\/[\d._]+/g);
    }

    if (testUa(/micromessenger/g)) {
      supporter = "wechat"; // 微信浏览器
      supporterVs = testVs(/micromessenger\/[\d._]+/g);
    } else if (testUa(/qqbrowser/g)) {
      supporter = "qq"; // QQ浏览器
      supporterVs = testVs(/qqbrowser\/[\d._]+/g);
    } else if (testUa(/ucbrowser/g)) {
      supporter = "uc"; // UC浏览器
      supporterVs = testVs(/ucbrowser\/[\d._]+/g);
    } else if (testUa(/qihu 360se/g)) {
      supporter = "360"; // 360浏览器(无版本)
      supporterVs = ''
    } else if (testUa(/2345explorer/g)) {
      supporter = "2345"; // 2345浏览器
      supporterVs = testVs(/2345explorer\/[\d._]+/g);
    } else if (testUa(/metasr/g)) {
      supporter = "sougou"; // 搜狗浏览器(无版本)
      supporterVs = ''
    } else if (testUa(/lbbrowser/g)) {
      supporter = "liebao"; // 猎豹浏览器(无版本)
      supporterVs = ''
    } else if (testUa(/maxthon/g)) {
      supporter = "maxthon"; // 遨游浏览器
      supporterVs = testVs(/maxthon\/[\d._]+/g);
    }

    const screen = `${window.screen.width}x${window.screen.height}`

    const model = 'none'

    // 获取到system、systemVs、platform、engine、engineVs、supporter、supporterVs
    return Object.assign({
      engine, // webkit gecko presto trident
      engineVs,
      platform, // desktop mobile
      supporter, // chrome safari firefox opera iexplore edge
      supporterVs,
      system, // windows macos linux android ios
      systemVs,
      screen,
    }, model === "none" ? {} : {
      model,
    });
  }
  // getIPhoneModel() {
  //   if ((window.screen.height / window.screen.width == 926 / 428) && (window.devicePixelRatio == 3)) {
  //     return "iPhone 12 Pro Max, 13 Pro Max";
  //   } else if ((window.screen.height / window.screen.width == 844 / 390) && (window.devicePixelRatio == 3)) {
  //     return "iPhone 12, 12 Pro, 13, 13 Pro";
  //   } else if ((window.screen.height / window.screen.width == 780 / 360) && (window.devicePixelRatio == 3)) {
  //     return "iPhone 12 mini, 13 mini";
  //   } else if ((window.screen.height / window.screen.width == 896 / 414) && (window.devicePixelRatio == 3)) {
  //     return "iPhone Xs Max , 11 Pro Max";
  //   } else if ((window.screen.height / window.screen.width == 896 / 414) && (window.devicePixelRatio == 2)) {
  //     return "iPhone Xr";
  //   } else if ((window.screen.height / window.screen.width == 812 / 375) && (window.devicePixelRatio == 3)) {
  //     return "iPhone X";
  //   } else if ((window.screen.height / window.screen.width == 736 / 414) && (window.devicePixelRatio == 3)) {
  //     return "iPhone 6 Plus, 6s Plus, 7 Plus or 8 Plus";
  //   } else if ((window.screen.height / window.screen.width == 667 / 375) && (window.devicePixelRatio == 3)) {
  //     return "iPhone 6 Plus, 6s Plus, 7 Plus or 8 Plus (display zoom)";
  //   } else if ((window.screen.height / window.screen.width == 667 / 375) && (window.devicePixelRatio == 2)) {
  //     return "iPhone 6, 6s, 7 or 8";
  //   } else if ((window.screen.height / window.screen.width == 1.775) && (window.devicePixelRatio == 2)) {
  //     return "iPhone 5, 5C, 5S, SE or 6, 6s, 7 and 8 (display zoom)";
  //   } else if ((window.screen.height / window.screen.width == 1.5) && (window.devicePixelRatio == 2)) {
  //     return "iPhone 4 or 4s";
  //   } else if ((window.screen.height / window.screen.width == 1.5) && (window.devicePixelRatio == 1)) {
  //     return "iPhone 1, 3G or 3GS";
  //   } else {
  //     return "unknow";
  //   }
  // }
  // 路由跳转
  routingJump(path) {
    this._options.pagePath = path
    this.event('pv')
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
      beacon.src = `${this.requestUrl}?v=${encodeURIComponent(JSON.stringify(data))}`;
    }
  }
  /**
   * 自定义事件
   * @param name 事件名
   * @param data 数据
   */
  event(typeName, data) {
    this.send({ ...this._options, typeName, eventInfo: data })
  }
}