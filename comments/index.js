import { randomBytes } from "node:crypto";
import express from "express";
import cors from "cors";
import axios from "axios";

const app = express();
const port = 4001;

const EVENT_BUS_URL = 'http://event-bus-svc:4005';

const commentsByPostId = {};

app.use(cors(), express.json());

app.get('/comments/:postId', (req, res) => {
    res.json(commentsByPostId[req.params.postId] || []);
});

app.post('/comments/:postId', (req, res) => {
    const postId = req.params.postId;
    const id = randomBytes(4).toString('hex');
    const { content } = req.body;

    if (!commentsByPostId[postId]) {
        commentsByPostId[postId] = [];
    }
    const comment = { id, content, status: "pending" };
    commentsByPostId[postId].push(comment);

    axios
        .post(`${EVENT_BUS_URL}/events`, {
            'type': "CommentCreated",
            'data': { ...comment, postId }
        })
        .catch(err => { console.error(err); });

    res.status(201).json(commentsByPostId[postId]);
});

app.post('/events', (req, res) => {
    const { type, data } = req.body;

    switch (type) {
        case 'CommentModerated': {
            const { postId, id, status } = data;
            const comment = commentsByPostId[postId]?.find(c => c.id === id);

            if (comment) {
                comment.status = status;

                axios
                    .post(`${EVENT_BUS_URL}/events`, {
                        'type': "CommentUpdated",
                        'data': { ...comment, postId }
                    })
                    .catch(err => { console.error(err) });
            }
        } break;
    }

    res.status(200).send();
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
