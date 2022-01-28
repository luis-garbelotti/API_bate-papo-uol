import express, { json } from 'express';
import { MongoClient, ObjectId } from 'mongodb';
import dayjs from 'dayjs';
import joi from 'joi';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

const server = express();

server.use(cors());
server.use(json());

const participantsSchema = joi.object({
    name: joi.string().min(1).required()
})

server.post('/participants', async (req, res) => {

    let mongoClient;

    const validation = participantsSchema.validate(req.body);
    if (validation.error) {
        res.sendStatus(422);
        return;
    }

    try {

        const participant = req.body;

        mongoClient = new MongoClient(process.env.MONGO_URI);
        await mongoClient.connect();

        const dbAPIbatePapoUol = mongoClient.db("api-bate-papo-uol");
        const participantsCollection = dbAPIbatePapoUol.collection('participants');
        const alreadyExistParticipant = await participantsCollection.findOne(participant);

        const messagesCollection = dbAPIbatePapoUol.collection('messages');

        if (!alreadyExistParticipant) {

            await participantsCollection.insertOne({ ...participant, laststatus: Date.now() });

            await messagesCollection.insertOne({
                from: participant.name,
                to: 'Todos',
                text: 'entra na sala...',
                type: 'status',
                time: dayjs().format('HH:mm:ss')
            });

            res.sendStatus(201);
            mongoClient.close();

        } else {

            res.sendStatus(409);
            mongoClient.close();

        }

    } catch (error) {

        res.sendStatus(500);
        mongoClient.close();

    }
});

server.get('/participants', async (req, res) => {

    let mongoClient;

    try {

        mongoClient = new MongoClient(process.env.MONGO_URI);
        await mongoClient.connect();

        const dbAPIbatePapoUol = mongoClient.db('api-bate-papo-uol');
        const participantsCollection = dbAPIbatePapoUol.collection('participants');

        const participants = await participantsCollection.find({}).toArray();

        res.send(participants);
        mongoClient.close();

    } catch (error) {

        res.sendStatus(500);
        mongoClient.close();

    }

});

server.post('/messages', async (req, res) => {

    res.sendStatus(201);

});

server.get('/messages', async (req, res) => {

    res.sendStatus(200);

});

server.post('/status', (req, res) => {

    res.sendStatus(200);

});

server.listen(5000);