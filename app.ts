import { createServer } from 'node:https';
import { readFileSync } from 'node:fs';
import express from 'express';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import {authenticateNamespaces, login} from "./src/serverApplication/middleware/auth.ts";
import {initializeHomeEvents} from "./src/serverApplication/events/homeEvents.ts";
import {initializeDmEvents} from "./src/serverApplication/events/dmEvents.ts";
import {initializeGamesEvents} from "./src/serverApplication/events/gamesEvents.ts";
import {initializeCommonEvents} from "./src/serverApplication/events/commonEvents.ts";
import {initializeMainNamespaceEvents} from "./src/serverApplication/events/mainEvents.ts";
import {initializeWebRtcEvents} from "./src/serverApplication/events/webRtcEvents.ts";
import userRouter from "./src/serverApplication/routes/userRoutes.ts";
import type { ActionState } from './src/types.ts';

dotenv.config({ path: './config.env' });
if (!process.env.SESSION_SECRET) {
    throw new Error("SESSION_SECRET must be set");     // Fail fast instead of at the first login
}

const app = express();
app.use(express.static(import.meta.dirname + "/dist/"));
app.use(express.json());
app.use(express.urlencoded({ extended: true}));

app.use('/register', userRouter);

app.all('/{*path}', async (req, res) => {
    res.redirect(`https://${req.get('host')}`);
});

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {      // Global error handling
    console.log(err.stack);
    err.statusCode = err.statusCode || 500;

    const response: ActionState = {
        success: err.success || false,
        message: err.message
    }

    res.status(err.statusCode).json(response);
});

const expressServer = createServer({
    key: readFileSync('./privkey.pem'), 
    cert: readFileSync('./fullchain.pem')
}, app);

const ORIGIN: string = process.env.NODE_ENV === 'production' ? process.env.URL as string : "https://localhost";

// Create our socket.io server... it will listen to our express port
const io = new Server(expressServer, {
    cors: {
        origin: [
            ORIGIN
        ],
        methods: ["GET", "POST"]
    }
});

login(io);
authenticateNamespaces(io);
initializeMainNamespaceEvents(io);
initializeCommonEvents(io);
initializeHomeEvents(io);
initializeDmEvents(io);
initializeGamesEvents(io);
initializeWebRtcEvents(io);

export default expressServer;