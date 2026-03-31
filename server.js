import dotenv from 'dotenv';
import mongoose from 'mongoose';
import expressServer from "./app";

dotenv.config({ path: './config.env' });

const DATABASE_URI = process.env.DATABASE_URI;

mongoose.connect(DATABASE_URI)
  .then(() => console.log('Connected to database'));

const PORT = process.env.PORT ?? 8181;

expressServer.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});