export class WonderStatistic {
  constructor() {
    const id = localStorage.getItem('wonderStatisticBrowserId')
    if (id) {
      this.browserId = id
    } else {
      this.browserId = this.uuid()
      localStorage.setItem('wonderStatisticBrowserId', this.browserId)
    }
    this.routerInit()
  }
  /**
   * 初始化配置
   * @param requestUrl 请求路径
   * @param appName 应用名
   */
  init(options = {}) {
    // console.log('初始化参数：', options)
    this.requestUrl = options.requestUrl || ''
    this._options = {
      appName: options.appName || '',
      eventType: '',
      distinctId: this.browserId,
      pagePath: this.getUrl(),
      // region: '',
      // city: '',
      // ipAddress: '',
      pageTimeSrc: '',
      pageTime: '',
      userId: localStorage.getItem('wonderStatisticUserId') || null,
      groupInfo: JSON.parse(localStorage.getItem('wonderStatisticGroupInfo')) || null,
      // deviceInfo: { ...this.getDeviceInfo() },
      ...this.getDeviceInfo()
    }
    this.eventCenter = options.eventCenter || ''
    this.appType = options.appType || ''
    this.getPageSource()
    // this.getLocation()
    this.getPageBack()
    this.getPageTime()
    this.event('pv')
    this.getPageOut()
  }
  // 服务端用户登录
  login(id, groupInfo) {
    this._options.userId = id
    localStorage.setItem('wonderStatisticUserId', id)
    this.setGroupInfo(groupInfo)
    this.event('loginSuccess')
  }
  // 设置集团信息
  setGroupInfo(groupInfo) {
    this._options.groupInfo = {...groupInfo}
    localStorage.setItem('wonderStatisticGroupInfo', JSON.stringify(groupInfo))
  }
  // 监听路由初始化
  routerInit() {
    const rewriteHis = (type) => {
      // 先将原函数存放起来
      let origin = window.history[type]
      // 当window.history[type]函数被执行时，这个函数就会被执行
      return function () {
        // 执行原函数
        let rs = origin.apply(this, arguments)
        // 定义一个自定义事件
        let e = new Event(type.toLocaleLowerCase())
        // 把默认参数，绑定到自定义事件上，new Event返回的结果，自身上是没有arguments的
        e.arguments = arguments
        // 触发自定义事件，把载荷传给自定义事件
        window.dispatchEvent(e)
        return rs
      }
    }
    window.history.pushState = rewriteHis('pushState')
  }
  // 获取页面来源
  getPageSource() {
    const source = localStorage.getItem('wonderStatisticSource')
    if (source) {
      this._options.source = source
    } else {
      this._options.source = this.getQueryVariable('source') || document.referrer || '直接打开'
      localStorage.setItem('wonderStatisticSource', this._options.source)
    }
  }
  // 获取url参数
  getQueryVariable(variable) {
    let query = window.location.search.substring(1)
    let vars = query.split('&')
    for (let i = 0; i < vars.length; i++) {
      let pair = vars[i].split('=')
      if (pair[0] === variable) {
        return pair[1]
      }
    }
    return ''
  }
  // 获取页面退出
  getPageOut() {
    const now = new Date().getTime()
    // 从缓存中获取用户上次退出的时间戳
    const leaveTime = parseInt(localStorage.getItem('wonderStatisticLeaveTime'), 10)
    if (!leaveTime) {
      return
    }
    // 判断是否为退出，两次间隔大于5s判定为退出操作
    const isOut = now - leaveTime > 5000
    if (isOut) {
      const url = localStorage.getItem('wonderStatisticPageUrl') || this.getUrl()
      this.send({ ...this._options, eventType: 'pageOut', pagePath: url })
      localStorage.setItem('wonderStatisticSource', '')
      // localStorage.setItem('wonderStatisticTime', '')
      // localStorage.setItem('wonderStatisticPageUrl', '')
    }
  }
  // 获取页面返回上一页
  getPageBack() {
    window.addEventListener('popstate', () => {
      const url = localStorage.getItem('wonderStatisticPageUrl') || this.getUrl()
      this.send({ ...this._options, eventType: 'pageBack', pagePath: url })
    })
  }
  // 获取页面停留时长
  getPageTime() {
    let tempTime = localStorage.getItem('wonderStatisticTime') || new Date().getTime()
    let pageUrl = localStorage.getItem('wonderStatisticPageUrl') || this.getUrl()
    const setStayTimeEvent = (name, path) => {
      let timeDiff = new Date().getTime() - tempTime
      const dayMs = 24 * 60 * 60 * 1000
      if (timeDiff > dayMs) {
        timeDiff = dayMs
      }
      this._options.pageTime = String(timeDiff)
      // console.log(`'${pageUrl}'页面停留时长${name}： ${timeDiff}ms`)
      this._options.pageTimeSrc = pageUrl
      pageUrl = path || this.getUrl()
      tempTime = new Date().getTime()
      localStorage.setItem('wonderStatisticTime', tempTime)
      localStorage.setItem('wonderStatisticPageUrl', pageUrl)
      this.routingJump(pageUrl)
    }
    // 页面刷新或退出时上次停留时长
    window.onunload = () => {
      setStayTimeEvent('onunload')
      // 清空停留时长和停留页面
      localStorage.setItem('wonderStatisticTime', '')
      localStorage.setItem('wonderStatisticPageUrl', '')
      // 记录离开时间，用以区分刷新和退出
      localStorage.setItem('wonderStatisticLeaveTime', new Date().getTime())
    }
    if (this.appType === 'taro') {
      this.eventCenter.on('__taroRouterChange', ({ toLocation: { path } }) => {
        if (this._options.userId) {
          setStayTimeEvent('__taroRouterChange', path)
        }
      })
    } else {
      // 监听页面后退
      window.addEventListener('popstate', () => {
        setStayTimeEvent('popstate')
      })
      // 监听页面前进
      window.addEventListener('pushstate', () => {
        setStayTimeEvent('pushstate')
      })
    }
  }
  // 获取定位信息
  // getLocation() {
  //   // navigator.geolocation.getCurrentPosition((res) => {
  //   //   console.log(res);//这里会返回经纬度，然后还要通过经纬度转换地区名称
  //   // });
  //   var xhr = new XMLHttpRequest()
  //   xhr.open('GET', 'https://get.geojs.io/v1/ip/geo.json')
  //   xhr.send(null)
  //   xhr.onload = () => {
  //     if (xhr.status !== 200) {
  //       this.event('pv')
  //       return
  //     }
  //     const location = JSON.parse(xhr.responseText)
  //     this._options.region = location.region
  //     this._options.city = location.city
  //     this._options.ipAddress = location.ip
  //     this.event('pv')
  //     this.getPageOut()
  //   }
  //   xhr.onerror = () => {
  //     this.event('pv')
  //     this.getPageOut()
  //   }
  // }
  // 获取设备信息
  getDeviceInfo() {
    const ua = navigator.userAgent.toLowerCase()
    // console.log('ua', ua)
    const testUa = (regexp) => regexp.test(ua)
    const testVs = (regexp) =>
      ua
        .match(regexp)
        .toString()
        .replace(/[^0-9|_.]/g, '')
        .replace(/_/g, '.')
    // 系统
    let system = 'unknow'
    if (testUa(/windows|win32|win64|wow32|wow64/g)) {
      system = 'windows' // windows系统
    } else if (testUa(/macintosh|macintel/g)) {
      system = 'macos' // macos系统
    } else if (testUa(/x11/g)) {
      system = 'linux' // linux系统
    } else if (testUa(/android|adr/g)) {
      system = 'android' // android系统
    } else if (testUa(/ios|iphone|ipad|ipod|iwatch/g)) {
      system = 'ios' // ios系统
    }

    // 系统版本
    let systemVs = 'unknow'
    if (system === 'windows') {
      if (testUa(/windows nt 5.0|windows 2000/g)) {
        systemVs = '2000'
      } else if (testUa(/windows nt 5.1|windows xp/g)) {
        systemVs = 'xp'
      } else if (testUa(/windows nt 5.2|windows 2003/g)) {
        systemVs = '2003'
      } else if (testUa(/windows nt 6.0|windows vista/g)) {
        systemVs = 'vista'
      } else if (testUa(/windows nt 6.1|windows 7/g)) {
        systemVs = '7'
      } else if (testUa(/windows nt 6.2|windows 8/g)) {
        systemVs = '8'
      } else if (testUa(/windows nt 6.3|windows 8.1/g)) {
        systemVs = '8.1'
      } else if (testUa(/windows nt 10.0|windows 10/g)) {
        systemVs = '10'
      }
    } else if (system === 'macos') {
      systemVs = testVs(/os x [\d._]+/g)
    } else if (system === 'android') {
      systemVs = testVs(/android [\d._]+/g)
    } else if (system === 'ios') {
      systemVs = testVs(/os [\d._]+/g)
    }

    // 平台
    // let platform = 'unknow'
    // if (system === 'windows' || system === 'macos' || system === 'linux') {
    //   platform = 'pc' // 桌面端
    // } else if (system === 'android' || system === 'ios' || testUa(/mobile/g)) {
    //   platform = 'mobile' // 移动端
    // }

    // 内核+载体
    let engine = 'unknow'
    let supporter = 'unknow'
    if (testUa(/applewebkit/g)) {
      engine = 'webkit' // webkit内核
      if (testUa(/edg/g)) {
        supporter = 'edge-chrome' // edge浏览器使用chrome内核
      } else if (testUa(/edge/g)) {
        supporter = 'edge' // edge浏览器
      } else if (testUa(/opr/g)) {
        supporter = 'opera' // opera浏览器
      } else if (testUa(/chrome/g)) {
        supporter = 'chrome' // chrome浏览器
      } else if (testUa(/safari/g)) {
        supporter = 'safari' // safari浏览器
      }
    } else if (testUa(/gecko/g) && testUa(/firefox/g)) {
      engine = 'gecko' // gecko内核
      supporter = 'firefox' // firefox浏览器
    } else if (testUa(/presto/g)) {
      engine = 'presto' // presto内核
      supporter = 'opera' // opera浏览器
    } else if (testUa(/trident|compatible|msie/g)) {
      engine = 'trident' // trident内核
      supporter = 'iexplore' // iexplore浏览器
    }

    // 内核版本
    // let engineVs = 'unknow'
    // if (engine === 'webkit') {
    //   engineVs = testVs(/applewebkit\/[\d._]+/g)
    // } else if (engine === 'gecko') {
    //   engineVs = testVs(/gecko\/[\d._]+/g)
    // } else if (engine === 'presto') {
    //   engineVs = testVs(/presto\/[\d._]+/g)
    // } else if (engine === 'trident') {
    //   engineVs = testVs(/trident\/[\d._]+/g)
    // }

    // 载体版本
    let supporterVs = 'unknow'
    // if (supporter === 'chrome') {
    //   supporterVs = testVs(/chrome\/[\d._]+/g)
    // } else if (supporter === 'safari') {
    //   supporterVs = testVs(/version\/[\d._]+/g)
    // } else if (supporter === 'firefox') {
    //   supporterVs = testVs(/firefox\/[\d._]+/g)
    // } else if (supporter === 'opera') {
    //   supporterVs = testVs(/opr\/[\d._]+/g)
    // } else if (supporter === 'iexplore') {
    //   supporterVs = testVs(/(msie [\d._]+)|(rv:[\d._]+)/g)
    // } else if (supporter === 'edge') {
    //   supporterVs = testVs(/edge\/[\d._]+/g)
    // } else if (supporter === 'edge-chrome') {
    //   supporterVs = testVs(/edg\/[\d._]+/g)
    // }

    if (testUa(/micromessenger/g)) {
      supporter = 'wechat' // 微信浏览器
      supporterVs = testVs(/micromessenger\/[\d._]+/g)
    } else if (testUa(/qqbrowser/g)) {
      supporter = 'qq' // QQ浏览器
      supporterVs = testVs(/qqbrowser\/[\d._]+/g)
    } else if (testUa(/ucbrowser/g)) {
      supporter = 'uc' // UC浏览器
      supporterVs = testVs(/ucbrowser\/[\d._]+/g)
    } else if (testUa(/qihu 360se/g)) {
      supporter = '360' // 360浏览器(无版本)
      supporterVs = ''
    } else if (testUa(/2345explorer/g)) {
      supporter = '2345' // 2345浏览器
      supporterVs = testVs(/2345explorer\/[\d._]+/g)
    } else if (testUa(/metasr/g)) {
      supporter = 'sougou' // 搜狗浏览器(无版本)
      supporterVs = ''
    } else if (testUa(/lbbrowser/g)) {
      supporter = 'liebao' // 猎豹浏览器(无版本)
      supporterVs = ''
    } else if (testUa(/maxthon/g)) {
      supporter = 'maxthon' // 遨游浏览器
      supporterVs = testVs(/maxthon\/[\d._]+/g)
    }

    // const screen = `${window.screen.width}x${window.screen.height}`

    const model = 'none'

    // 获取到system、systemVs、platform、engine、engineVs、supporter、supporterVs
    return Object.assign(
      {
        // engine, // webkit gecko presto trident
        // engineVs,
        // platform, // desktop mobile
        supporter, // chrome safari firefox opera iexplore edge
        // supporterVs,
        system, // windows macos linux android ios
        systemVs,
        // screen
      },
      model === 'none'
        ? {}
        : {
          model
        }
    )
  }
  // 路由跳转
  routingJump(path) {
    this._options.pagePath = path
    this.event('pv')
  }
  // 获取一个随机字符串(全局唯一标识符)
  uuid() {
    const date = new Date()
    // yyyy-MM-dd的16进制表示,7位数字
    const hexDate = parseInt(
      `${date.getFullYear()}${this.pad(date.getMonth() + 1, 2)}${this.pad(
        date.getDate(),
        2
      )}`,
      10
    ).toString(16)
    // hh-mm-ss-ms的16进制表示，最大也是7位
    const hexTime = parseInt(
      `${this.pad(date.getHours(), 2)}${this.pad(
        date.getMinutes(),
        2
      )}${this.pad(date.getSeconds(), 2)}${this.pad(
        date.getMilliseconds(),
        3
      )}`,
      10
    ).toString(16)
    // 第8位数字表示后面的time字符串的长度
    let guid = hexDate + hexTime.length + hexTime
    // 补充随机数，补足32位的16进制数
    while (guid.length < 32) {
      guid += Math.floor(Math.random() * 16).toString(16)
    }
    // 分为三段，前两段包含时间戳信息
    return `${guid.slice(0, 8)}-${guid.slice(8, 16)}-${guid.slice(16)}`
  }
  /**
   * 补全字符
   * @param {*} num 初始值
   * @param {*} len 需要补全的位数
   * @param {*} placeholder 补全的值
   * @returns 补全后的值
   */
  pad(num, len, placeholder = '0') {
    const str = String(num)
    if (str.length < len) {
      let result = str
      for (let i = 0; i < len - str.length; i += 1) {
        result = placeholder + result
      }
      return result
    }
    return str
  }
  // 发送消息
  send(data = {}) {
    if (navigator.sendBeacon) {
      // 新特性
      navigator.sendBeacon(this.requestUrl, JSON.stringify(data))
    } else {
      // 传统方式传递参数
      const beacon = new Image()
      beacon.src = `${this.requestUrl}?v=${encodeURIComponent(
        JSON.stringify(data)
      )}`
    }
  }
  /**
   * 自定义事件
   * @param name 事件名
   * @param data 数据
   */
  event(eventType, data) {
    this.send({ ...this._options, eventType, eventInfo: data })
  }
  getUrl() {
    let url = window.location.pathname || ''
    if (window.location.href.indexOf('/group/') !== -1) {
      const _url = window.location.href.split('/group/')[1]
      url = `/group/${_url}`
    }
    return url
  }
}
