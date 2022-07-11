# wonder-statistic
杭州网达埋点统计

## 安装
```
npm install wonder-statistic -S
```

## 使用
```js
// 引用
import WonderStatistic from 'wonder-statistic';

// 注册
window.webtracing = new WonderStatistic()

// 初始化
window.webtracing.init({
  requestUrl: 'http://xxxx/tracing', // 请求路径
  appName: 'xxx', // 应用名
  eventCenter: eventCenter, // taro监听事件，可选
  appType: 'taro', // 应用类型，可选
})

/**
 * 自定义事件
 * @param name 事件名
 * @param optionsObj 事件参数
 */
window.webtracing.event(name, optionsObj)
```

### 参数
返回参数-暂定
```json
{
  "appName": "", // 应用名
  "userId": "", // 用户标识
  "pagePath": "", // 页面路径
  "source": "", // 访问来源
  "deviceInfo":{ // 设备信息
    "engine": "", // 浏览器内核
    "engineVs": "", // 浏览器内核版本
    "platform": "", // 平台
    "supporter": "", // 浏览器
    "supporterVs": "", // 浏览器版本
    "system": "", // 系统
    "systemVs":" ", // 系统版本
    "screen": "" // 屏幕分辨率
  },
  "location": {
    "country": "", // 国家
    "region":" ", // 省份
    "city": "" // 城市
  },
  "eventInfo": {}, // 自定义事件对象
  "pageTimeSrc": "", // 停留页面
  "pageTime": "", // 停留时间
  "typeName":"" // 事件名
}
```