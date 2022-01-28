import express, { json } from 'express';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import cors from 'cors';
dotenv.config();

const server = express();

server.use(cors());
server.use(json());

server.post('/participants', (req, res) => {

    res.sendStatus(201);

});

server.get('/participants', (req, res) => {
    console.log("qualé");
    res.sendStatus(201);

});


server.listen(5000);