```ts
const loginMiddleware = () => (client) => {
  let username;
  let password;

  return {
    USER(client, command) => {
      username = command.arg;
    },
    PASS(client, command) => {
      password = command.arg;
    }
  };
}

const fileSystemMiddleware = () => (client) => {
  return {
    CWD(client, command) => {},
    CDUP(client) => {},
  }
}

const transferMiddleware = () => (client) => {

}

client.use(loginMiddleware());
```

 5.1.  MINIMUM IMPLEMENTATION

      In order to make FTP workable without needless error messages, the
      following minimum implementation is required for all servers:

         TYPE - ASCII Non-print
         MODE - Stream
         STRUCTURE - File, Record
         COMMANDS - USER, QUIT, PORT,
                    TYPE, MODE, STRU,
                      for the default values
                    RETR, STOR,
                    NOOP.

      The default values for transfer parameters are:

         TYPE - ASCII Non-print
         MODE - Stream
         STRU - File
