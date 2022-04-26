import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import up from '../images/arrow-single-up.svg';
import down from '../images/arrow-single-down.svg';
import { collection, query, getDocs, getFirestore } from '@firebase/firestore';
import { Link } from 'react-router-dom';
import '../style/post-comment.css';
import { formatDistanceToNow } from 'date-fns';

const Comment = () => {
	const { subreddit, postTitle } = useParams();
	const [comments, setComments] = useState([]);
	const [score, setScore] = useState();
	const [title, setTitle] = useState();
	const [text, setText] = useState();
	const [time, setTime] = useState();
	const [name, setName] = useState();

	useEffect(() => {
		grabPost();
	}, []);

	const grabPost = async () => {
		const firestore = getFirestore();
		const collectionRef = collection(firestore, `Subreddit/${subreddit}/posts`);
		const q = query(collectionRef);
		const querySnapshot = await getDocs(q);
		querySnapshot.forEach((item) => {
			console.log(item.data().timestamp);
			setTime(item.data().timestamp);
			setScore(item.data().score);
			setTitle(item.data().title);
			setText(item.data().text);
			setName(item.data().name);
		});
	};

	return (
		<div className="post-comment">
			<Link to={`/r/${subreddit}`}>
				<h2>r/{subreddit}</h2>
			</Link>
			<div className="post-comment-wrapper">
				<div className="up-down">
					<img src={up} alt="upvote arrow" />
					<span className="post-score">{score}</span>
					<img src={down} alt="downvote arrow" />
				</div>
				<div className="posts-wrapper">
					<Link to={`/r/${subreddit}/${postTitle}`}>
						<div className="post-title">{title}</div>
					</Link>
					<div className="post-submitter">
						Submitted by {name}
						{/* {formatDistanceToNow(time, { includeSeconds: true })} ago */}
					</div>
					<div className="post-text">
						<p>{text}</p>
					</div>
					<Link to={`/r/${subreddit}/${postTitle}`}>
						<div className="post-comments">Comments</div>
					</Link>
				</div>
			</div>
			<li>
				<div className="comment-name">{}</div>
				<div className="comment-score">{}</div>
				<span></span>
			</li>
		</div>
	);
};

export default Comment;
