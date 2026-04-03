require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`\n🚀 Freedom Journey API running on port ${PORT}`);
  console.log(`   ENV : ${process.env.NODE_ENV || 'development'}`);
  console.log(`   AI  : ${process.env.AI_PROVIDER || 'groq'}`);
  console.log(`   Mail: ${process.env.EMAIL_PROVIDER || 'resend'}\n`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
