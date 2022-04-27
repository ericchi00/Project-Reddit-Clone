import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import up from '../images/arrow-single-up.svg';
import down from '../images/arrow-single-down.svg';
import {
	collection,
	doc,
	getDocs,
	getFirestore,
	query,
	updateDoc,
	arrayRemove,
	arrayUnion,
	increment,
	getDoc,
	addDoc,
	orderBy,
} from '@firebase/firestore';
import { Link } from 'react-router-dom';
import '../style/post-comment.css';
import { formatDistanceToNow } from 'date-fns';
import Comment from './Comment';

const Thread = ({ username, signedIn }) => {
	const { subreddit, postID } = useParams();
	const firestore = getFirestore();
	const [comments, setComments] = useState([]);
	const [score, setPostScore] = useState(null);
	const [title, setPostTitle] = useState(null);
	const [text, setPostText] = useState(null);
	const [name, setPostName] = useState(null);
	const [time, setPostTime] = useState(0);

	const [commentText, setCommentText] = useState('');

	useEffect(() => {
		grabPostData();
		grabComments();
		console.log('reading data');
	}, []);

	const commentHandler = (e) => {
		const { value } = e.target;
		setCommentText(value);
	};

	const grabComments = async () => {
		let commentsArr = [];
		const firestore = getFirestore();
		const collectionRef = collection(
			firestore,
			`Subreddit/${subreddit}/posts`,
			`${postID}`,
			`comments`
		);
		const q = query(collectionRef, orderBy('timestamp', 'asc'));
		const querySnapshot = await getDocs(q);
		querySnapshot.forEach((doc) => {
			commentsArr.push(doc.data());
		});
		setComments(commentsArr);
	};

	const grabPostData = async () => {
		const firestore = getFirestore();
		const collectionRef = collection(firestore, `Subreddit/${subreddit}/posts`);
		const q = query(collectionRef);
		const querySnapshot = await getDocs(q);
		querySnapshot.forEach((item) => {
			if (item.id === postID) {
				setPostTime(item.data().timestamp);
				setPostScore(item.data().score);
				setPostTitle(item.data().title);
				setPostText(item.data().text);
				setPostName(item.data().name);
			}
		});
	};

	const upVote = async () => {
		if (!signedIn) return;

		const docRef = doc(firestore, 'UserLikes', name);
		const docSnap = await getDoc(docRef);
		const upvote = docSnap.data().upvotes;

		const collectionRef = collection(firestore, `Subreddit/${subreddit}/posts`);
		const q = query(collectionRef);
		const querySnapshot = await getDocs(q);
		querySnapshot.forEach(async (item) => {
			// searches if user already upvoted & removes it
			if (upvote.length > 0) {
				const originalVote = upvote.filter((item) => item === time);
				if (originalVote[0] === time) {
					await updateDoc(
						doc(firestore, `Subreddit/${subreddit}/posts/${item.id}`),
						{
							score: increment(-1),
						}
					);
					await updateDoc(doc(firestore, `UserLikes/${name}`), {
						upvotes: arrayRemove(time),
					});
					setPostScore(score);
					return;
				}
			}

			// updates vote if user hasn't already upvoted
			if (item.data().timestamp === time) {
				await updateDoc(
					doc(firestore, `Subreddit/${subreddit}/posts/${item.id}`),
					{
						score: increment(1),
					}
				);
				await updateDoc(doc(firestore, `UserLikes/${name}`), {
					upvotes: arrayUnion(time),
					downvotes: arrayRemove(time),
				});
			}
			const newScore = item.data().score + 1;
			setPostScore(newScore);
		});
	};

	const downVote = async () => {
		if (!signedIn) return;

		const docRef = doc(firestore, 'UserLikes', name);
		const docSnap = await getDoc(docRef);
		const downvote = docSnap.data().downvotes;

		const collectionRef = collection(firestore, `Subreddit/${subreddit}/posts`);
		const q = query(collectionRef);
		const querySnapshot = await getDocs(q);
		querySnapshot.forEach(async (item) => {
			// searches if user already downvoted & removes it
			if (downvote.length > 0) {
				const originalVote = downvote.filter((item) => item === time);
				if (originalVote[0] === time) {
					await updateDoc(
						doc(firestore, `Subreddit/${subreddit}/posts/${item.id}`),
						{
							score: increment(1),
						}
					);
					await updateDoc(doc(firestore, `UserLikes/${name}`), {
						downvotes: arrayRemove(time),
					});
					setPostScore(score);
					return;
				}
			}

			// downvotes if user already hasn't downvoted
			if (item.data().timestamp === time) {
				await updateDoc(
					doc(firestore, `Subreddit/${subreddit}/posts/${item.id}`),
					{
						score: increment(-1),
					}
				);
				await updateDoc(doc(firestore, `UserLikes/${name}`), {
					upvotes: arrayRemove(time),
					downvotes: arrayUnion(time),
				});
			}
			const newScore = item.data().score - 1;
			setPostScore(newScore);
		});
	};

	const submitComment = async (e) => {
		e.preventDefault();
		await addDoc(
			collection(
				firestore,
				'Subreddit',
				`${subreddit}`,
				'posts',
				postID,
				'comments'
			),
			{
				name: username,
				score: 1,
				text: commentText,
				timestamp: Date.now(),
			}
		);
		const form = document.getElementById('comment-form');
		form.reset();
	};

	return (
		<div className="post-comment">
			<Link to={`/r/${subreddit}`}>
				<h2>r/{subreddit}</h2>
			</Link>
			<div className="post-comment-wrapper">
				<div className="up-down">
					<img src={up} alt="upvote arrow" onClick={() => upVote()} />
					<span className="post-score">{score}</span>
					<img src={down} alt="downvote arrow" onClick={() => downVote()} />
				</div>
				<div className="posts-wrapper">
					<Link to={`/r/${subreddit}/${postID}`}>
						<div className="post-title">{title}</div>
					</Link>
					<div className="post-submitter">
						Submitted by {name}{' '}
						{formatDistanceToNow(time, { includeSeconds: true })} ago
					</div>
					<div className="post-text">
						<p>{text}</p>
					</div>
					<Link to={`/r/${subreddit}/${postID}`}>
						<div className="post-comments">Comments</div>
					</Link>
				</div>
			</div>
			<form id="comment-form">
				<textarea
					id="comment"
					name="comment"
					rows="5"
					cols="60"
					placeholder="Enter comment"
					onChange={(e) => commentHandler(e)}
				/>
				<button type="button" onClick={(e) => submitComment(e)}>
					Submit
				</button>
			</form>
			{comments.length <= 0 ? (
				<div className="no-comments">
					There are no comments. Make the first comment!
				</div>
			) : (
				<div className="comments">
					{comments.map((comment, i) => {
						return (
							<Comment
								key={i}
								name={comment.name}
								score={comment.score}
								text={comment.text}
								time={comment.timestamp}
							/>
						);
					})}
				</div>
			)}
		</div>
	);
};

export default Thread;