import { StrictMode, useState } from "react";
import axios from "axios";

export default function CommentCreate({ postId }) {
    const [content, setContent] = useState('');

    const onSubmit = (event) => {
        event.preventDefault();
        axios
            .post(`http://posts.com/comments/${postId}`, { content })
            .then(response => setContent(''))
            .catch(err => { console.error(err); });
    };

    return (
        <div>
            <form onSubmit={onSubmit}>
                <div className="form-group">
                    <label>New comment</label>
                    <input value={content} onChange={e => setContent(e.target.value)} className="form-control" />
                </div>
                <button className="btn btn-primary">Submit</button>
            </form>
        </div>
    );
}


