import { createServer } from 'node:https';
import { readFileSync } from 'node:fs';
import express from 'express';
import { Server } from 'socket.io';
import {checkUsername} from "./src/serverApplication/auth/auth.ts";
import {initializeHomeEvents} from "./src/serverApplication/events/homeEvents.ts";
import {initializeDmEvents} from "./src/serverApplication/events/dmEvents.ts";
import {initializeGamesEvents} from "./src/serverApplication/events/gamesEvents.ts";
import {initializeCommonEvents} from "./src/serverApplication/events/commonEvents.ts";
import {initializeMainNamespaceEvents} from "./src/serverApplication/events/mainEvents.ts";
import {initializeWebRtcEvents} from "./src/serverApplication/events/webRtcEvents.ts";

const app = express();
app.use(express.static(import.meta.dirname + "/dist/"));
app.use(express.json());
app.use(express.urlencoded({ extended: true}));

const key = readFileSync('cert.key');
const cert = readFileSync('cert.crt');

const expressServer = createServer({key, cert}, app);
//create our socket.io server... it will listen to our express port
const io = new Server(expressServer, {
    cors: {
        origin: [
            "https://localhost",
            // 'https://LOCAL-DEV-IP-HERE' //if using a phone or another computer
        ],
        methods: ["GET", "POST"]
    }
});

checkUsername(io);
initializeMainNamespaceEvents(io);
initializeCommonEvents(io);
initializeHomeEvents(io);
initializeDmEvents(io);
initializeGamesEvents(io);
initializeWebRtcEvents(io);

expressServer.listen(8181, () => {
    console.log(`Server listening on port ${8181}`);
});