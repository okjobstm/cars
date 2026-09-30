import connectDB from './config/connectDB.js';
import { app } from './app.js';

// Serverless: on ne kill pas l'instance sur une erreur (chaque invocation
// doit survive a un hiccup Mongo), on laisse remonter pour logger.
process.on('unhandledRejection', (reason) => {
    console.error('[FATAL] Unhandled Rejection:', reason);
});

await connectDB();

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

export default app;
