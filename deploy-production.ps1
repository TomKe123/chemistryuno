#!/usr/bin/env pwsh
# Chemistry UNO 生产环境一键部署脚本 (PowerShell)
# 作者: Chemistry UNO Team
# 日期: 2026-01-04

param(
    [switch]$SkipBuild,
    [switch]$SkipTests,
    [switch]$WithSSL,
    [switch]$Clean,
    [switch]$Help
)

# 颜色输出函数
function Write-ColorOutput($ForegroundColor, $Message) {
    Write-Host $Message -ForegroundColor $ForegroundColor
}

function Write-Success($Message) {
    Write-ColorOutput Green "✓ $Message"
}

function Write-Error-Message($Message) {
    Write-ColorOutput Red "✗ $Message"
}

function Write-Info($Message) {
    Write-ColorOutput Cyan "ℹ $Message"
}

function Write-Warning-Message($Message) {
    Write-ColorOutput Yellow "⚠ $Message"
}

# 显示帮助信息
if ($Help) {
    Write-Host @"
Chemistry UNO 生产环境一键部署脚本

用法: .\deploy-production.ps1 [选项]

选项:
  -SkipBuild      跳过构建步骤
  -SkipTests      跳过测试步骤
  -WithSSL        启用SSL/HTTPS支持
  -Clean          清理所有容器和镜像后重新部署
  -Help           显示此帮助信息

示例:
  .\deploy-production.ps1                    # 标准部署
  .\deploy-production.ps1 -WithSSL           # 启用SSL的部署
  .\deploy-production.ps1 -Clean             # 清理后重新部署
  .\deploy-production.ps1 -SkipBuild         # 跳过构建直接部署

"@
    exit 0
}

Write-ColorOutput Magenta @"
╔═══════════════════════════════════════════════════════════╗
║     Chemistry UNO - 生产环境一键部署脚本                 ║
║     版本: 1.0.0                                          ║
╚═══════════════════════════════════════════════════════════╝
"@

# 检查必要的命令
Write-Info "检查必要的依赖..."

$commands = @("pnpm", "docker", "docker-compose", "node")
$missingCommands = @()

foreach ($cmd in $commands) {
    if (!(Get-Command $cmd -ErrorAction SilentlyContinue)) {
        $missingCommands += $cmd
    }
}

if ($missingCommands.Count -gt 0) {
    Write-Error-Message "缺少以下必要命令: $($missingCommands -join ', ')"
    Write-Info "请先安装缺少的工具"
    exit 1
}
Write-Success "所有依赖检查通过"

# 检查 Node.js 和 pnpm 版本
$nodeVersion = node --version
$pnpmVersion = pnpm --version
Write-Info "Node.js 版本: $nodeVersion"
Write-Info "pnpm 版本: $pnpmVersion"

# 清理选项
if ($Clean) {
    Write-Warning-Message "清理模式: 将停止并删除所有容器和镜像"
    $confirm = Read-Host "确认继续? (y/N)"
    if ($confirm -ne "y" -and $confirm -ne "Y") {
        Write-Info "已取消"
        exit 0
    }
    
    Write-Info "停止并删除容器..."
    docker-compose -f docker-compose.production.yml down -v
    
    Write-Info "删除旧镜像..."
    docker rmi chemistry-uno-app -f 2>$null
    
    Write-Success "清理完成"
}

# 安装依赖
Write-Info "安装项目依赖..."
pnpm install
if ($LASTEXITCODE -ne 0) {
    Write-Error-Message "依赖安装失败"
    exit 1
}
Write-Success "依赖安装完成"

# 运行测试（可选）
if (-not $SkipTests) {
    Write-Info "运行健康检查..."
    try {
        pnpm run health
        Write-Success "健康检查通过"
    } catch {
        Write-Warning-Message "健康检查失败，但继续部署"
    }
}

# 构建前端
if (-not $SkipBuild) {
    Write-Info "构建前端应用..."
    pnpm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Error-Message "前端构建失败"
        exit 1
    }
    Write-Success "前端构建完成"
    
    Write-Info "构建后端应用..."
    pnpm run build:server
    if ($LASTEXITCODE -ne 0) {
        Write-Error-Message "后端构建失败"
        exit 1
    }
    Write-Success "后端构建完成"
} else {
    Write-Warning-Message "跳过构建步骤"
}

# 检查配置文件
if (-not (Test-Path "config.json")) {
    Write-Warning-Message "未找到 config.json，将使用默认配置"
    Copy-Item "config.json.example" "config.json" -ErrorAction SilentlyContinue
}

# 构建 Docker 镜像
Write-Info "构建 Docker 镜像..."
$dockerComposeCmd = "docker-compose -f docker-compose.production.yml"
if ($WithSSL) {
    $env:COMPOSE_PROFILES = "with-ssl"
    Write-Info "启用 SSL 支持"
}

& docker-compose -f docker-compose.production.yml build --no-cache
if ($LASTEXITCODE -ne 0) {
    Write-Error-Message "Docker 镜像构建失败"
    exit 1
}
Write-Success "Docker 镜像构建完成"

# 停止旧容器
Write-Info "停止旧容器..."
docker-compose -f docker-compose.production.yml down
Write-Success "旧容器已停止"

# 启动新容器
Write-Info "启动生产环境容器..."
if ($WithSSL) {
    docker-compose -f docker-compose.production.yml --profile with-ssl up -d
} else {
    docker-compose -f docker-compose.production.yml up -d
}

if ($LASTEXITCODE -ne 0) {
    Write-Error-Message "容器启动失败"
    exit 1
}
Write-Success "容器启动成功"

# 等待服务启动
Write-Info "等待服务启动..."
Start-Sleep -Seconds 5

# 检查容器状态
Write-Info "检查容器状态..."
docker-compose -f docker-compose.production.yml ps

# 显示日志（最后10行）
Write-Info "最近的日志:"
docker-compose -f docker-compose.production.yml logs --tail=10

# 部署成功信息
Write-ColorOutput Green @"

╔═══════════════════════════════════════════════════════════╗
║                    部署成功！                            ║
╚═══════════════════════════════════════════════════════════╝

"@

Write-Success "Chemistry UNO 已成功部署到生产环境"
Write-Info ""
Write-Info "访问地址:"
Write-Info "  - HTTP:  http://localhost"
if ($WithSSL) {
    Write-Info "  - HTTPS: https://localhost"
}
Write-Info "  - API:   http://localhost:5000"
Write-Info ""
Write-Info "常用命令:"
Write-Info "  查看日志:   docker-compose -f docker-compose.production.yml logs -f"
Write-Info "  停止服务:   docker-compose -f docker-compose.production.yml down"
Write-Info "  重启服务:   docker-compose -f docker-compose.production.yml restart"
Write-Info "  查看状态:   docker-compose -f docker-compose.production.yml ps"
Write-Info ""
Write-ColorOutput Cyan "祝你游戏愉快！ 🧪🎮"
