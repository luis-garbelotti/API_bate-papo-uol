import express, { json } from 'express';
import { MongoClient } from 'mongodb';
import joi from 'joi';
import dotenv from 'dotenv';
import cors from 'cors';
dotenv.config();

const server = express();

server.use(cors());
server.use(json());

const participantsSchema = joi.object({
    name: joi.string().min(1).required()
})

server.post('/participants', (req, res) => {

    const validation = participantsSchema.validate(req.body);
    if (validation.error) {
        res.sendStatus(422);
        return;
    }

    res.sendStatus(201);

});

server.get('/participants', (req, res) => {

    res.sendStatus(200);

});

server.post('/messages', (req, res) => {

    res.sendStatus(201);

});

server.get('/messages', (req, res) => {

    res.sendStatus(200);

});

server.post('/status', (req, res) => {

    res.sendStatus(200);

});

server.listen(5000);