import express from 'express';
import aiRecommendRouter from './routes/ai-recommend';

const app = express();

app.use(express.json());

// 注册 AI 推荐路由
app.use('/api/ai-recommend', aiRecommendRouter);

// ... 其他路由和中间件 ...

export default app; 