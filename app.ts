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
import type { ChatUser } from './src/types.ts';
import User from './src/serverApplication/schemas/userSchema.ts';

const app = express();
app.use(express.static(import.meta.dirname + "/dist/"));
app.use(express.json());
app.use(express.urlencoded({ extended: true}));

app.post('api/v1/register', async (req, res) => {
    const userDetails: {username: string, password: string} = Object.assign(req.body);
    const user: ChatUser | null = await User.findOne({username: userDetails.username});
    if (user) {
        res.status(400).json({
            success: false,
            message: "Username is not available. Choose a different username.",
            data: userDetails
        });
    } else {
        const dbUser = new User({
            username: userDetails.username,
            password: userDetails.password
        });

        await dbUser.save().then(doc => {
            const createdUser: ChatUser = {username: doc.username, id: doc._id.toString(), online: doc.online, avatar: doc.avatar, inCall: doc.inCall};
            res.status(201).json({
                success: true,
                message: "Created",
                data: createdUser
            });
        }).catch(error => {
            console.log(error);
            res.status(500).json({
                success: false,
                message: "An error occurred during registration.",
                data: userDetails
            });
        });
    }
});

app.all('/{*path}', async (req, res) => {
    res.redirect(`https://${req.get('host')}`);
});

const key = readFileSync('cert.key');
const cert = readFileSync('cert.crt');
const expressServer = createServer({key, cert}, app);

const ORIGIN = process.env.NODE_ENV === 'production' ? process.env.URL as string : "https://localhost";

// Create our socket.io server... it will listen to our express port
const io = new Server(expressServer, {
    cors: {
        origin: [
            ORIGIN
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

export default expressServer;