import express from "express";
import cors from "cors";
import axios from "axios";

const app = express();
const port = 4003;

const EVENT_BUS_URL = 'http://event-bus-svc:4005';

app.use(cors(), express.json());

app.post('/events', (req, res) => {
    const { type, data } = req.body;

    switch (type) {
        case 'CommentCreated': {
            const { content } = data;
            const status = content.includes('orange') ? 'rejected' : 'approved';

            axios
                .post(`${EVENT_BUS_URL}/events`, {
                    'type': "CommentModerated",
                    'data': { ...data, status }
                })
                .catch(err => { console.error(err); });
        } break;
    }

    res.status(200).send();
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
