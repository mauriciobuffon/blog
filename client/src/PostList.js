import { StrictMode, useState, useEffect } from "react";
import axios from "axios";

import CommentList from "./CommentList";
import CommentCreate from "./CommentCreate";


export default function PostList() {
    const [posts, setPosts] = useState({});

    const fetchPosts = () => {
        axios
            .get('http://posts.com/query/posts')
            .then(response => { setPosts(response.data); })
            .catch(err => { console.error(err); });
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const renderedPosts = Object.values(posts).map(post => {
        return (
            <div className="card" style={{ width: '30%', marginBottom: '20px' }} key={post.id}>
                <div className="card-body">
                    <h3>{post.title}</h3>
                    <CommentList postId={post.id} comments={post.comments} />
                    <CommentCreate postId={post.id} />
                </div>
            </div>
        );

    });

    return (
        <div className="d-flex flex-row flex-wrap justify-content-between">
            {renderedPosts}
        </div>
    );
}