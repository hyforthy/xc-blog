import next from 'next';
import { createServer } from 'http';

// 解析命令行参数
function parseArgs() {
  const args = process.argv.slice(2);
  const result: { host?: string; port?: number } = {};
  
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--host' && args[i+1]) {
      result.host = args[i+1];
      i++;
    } else if (args[i] === '--port' && args[i+1]) {
      result.port = parseInt(args[i+1]);
      i++;
    }
  }
  return result;
}

const { host = 'localhost', port = 3000 } = parseArgs();

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

// 打印环境变量和参数
console.log('服务启动配置:', {
  NODE_ENV: process.env.NODE_ENV,
  主机地址: host,
  端口号: port
});

app.prepare().then(() => {
  createServer((req, res) => {
    handle(req, res);
  }).listen(port, host, () => {
    console.log(`> Ready on http://${host}:${port}`);
  });
});