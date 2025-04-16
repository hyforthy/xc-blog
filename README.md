# xc-blog

simple personal blog

## 预先准备

- 拉取代码： `git clone https://github.com/hyforthy/xc-blog.git`。

- 安装 nodejs 20 或 20+。

## 开发

```shell
pnpm install
node scripts/init-db.mjs
pnpm run dev
```

也可指定ip和端口

```shell
pnpm run dev -- -H  0.0.0.0 -p  3001
```

默认是浏览端，管理端url：/admin，管理端用户名密码：admin，123456。

## 部署

重设JWT_SECRET密钥，在根目录下 `.env.production` 内。

### 1. 安装依赖

```shell
pnpm install
```

### 2. 初始化

初始化数据库，设置管理员用户名和密码，`<username>`和`<passwd>`替换为自己的用户名和密码。

```shell
node scripts/init-db.mjs -u <username> -p <passwd>
```

### 3. 构建

```shell
pnpm build
```

### 2. 运行

- 常规运行（终端窗口关闭，服务也会关闭）

    ```shell
    pnpm start
    ```

- 后台常驻运行
    1. 先安装pm2

        ```shell
        npm install pm2 -g
        ```

    2. 启动

        ```shell
        pm2 start "pnpm start" --name "xc-blog-app" # 启动应用
        pm2 save  # 保存进程列表到磁盘
        pm2 startup # 配置开机自启动
        ```

        也可通过pm2重启、关闭、查看等来管理应用

        ```shell
        pm2 logs xc-blog-app
        pm2 restart xc-blog-app
        pm2 stop xc-blog-app
        pm2 delete xc-blog-app
        ```
