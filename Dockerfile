# 使用 Node.js 官方镜像作为基础
FROM node:18-alpine

# 安装 pnpm
RUN corepack enable && corepack prepare pnpm@8.15.0 --activate

# 设置工作目录
WORKDIR /app

# 设置环境变量
ENV NODE_ENV=production

# 复制项目文件
COPY . .

# 安装后端依赖
WORKDIR /app/server
RUN pnpm install --prod

# 安装前端依赖
WORKDIR /app/client
RUN pnpm install --prod && pnpm run build

# 回到根目录
WORKDIR /app

# 暴露端口
EXPOSE 5000 3000

# 启动脚本
CMD ["sh", "-c", "cd server && pnpm start & cd ../client && pnpm start && wait"]
