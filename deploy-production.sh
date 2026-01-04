#!/bin/bash
# Chemistry UNO 生产环境一键部署脚本 (Bash)
# 作者: Chemistry UNO Team
# 日期: 2026-01-04

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 参数
SKIP_BUILD=false
SKIP_TESTS=false
WITH_SSL=false
CLEAN=false

# 解析参数
while [[ $# -gt 0 ]]; do
    case $1 in
        --skip-build)
            SKIP_BUILD=true
            shift
            ;;
        --skip-tests)
            SKIP_TESTS=true
            shift
            ;;
        --with-ssl)
            WITH_SSL=true
            shift
            ;;
        --clean)
            CLEAN=true
            shift
            ;;
        --help|-h)
            cat << EOF
Chemistry UNO 生产环境一键部署脚本

用法: ./deploy-production.sh [选项]

选项:
  --skip-build    跳过构建步骤
  --skip-tests    跳过测试步骤
  --with-ssl      启用SSL/HTTPS支持
  --clean         清理所有容器和镜像后重新部署
  --help, -h      显示此帮助信息

示例:
  ./deploy-production.sh                    # 标准部署
  ./deploy-production.sh --with-ssl         # 启用SSL的部署
  ./deploy-production.sh --clean            # 清理后重新部署
  ./deploy-production.sh --skip-build       # 跳过构建直接部署

EOF
            exit 0
            ;;
        *)
            echo -e "${RED}未知参数: $1${NC}"
            echo "使用 --help 查看帮助"
            exit 1
            ;;
    esac
done

# 输出函数
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${CYAN}ℹ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_header() {
    echo -e "${MAGENTA}$1${NC}"
}

# 显示标题
print_header "╔═══════════════════════════════════════════════════════════╗"
print_header "║     Chemistry UNO - 生产环境一键部署脚本                 ║"
print_header "║     版本: 1.0.0                                          ║"
print_header "╚═══════════════════════════════════════════════════════════╝"
echo ""

# 检查必要的命令
print_info "检查必要的依赖..."

REQUIRED_COMMANDS=("pnpm" "docker" "docker-compose" "node")
MISSING_COMMANDS=()

for cmd in "${REQUIRED_COMMANDS[@]}"; do
    if ! command -v "$cmd" &> /dev/null; then
        MISSING_COMMANDS+=("$cmd")
    fi
done

if [ ${#MISSING_COMMANDS[@]} -ne 0 ]; then
    print_error "缺少以下必要命令: ${MISSING_COMMANDS[*]}"
    print_info "请先安装缺少的工具"
    exit 1
fi
print_success "所有依赖检查通过"

# 检查版本
NODE_VERSION=$(node --version)
PNPM_VERSION=$(pnpm --version)
print_info "Node.js 版本: $NODE_VERSION"
print_info "pnpm 版本: $PNPM_VERSION"

# 清理选项
if [ "$CLEAN" = true ]; then
    print_warning "清理模式: 将停止并删除所有容器和镜像"
    read -p "确认继续? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "已取消"
        exit 0
    fi
    
    print_info "停止并删除容器..."
    docker-compose -f docker-compose.production.yml down -v
    
    print_info "删除旧镜像..."
    docker rmi chemistry-uno-app -f 2>/dev/null || true
    
    print_success "清理完成"
fi

# 安装依赖
print_info "安装项目依赖..."
pnpm install
print_success "依赖安装完成"

# 运行测试（可选）
if [ "$SKIP_TESTS" = false ]; then
    print_info "运行健康检查..."
    if pnpm run health; then
        print_success "健康检查通过"
    else
        print_warning "健康检查失败，但继续部署"
    fi
fi

# 构建前端
if [ "$SKIP_BUILD" = false ]; then
    print_info "构建前端应用..."
    pnpm run build
    print_success "前端构建完成"
    
    print_info "构建后端应用..."
    pnpm run build:server
    print_success "后端构建完成"
else
    print_warning "跳过构建步骤"
fi

# 检查配置文件
if [ ! -f "config.json" ]; then
    print_warning "未找到 config.json，将使用默认配置"
    if [ -f "config.json.example" ]; then
        cp config.json.example config.json
    fi
fi

# 构建 Docker 镜像
print_info "构建 Docker 镜像..."
if [ "$WITH_SSL" = true ]; then
    export COMPOSE_PROFILES="with-ssl"
    print_info "启用 SSL 支持"
fi

docker-compose -f docker-compose.production.yml build --no-cache
print_success "Docker 镜像构建完成"

# 停止旧容器
print_info "停止旧容器..."
docker-compose -f docker-compose.production.yml down
print_success "旧容器已停止"

# 启动新容器
print_info "启动生产环境容器..."
if [ "$WITH_SSL" = true ]; then
    docker-compose -f docker-compose.production.yml --profile with-ssl up -d
else
    docker-compose -f docker-compose.production.yml up -d
fi
print_success "容器启动成功"

# 等待服务启动
print_info "等待服务启动..."
sleep 5

# 检查容器状态
print_info "检查容器状态..."
docker-compose -f docker-compose.production.yml ps

# 显示日志（最后10行）
print_info "最近的日志:"
docker-compose -f docker-compose.production.yml logs --tail=10

# 部署成功信息
echo ""
print_header "╔═══════════════════════════════════════════════════════════╗"
print_header "║                    部署成功！                            ║"
print_header "╚═══════════════════════════════════════════════════════════╝"
echo ""

print_success "Chemistry UNO 已成功部署到生产环境"
echo ""
print_info "访问地址:"
print_info "  - HTTP:  http://localhost"
if [ "$WITH_SSL" = true ]; then
    print_info "  - HTTPS: https://localhost"
fi
print_info "  - API:   http://localhost:5000"
echo ""
print_info "常用命令:"
print_info "  查看日志:   docker-compose -f docker-compose.production.yml logs -f"
print_info "  停止服务:   docker-compose -f docker-compose.production.yml down"
print_info "  重启服务:   docker-compose -f docker-compose.production.yml restart"
print_info "  查看状态:   docker-compose -f docker-compose.production.yml ps"
echo ""
echo -e "${CYAN}祝你游戏愉快！ 🧪🎮${NC}"
