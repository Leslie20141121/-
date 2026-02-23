# SumStack - 数字消除益智游戏

一个基于数学求和逻辑的消除类益智游戏，使用 React + TypeScript + Tailwind CSS 开发。

## 游戏特点

- **核心玩法**：点击方块使数字相加等于目标数字即可消除。
- **两种模式**：
  - **经典模式**：每次成功消除后新增一行，挑战生存极限。
  - **计时模式**：每 10 秒强制新增一行，考验反应速度。
- **动态体验**：流畅的方块下落动画和交互反馈。
- **响应式设计**：完美适配手机和电脑端。

## 本地开发

1. 克隆仓库：
   ```bash
   git clone <your-repo-url>
   cd sumstack
   ```

2. 安装依赖：
   ```bash
   npm install
   ```

3. 启动开发服务器：
   ```bash
   npm run dev
   ```

## 部署到 Vercel

本项目已针对 Vercel 进行优化。您可以直接将 GitHub 仓库连接到 Vercel：

1. 在 Vercel 仪表板中点击 "New Project"。
2. 选择您的 GitHub 仓库。
3. Vercel 会自动识别 Vite 配置。
4. 点击 "Deploy" 即可。

## 技术栈

- **框架**: [React 19](https://react.dev/)
- **构建工具**: [Vite](https://vitejs.dev/)
- **样式**: [Tailwind CSS](https://tailwindcss.com/)
- **动画**: [Motion](https://motion.dev/)
- **图标**: [Lucide React](https://lucide.dev/)

## 许可证

MIT
