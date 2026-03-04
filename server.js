import { createServer } from 'node:https';
import fs from "node:fs";
import express from 'express';
import { Server } from 'socket.io';
import {checkUsername} from "./socketApplication/auth/auth.ts";
import {initializeHomeEvents} from "./socketApplication/events/homeEvents.ts";
import {initializeDmEvents} from "./socketApplication/events/dmEvents.ts";
import {initializeGamesEvents} from "./socketApplication/events/gamesEvents.ts";
import {initializeCommonEvents} from "./socketApplication/events/commonEvents.ts";
import {initializeMainNamespaceEvents} from "./socketApplication/events/mainEvents.ts";

const app = express();
app.use(express.static(import.meta.dirname + "/dist/"));

const key = fs.readFileSync('cert.key');
const cert = fs.readFileSync('cert.crt');

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

expressServer.listen(8181, () => {
    console.log(`Server listening on port ${8181}`);
});