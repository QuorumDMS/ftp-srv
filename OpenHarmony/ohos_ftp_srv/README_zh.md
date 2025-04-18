# ohos_ftp_srv

## 简介

> 本软件是通过开源软件[ ftp_srv ](https://github.com/QuorumDMS/ftp-srv)移植适配到OpenHarmony，ohos_ftp_srv是一个用于OpenHarmony的FTP服务器库。使用ohos_ftp_srv开发者可以轻松地创建和管理FTP服务器，实现文件的上传、下载、目录查看、目录创建、目录删除等操作。需要支持如下条件：
> 硬件要求：OpenHarmony设备、需要网络连接和客户端设备同局域网内、足够容量的存储。
> 软件要求：OpenHarmony系统。
> 开发环境：DevEco Studio: (5.0.3.122), SDK: API12 (5.0.0.17)。


## 下载安装
```shell
ohpm install @ohos/ftp-srv 
```
OpenHarmony ohpm 环境配置等更多内容，请参考[如何安装 OpenHarmony ohpm 包](https://gitcode.com/openharmony-tpc/docs/blob/master/OpenHarmony_har_usage.md)

## 需要权限
```shell
ohos.permission.INTERNET
ohos.permission.GET_NETWORK_INFO
```

## 使用说明

 在pages页面中使用

```js
//引入
import { FtpSrv } from '@ohos/ftp-srv';

const ftpSever = new FtpSrv({
    url: "ftp://localhost:8889",
    anonymous: true,
    pasvUrl: "localhost",
    pasvMin: 8881
});
ftpSever.on('login', (user: Option, resolve: Function, reject: Function) => {
    if (user.username === 'demo' && user.password === '123456' || user.username === 'anonymous') {
        resolve({ root: getContext(this).filesDir });
    } else {
        reject('Bad username or password');
    }
});
ftpSever.listen().then(() => {
    console.log('FTP server is starting...')
});


interface Option {
    username: string,
    password: string
}
```

## 接口说明

| **接口**                                                               | 参数                                                                                                                                                                                                                                                                                                                                                                                 | 功能                                       |
|----------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------|
| new FtpSrv({options})                                                | options对象参数包含如下字段设置:</br>url(string类型): URL字符串，指定服务端连接的协议、主机名和端口;</br>pasvUrl(string类型): 当在被动模式下连接握手过程中收到命令时，向客户端提供IP地址; </br>pasvMin(number类型): 被动模式连接的起始端口; </br>pasvMax(number类型): 被动模式连接的结束端口; </br>tls(对象类型):用于显式连接的TLS安全上下文对象; </br>anonymous(布尔类型):如果为 true，将允许客户端使用用户名进行身份验证anonymous，而不需要用户提供密码;</br>blacklist(数组类型):黑名单设置不允许执行的命令数组;</br>whitelist(数组类型):白名单设置只允许执行的命令数组 | 初始化FtpSrv对象，提供连接启动服务器接口                  |
| ftpSrv.listen()                                                      | 无                                                                                                                                                                                                                                                                                                                                                                                  | 启动服务端连接监听，开启ftp服务                        |
| ftpSrv.quit()                                                              | 无                                                                                                                                                                                                                                                                                                                                                                                  | 断开服务端连接监听                                |
| ftpSrv.on(eventName, callback)                                                              | eventName:监听名称; callback:监听回调方法                                                                                                                                                                                                                                                                                                                                                    | 提供监听事件                                |
| ftpSrv.on('login', ({connection, username, password}, resolve, reject) => { ... })                           | {connection:连接对象, username:登录的用户名, password:登录的密码}, resolve:登录成功完成执行函数, reject:登录失败完成执行函数                                                                                                                                                                                                                                                                                          | 登录监听器：客户端尝试登录时触发，在这里可以通过用户名和密码判断是否为目标用户。 |
| ftpSrv.on('client-error', ({connection, context, error}) => { ... }) | connection:连接对象, context:上下文对象, error:错误信息对象                                                                                                                                                                                                                                                                                                                                       | 当客户端连接出现错误时触发。                              |
| ftpSrv.on('disconnect', ({connection, id, newConnectionCount}) => { ... })      | connection:连接对象, id:断开连接的对象uuid, newConnectionCount:当前的连接数量                                                                                                                                                                                                                                                                                                                        | 当客户端断开连接时触发。                      |
| ftpSrv.on('closed', ({}) => { ... })      | ({}) => { ... }:空的回调函数                                                                                                                                                                                                                                                                                                                                                             | 当FTP服务器关闭时触发。                    |
| ftpSrv.on('server-error', ({error}) => { ... })      | error:错误信息对象                                                                                                                                                                                                                                                                                                                                                                       | 当FTP服务器出现错误时触发。                      |

## 关于混淆
- 代码混淆，请查看[代码混淆简介](https://docs.openharmony.cn/pages/v5.0/zh-cn/application-dev/arkts-utils/source-obfuscation.md)
- 如果希望ohos_ftp_srv库在代码混淆过程中不会被混淆，需要在混淆规则配置文件obfuscation-rules.txt中添加相应的排除规则：
```
-keep
./oh_modules/@ohos/ftp-srv
```

# 约束与限制

在下述版本验证通过：

- DevEco Studio: NEXT Beta1-5.0.3.806, SDK:API12 Release(5.0.0.66)
- DevEco Studio: (5.0.3.122), SDK: API12 (5.0.0.17)

## 目录结构
````
|---- ohos_ftp_srv  
|     |---- entry  # 示例代码文件夹
|     |---- library  # ftp-srv库文件夹
|           |---- index.ts  # 对外接口
|           └─src/main/ets/commands
|                          ├─registration # ftp命令实现目录，包含各种命令的处理文件
|                          ├─index.ts # 命令类
|                          └─registry.ts # 注册的命令的处理文件
|           └─src/main/ets/connector
|                          ├─active.ts # 主动模式处理逻辑
|                          ├─base.ts # 模式处理基础类
|                          └─passive.ts # 被动模式处理逻辑
|           └─src/main/ets/helpers
|                          ├─escape-path.ts # 路径处理
|                          ├─event-emitter.ts # 事件监听处理类
|                          ├─file-stat.ts # 服务端交互客户端信息文件条目格式化处理
|                          ├─find-port.ts # 查询空闲端口
|                          ├─logger.ts # 日志打印处理
|                          ├─path-util.ts # 文件路径处理
|                          └─promise-util.ts # promise异步功能工具类
|                     |---- connection.ts  # FTP 连接处理逻辑
|                     |---- errors.ts  # 异常类
|                     |---- fs.ts  # 文件系统接口实现
|                     |---- index.ts  # ftp服务器启动监听等处理逻辑
|                     |---- messages.ts  # ftp状态码信息
|---- README.md  # 安装使用方法       
|---- README_zh.md  # 安装使用方法                  
````

## 贡献代码
使用过程中发现任何问题都可以提 [Issue](https://gitcode.com/openharmony-tpc/ohos_ftp_srv/issues) 给组件，当然，也非常欢迎给发 [PR](https://gitcode.com/openharmony-tpc/ohos_ftp_srv/pulls)共建 。

## 开源协议
本项目基于 [MIT License](https://gitcode.com/openharmony-tpc/ohos_ftp_srv/blob/master/LICENSE) ，请自由地享受和参与开源。
