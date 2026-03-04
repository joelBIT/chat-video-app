import { createServer } from 'node:https';
import fs from "node:fs";
import express from 'express';
import { Server } from 'socket.io';

const app = express();
console.log(import.meta.dirname)
app.use(express.static(import.meta.dirname));

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
expressServer.listen(8181);

//offers will contain {}
const offers = [
    // offererUserName
    // offer
    // offerIceCandidates
    // answererUserName
    // answer
    // answererIceCandidates
];
const connectedSockets = [
    //username, socketId
]

io.on('connection',(socket)=>{
    console.log("Someone has connected");
});