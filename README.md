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
 * 服务端用户登录
 * @param token
 */
window.webtracing.login(token)

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
  "distinctId": "", // 浏览器用户标识
  "pagePath": "", // 页面路径
  "source": "", // 访问来源
  "supporter": "", // 浏览器
  "system": "", // 系统
  "systemVs":" ", // 系统版本
  "region":" ", // 省份
  "city": "" ,// 城市
  "eventInfo": {}, // 自定义事件对象
  "pageTimeSrc": "", // 停留页面
  "pageTime": "", // 停留时间
  "eventType":"", // 事件名
  "token": "" // 登录用户标识
}
```