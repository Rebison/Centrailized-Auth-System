import { createServer } from "http";
import app from "./app.js";
import { connectDB } from "./src/config/db.js";
import env from "./src/config/env.js";

async function startServer() {
  await connectDB();

  const server = createServer(app);

  server.listen(env.PORT, () => {
    console.log(`Server running on port ${env.PORT}`);
  });

  const exitHandler = () => {
    if (server) {
      server.close(() => {
        console.log('Server closed');
        process.exit(1);
      });
    } else {
      process.exit(1);
    }
  };

  const unexpectedErrorHandler = (error) => {
    console.error(error);
    exitHandler();
  };

  process.on('uncaughtException', unexpectedErrorHandler);
  process.on('unhandledRejection', unexpectedErrorHandler);

  process.on('SIGTERM', () => {
    exitHandler();
  });

  process.on('SIGINT', () => {
    exitHandler();
  });
}

startServer();