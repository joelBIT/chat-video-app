import mongoose from 'mongoose';
import expressServer from "./app";

process.on("unhandledRejection", (reason) => {
    console.error("Unhandled rejection:", reason);
});

process.on("uncaughtException", (error) => {
    console.error("Uncaught exception:", error);
    process.exit(1);            // State may be corrupt: exit and let Docker restart the container
});

const DATABASE_URI = process.env.DATABASE_URI;
mongoose.connect(DATABASE_URI)
    .then(() => console.log('Connected to database'))
    .catch((error) => { console.error(error); process.exit(1); });

const PORT = process.env.PORT ?? 8181;
expressServer.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});