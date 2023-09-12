import express from "express";
import cors from "cors";
import axios from "axios";

const app = express();
const port = 4002;

const EVENT_BUS_URL = 'http://event-bus-svc:4005';

const posts = {};

const handleEvent = (type, data) => {
    switch (type) {
        case 'PostCreated': {
            const { id, title } = data;
            posts[id] = { id, title, comments: [] };
        } break;

        case 'CommentCreated': {
            const { postId, id, content, status } = data;
            const post = posts[postId];
            if (post) {
                post.comments.push({ ...data });
            }
        } break;

        case 'CommentUpdated': {
            const { postId, id, content, status } = data;
            const post = posts[postId];
            if (post) {
                const index = post.comments.findIndex(c => c.id === id);
                if (index > -1) {
                    post.comments[index] = { ...data };
                }
            }
        } break;

        default:
            console.log('Unknown event type', type, data);
    }
};

app.use(cors(), express.json());

app.post('/events', (req, res) => {
    const { type, data } = req.body;
    handleEvent(type, data);
    res.status(200).send();
});

const router = express.Router();

router.get('/posts', (req, res) => {
    const filter = Object.values(posts).map(p => {
        p.comments.forEach(c => {
            switch (c.status) {
                case 'pending':
                case 'rejected':
                    c.content = "";
                    break;
            }
        });
        return p;
    })

    res.json(filter);
});

app.use('/query', router);

app.listen(port, () => {
    axios
        .get(`${EVENT_BUS_URL}/events`)
        .then(response => {
            for (const { type, data } of response.data) {
                handleEvent(type, data);
            }
        })
        .catch(err => { console.error(err); })

    console.log(`Server listening on port ${port}`);
});
