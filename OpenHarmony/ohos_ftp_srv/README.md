# ohos_ftp_srv

## Introduction

> ohos_ftp_srv is an FTP server library adapted for OpenHarmony based on the open-source software [ftp_srv](https://github.com/QuorumDMS/ftp-srv). With this library, you can easily create and manage an FTP server to upload and download files, and view, create, and delete directories. To use this library, the following requirements must be met:
>
> - Hardware requirements: OpenHarmony devices, network connections and client devices (in the same LAN and with sufficient storage capacity)
> - Software requirements: OpenHarmony
> - Development environment: DevEco Studio: (5.0.3.122), SDK: API 12 (5.0.0.17)


## How to Install
```shell
ohpm install @ohos/ftp-srv 
```
For details about the OpenHarmony ohpm environment configuration, see [OpenHarmony HAR](https://gitcode.com/openharmony-tpc/docs/blob/master/OpenHarmony_har_usage.en.md).

## Required Permissions
```shell
ohos.permission.INTERNET
ohos.permission.GET_NETWORK_INFO
```

## How to Use

Use the project in pages.

```js
// Import the project.
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

## Available APIs

| API                                                    | Parameter                                                        | Description                                                        |
| ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| new FtpSrv({options})                                        | Fields of **options**:<br>**url** (string type): URL string, which specifies the scheme, host name, and port number for connecting to the server.<br>**pasvUrl** (string type): IP address, which is provided to the client when a command is received during the connection handshake in passive mode.<br>**pasvMin** (number type): start port of the connection in passive mode.<br>**pasvMax** (number type): end port of the connection in passive mode.<br>**tls** (object type): TLS context object of the explicit connection.<br>**anonymous** (Boolean type): If this field is set to **true**, the client can be authenticated with only a username, without the use of a password.<br>**blacklist** (array type): array of commands that cannot be executed.<br>**whitelist** (array type): array of commands that can be executed.| Initializes an **FtpSrv** object and provides the interface for connecting to the server.                    |
| ftpSrv.listen()                                              | N/A                                                          | Starts server connection listening and enables the FTP service.                             |
| ftpSrv.quit()                                                | N/A                                                          | Quits server connection listening.                                          |
| ftpSrv.on(eventName, callback)                               | **eventName**: listener name; **callback**: listener callback.                   | Provides listening events.                                                |
| ftpSrv.on('login', ({connection, username, password}, resolve, reject) => { ... }) | {**connection**: connection object; **username**: login username; **password**: login password}; **resolve**: function executed upon a successful login; **reject**: function executed upon a failed login.| This event is triggered when the client attempts to log in to the server. The server can determine whether the user is the target user based on the username and password.|
| ftpSrv.on('client-error', ({connection, context, error}) => { ... }) | **connection**: connection object; context: **context** object; **error**: error information object. | This event is triggered when an error occurs during client connection.                                |
| ftpSrv.on('disconnect', ({connection, id, newConnectionCount}) => { ... }) | **connection**: connection object; **id**: UUID of the object to disconnect; **newConnectionCount**: number of current connections.| This event is triggered when the client is disconnected.                                    |
| ftpSrv.on('closed', ({}) => { ... })                         | ({}) => { ... }: empty callback function.                                | This event is triggered when the FTP server is shut down.                                     |
| ftpSrv.on('server-error', ({error}) => { ... })              | **error**: error information object.                                          | This event is triggered when an error occurs on the FTP server.                                 |

## About obfuscation
- Code obfuscation, please see[Code Obfuscation](https://docs.openharmony.cn/pages/v5.0/zh-cn/application-dev/arkts-utils/source-obfuscation.md)
- If you want the ftp-srv library not to be obfuscated during code obfuscation, you need to add corresponding exclusion rules in the obfuscation rule configuration file obfuscation-rules.txt：
```
-keep
./oh_modules/@ohos/ftp-srv
```

# Constraints

This project has been verified in the following versions:

- DevEco Studio: NEXT Beta1-5.0.3.806, SDK: API 12 Release (5.0.0.66)
- DevEco Studio: (5.0.3.122), SDK: API 12 (5.0.0.17)

## Directory Structure
````
|---- ohos_ftp_srv  
|     |---- entry  # Sample code
|     |---- library  # ftp-srv library folder
|           |---- Index.ts  # External APIs
|           └─src/main/ets/commands
|                          ├─registration # Directory of FTP command implementation, including the processing files of various commands
|                          ├─index.ts # Command class
|                          └─registry.ts # Processing file of registered commands
|           └─src/main/ets/connector
|                          ├─active.ts # Processing logic in active mode
|                          ├─base.ts # Basic class for pattern processing
|                          └─passive.ts # Processing logic in passive mode
|           └─src/main/ets/helpers
|                          ├─escape-path.ts # Path processing
|                          ├─event-emitter.ts # Event listening processing class
|                          ├─file-stat.ts # Format processing for the entries in the file that contains message interaction between the server and the client
|                          ├─find-port.ts # Query idle ports
|                          ├─logger.ts # Print logs
|                          ├─path-util.ts # File path processing
|                          └─promise-util.ts # Utility class in promise mode
|                     |---- connection.ts  # FTP connection processing logic
|                     |---- errors.ts  # Exception class
|                     |---- fs.ts  # File system interface implementation 
|                     |---- index.ts  # Processing logic such as listening startup on the FTP server
|                     |---- messages.ts  # FTP status code information
|---- README.md  # Readme        
|---- README_zh.md  # Readme               
````

## How to Contribute
If you find any problem during the use, submit an [issue](https://gitcode.com/openharmony-tpc/ohos_ftp_srv/issues) or a [PR](https://gitcode.com/openharmony-tpc/ohos_ftp_srv/pulls).

## License
This project is licensed under [MIT License](https://gitcode.com/openharmony-tpc/ohos_ftp_srv/blob/master/LICENSE).
