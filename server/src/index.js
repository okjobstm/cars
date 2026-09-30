import connectDB from './config/connectDB.js';
import { app } from './app.js';

process.on('uncaughtException', (err) => {
    console.error('[FATAL] Uncaught Exception:', err);
    process.exit(1);
});

process.on('unhandledRejection', (reason) => {
    console.error('[FATAL] Unhandled Rejection:', reason);
    process.exit(1);
});

const requiredEnv = ['MONGODB_URI'];
requiredEnv.forEach(v => {
    if (!process.env[v]) {
        console.warn(`[CONFIG WARNING] Missing ${v}. Define it in .env`);
    }
});

connectDB().catch(err => {
    console.error('[FATAL] Database Connection Failed:', err.message);
    process.exit(1);
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

