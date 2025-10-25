import 'dotenv/config';     
import app from './app.js'; 

const PORT = process.env.PORT || 4000;

function startServer() {
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
    console.log(`🔗 Health check available at http://localhost:${PORT}/ping`);
  });
}

startServer();