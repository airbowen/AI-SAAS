
# Interview Helper SaaS

💡 AI 面试助手平台：用户注册/登录 + 充值 + 使用 GPT/Whisper 功能。

## 启动方式

```bash
docker-compose up --build
```

## 功能概览

- 用户系统（注册、登录、JWT）
- 共享屏幕，麦克风权限，调用语音转本文服务
- OpenAI API 生成回答
- 消费系统（余额控制 + 扣费记录）

## 技术划分
1. 前端功能：
- 实现音频共享功能，捕获用户的语音
- 通过 WebSocket 将音频数据实时发送到后端
- 接收并显示语音转文字的结果
- 显示 AI 的分析反馈
2. 后端功能：
- 建立 WebSocket 服务器接收音频数据
- 集成腾讯云语音识别服务，将音频转换为文字
- 调用 OpenAI API 分析面试回答内容
- 将转录文本和分析结果实时返回给前端
3. 技术架构：
- 前端：Next.js + WebSocket 客户端
- 后端：Express + WebSocket 服务器
- 第三方服务：
  - 腾讯云语音识别
  - OpenAI GPT API
- 数据库：MySQL 
    - 存储用户信息、余额、扣费记录
    - 存储用户调用记录
    - 存储 OpenAI API 调用记录
    - 存储用户音频数据（用户 ID、音频数据、时间戳）
