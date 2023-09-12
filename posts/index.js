import { randomBytes } from "node:crypto";
import express from "express";
import cors from "cors";
import axios from "axios";

const app = express();
const port = 4000;

const EVENT_BUS_URL = 'http://event-bus-svc:4005';

const posts = {};

app.use(cors(), express.json());

app.get('/posts', (req, res) => {
    res.json(posts);
});

app.post('/posts', (req, res) => {
    const id = randomBytes(4).toString('hex');
    const { title } = req.body;
    const post = { id, title };
    posts[id] = post;

    axios
        .post(`${EVENT_BUS_URL}/events`, {
            'type': "PostCreated",
            'data': post
        })
        .catch(err => { console.error(err); });

    res.status(201).json(posts[id]);
});

app.post('/events', (req, res) => {
    console.log('event received', req.body);
    res.status(200).send();
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
