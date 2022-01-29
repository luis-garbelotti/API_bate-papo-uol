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
});

const messagesSchema = joi.object({
    to: joi.string().required(),
    text: joi.string().required(),
    type: joi.valid('private_message', 'message').required(),
    from: joi.required(),
    time: joi.required()
})

server.post('/participants', async (req, res) => {

    let mongoClient;
    const participant = req.body;

    const validation = participantsSchema.validate(req.body);
    if (validation.error) {
        res.sendStatus(422);
        return;
    }

    try {

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

    let mongoClient;

    try {

        const message = req.body;
        const user = req.headers.user;

        const messageFull = {
            from: user,
            ...message,
            time: dayjs().format('HH:mm:ss')
        }

        const validation = messagesSchema.validate(messageFull, { abortEarly: false });
        if (validation.error) {
            const erros = validation.error.details.map(detail => detail.message);
            res.status(422).send(erros);
            return;
        }

        mongoClient = new MongoClient(process.env.MONGO_URI);
        await mongoClient.connect();

        const dbAPIbatePapoUol = mongoClient.db('api-bate-papo-uol');
        const messagesCollection = dbAPIbatePapoUol.collection('messages');
        await messagesCollection.insertOne(messageFull);

        res.sendStatus(201);
        mongoClient.close();

    } catch (error) {

        res.sendStatus(500);
        mongoClient.close();

    }

});

server.get('/messages', async (req, res) => {

    let mongoClient;

    try {
        mongoClient = new MongoClient(process.env.MONGO_URI);
        await mongoClient.connect();

        const dbAPIbatePapoUol = mongoClient.db('api-bate-papo-uol');
        const messagesCollection = dbAPIbatePapoUol.collection('messages');

        const messages = await messagesCollection.find({}).toArray();

        res.send(messages);
        mongoClient.close();

    } catch (error) {
        res.sendStatus(500);
        mongoClient.close();
    }

});

server.post('/status', (req, res) => {

    res.sendStatus(200);

});

server.listen(5000);