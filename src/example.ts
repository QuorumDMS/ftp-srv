import { createFTPServer } from './';
import { createGreetingMiddleware } from './middleware/greeting';
import { createLoginMiddleware } from './middleware/login';

createFTPServer({
  port: 2121,
  hostname: 'localhost'
})
.use(createGreetingMiddleware({message: 'Hello World!'}))
.use(createLoginMiddleware(
  (username, password) => {
    return username === 'sudo' && password === 'password'
  },
  {requirePassword: true, requireAccount: false}
))
.listen();
