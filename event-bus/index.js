import express from "express";
import axios from "axios";

const app = express();
const port = 4005;

app.use(express.json());

const listeners = [
    'http://posts-svc:4000/events',
    'http://comments-svc:4001/events',
    'http://query-svc:4002/events',
    'http://moderation-svc:4003/events'
];

const events = [];

app.get('/events', (req, res) => {
    res.json(events);
});

app.post('/events', (req, res) => {
    const event = req.body;
    events.push(event);

    listeners.forEach((hook) => {
        axios
            .post(hook, event)
            // .then(res => console.log(hook, res.status))
            .catch(err => { console.error(err); });
    });

    res.status(200).send();
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
