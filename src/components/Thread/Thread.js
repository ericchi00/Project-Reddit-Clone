import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import up from '../../images/arrow-single-up.svg';
import down from '../../images/arrow-single-down.svg';
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
import '../../style/post-comment.css';
import { formatDistanceToNow } from 'date-fns';
import Comment from './Comment';
import CommentForm from './CommentForm';

const Thread = ({ currentUser, signedIn }) => {
	const { subreddit, postID } = useParams();
	const firestore = getFirestore();
	const [comments, setComments] = useState([]);
	const [newComment, setNewComment] = useState(null);
	const [postInfo, setPostInfo] = useState({ time: 0 });

	const [commentText, setCommentText] = useState('');
	const [updatedScore, setUpdatedScore] = useState(null);

	const [sort, setSort] = useState('hot');
	// state to pass down to comment
	const [removeComment, setRemoveComment] = useState(false);

	useEffect(() => {
		grabPostData();
		grabComments(sort);
		setNewComment(false);
		setRemoveComment(false);
	}, [newComment, removeComment, sort]);

	const commentHandler = (e) => {
		const { value } = e.target;
		setCommentText(value);
	};

	const grabPostData = async () => {
		const firestore = getFirestore();
		const collectionRef = collection(firestore, `Subreddit/${subreddit}/posts`);
		const q = query(collectionRef);
		const querySnapshot = await getDocs(q);
		querySnapshot.forEach((item) => {
			if (item.id === postID) {
				setPostInfo({
					time: item.data().timestamp,
					score: item.data().score,
					title: item.data().title,
					text: item.data().text,
					name: item.data().name,
				});
				setUpdatedScore(item.data().score);
			}
		});
	};

	const grabComments = async (expr) => {
		let commentsArr = [];
		const firestore = getFirestore();
		const collectionRef = collection(
			firestore,
			`Subreddit/${subreddit}/posts`,
			`${postID}`,
			`comments`
		);
		if (expr === 'hot') {
			const q = query(collectionRef, orderBy('score', 'desc'));
			const querySnapshot = await getDocs(q);
			querySnapshot.forEach((doc) => {
				commentsArr.push(doc.data());
			});
		} else if (expr === 'new') {
			const q = query(collectionRef, orderBy('timestamp', 'desc'));
			const querySnapshot = await getDocs(q);
			querySnapshot.forEach((doc) => {
				commentsArr.push(doc.data());
			});
		}
		setComments(commentsArr);
	};

	const upVote = async () => {
		if (!signedIn) {
			alert('You must be signed in to vote.');
			return;
		}

		if (currentUser === postInfo.name) {
			alert("You can't vote on your own post.");
			return;
		}

		const docRef = doc(firestore, 'UserLikes', currentUser);
		const docSnap = await getDoc(docRef);
		const upvote = docSnap.data().upvotes;
		const downvote = docSnap.data().downvotes;

		const collectionRef = collection(firestore, `Subreddit/${subreddit}/posts`);
		const q = query(collectionRef);
		const querySnapshot = await getDocs(q);
		querySnapshot.forEach(async (item) => {
			// searches if user already upvoted & removes it if user upvotes again
			if (upvote.length > 0) {
				const originalVote = upvote.filter((item) => item === postInfo.time);
				if (item.data().timestamp === originalVote[0]) {
					await updateDoc(
						doc(firestore, `Subreddit/${subreddit}/posts/${item.id}`),
						{
							score: increment(-1),
						}
					);
					await updateDoc(doc(firestore, `UserLikes/${currentUser}`), {
						upvotes: arrayRemove(postInfo.time),
					});
					setUpdatedScore(item.data().score - 1);
					return;
				}
			}

			// if user already downvoted, and then upvotes, it'll add 2 to score
			if (downvote.length > 0) {
				const originalVote = downvote.filter((item) => item === postInfo.time);
				if (item.data().timestamp === originalVote[0]) {
					await updateDoc(
						doc(firestore, `Subreddit/${subreddit}/posts/${item.id}`),
						{
							score: increment(2),
						}
					);
					await updateDoc(doc(firestore, `UserLikes/${currentUser}`), {
						upvotes: arrayUnion(postInfo.time),
						downvotes: arrayRemove(postInfo.time),
					});
					setUpdatedScore(item.data().score + 2);
					return;
				}
			}

			// updates vote if user hasn't already upvoted
			if (item.data().timestamp === postInfo.time) {
				await updateDoc(
					doc(firestore, `Subreddit/${subreddit}/posts/${item.id}`),
					{
						score: increment(1),
					}
				);
				await updateDoc(doc(firestore, `UserLikes/${currentUser}`), {
					upvotes: arrayUnion(postInfo.time),
					downvotes: arrayRemove(postInfo.time),
				});
				setUpdatedScore(item.data().score + 1);
			}
		});
	};

	const downVote = async () => {
		if (!signedIn) {
			alert('You must be signed in to vote.');
			return;
		}

		if (currentUser === postInfo.name) {
			alert("You can't vote on your own post.");
			return;
		}

		const docRef = doc(firestore, 'UserLikes', currentUser);
		const docSnap = await getDoc(docRef);
		const upvote = docSnap.data().upvotes;
		const downvote = docSnap.data().downvotes;

		const collectionRef = collection(firestore, `Subreddit/${subreddit}/posts`);
		const q = query(collectionRef);
		const querySnapshot = await getDocs(q);
		querySnapshot.forEach(async (item) => {
			// searches if user already downvoted & removes it
			if (downvote.length > 0) {
				const originalVote = downvote.filter((item) => item === postInfo.time);
				if (item.data().timestamp === originalVote[0]) {
					await updateDoc(
						doc(firestore, `Subreddit/${subreddit}/posts/${item.id}`),
						{
							score: increment(1),
						}
					);
					await updateDoc(doc(firestore, `UserLikes/${currentUser}`), {
						downvotes: arrayRemove(postInfo.time),
					});
					setUpdatedScore(item.data().score + 1);
					return;
				}
			}

			// if user already upvoted post and then downvotes it, it'll -2 from score
			if (upvote.length > 0) {
				const originalVote = upvote.filter((item) => item === postInfo.time);
				if (item.data().timestamp === originalVote[0]) {
					await updateDoc(
						doc(firestore, `Subreddit/${subreddit}/posts/${item.id}`),
						{
							score: increment(-2),
						}
					);
					await updateDoc(doc(firestore, `UserLikes/${currentUser}`), {
						upvotes: arrayRemove(postInfo.time),
						downvotes: arrayUnion(postInfo.time),
					});
					setUpdatedScore(item.data().score - 2);
					return;
				}
			}

			// downvotes if user already hasn't downvoted
			if (item.data().timestamp === postInfo.time) {
				await updateDoc(
					doc(firestore, `Subreddit/${subreddit}/posts/${item.id}`),
					{
						score: increment(-1),
					}
				);
				await updateDoc(doc(firestore, `UserLikes/${currentUser}`), {
					upvotes: arrayRemove(postInfo.time),
					downvotes: arrayUnion(postInfo.time),
				});
				setUpdatedScore(item.data().score - 1);
			}
		});
	};

	const submitComment = async (e) => {
		e.preventDefault();
		if (!signedIn) {
			alert('You must be signed in to comment.');
			return;
		}
		if (commentText <= 1) {
			const comment = document.getElementById('comment');
			comment.placeholder = 'Comment needs be longer than 1 character.';
			return;
		}
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
				name: currentUser,
				score: 1,
				text: commentText,
				timestamp: Date.now(),
			}
		);
		const form = document.getElementById('comment-form');
		form.reset();
		setNewComment(true);
	};

	const sortHandler = (e) => {
		const { value } = e.target;
		console.log(value);
		setSort(value);
	};

	return (
		<div className="post-comment">
			<Link to={`/r/${subreddit}`}>
				<h2>r/{subreddit}</h2>
			</Link>
			<div className="post-comment-wrapper">
				<div className="up-down">
					<img src={up} alt="upvote arrow" onClick={() => upVote()} />
					<span className="post-score">{updatedScore}</span>
					<img src={down} alt="downvote arrow" onClick={() => downVote()} />
				</div>
				<div className="posts-wrapper">
					<div className="thread-title">{postInfo.title}</div>
					<div className="post-submitter">
						Submitted by {postInfo.name}{' '}
						{formatDistanceToNow(postInfo.time, { includeSeconds: true })} ago
					</div>
					<div className="post-text">
						<p>{postInfo.text}</p>
					</div>
				</div>
			</div>
			<div className="comment-sort">
				<label htmlFor="sort">sorted by: </label>
				<select name="sort" id="sort" onChange={(e) => sortHandler(e)}>
					<option value="hot">Hot</option>
					<option value="new">New</option>
				</select>
			</div>
			<div className="comment-name">Speaking as : {currentUser}</div>
			<CommentForm
				commentHandler={commentHandler}
				submitComment={submitComment}
			/>
			{comments.length <= 0 ? (
				<div className="no-comments">
					There are no comments. Make the first comment!
				</div>
			) : (
				<div className="comments">
					{comments.map((comment, i) => {
						return (
							<Comment
								removeComment={setRemoveComment}
								postID={postID}
								subreddit={subreddit}
								currentUser={currentUser}
								signedIn={signedIn}
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
