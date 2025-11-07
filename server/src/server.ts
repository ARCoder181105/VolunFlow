import 'dotenv/config';
import app, { setupServer } from './app.js'; // Import app and setup function

// Use the PORT from .env, or default to 5000
const PORT = process.env.PORT || 5000;

/**
 * Starts the application.
 */
async function start() {
  try {
    // Wait for the server setup (like Apollo) to complete
    await setupServer();

    // Start listening for requests
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
      console.log(`🔗 Health check available at http://localhost:${PORT}/ping`);
      console.log(`🛰️  GraphQL endpoint at http://localhost:${PORT}/api/v1/graphql`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Run the startup function
start();