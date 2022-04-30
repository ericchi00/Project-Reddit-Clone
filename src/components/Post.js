import React, { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
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
	deleteDoc,
} from '@firebase/firestore';

const Post = ({
	score,
	title,
	index,
	name,
	time,
	signedIn,
	docID,
	currentUser,
	sub,
	removePost,
}) => {
	const { subreddit } = useParams();
	const firestore = getFirestore();
	const [updatedScore, setUpdatedScore] = useState(score);
	const [subredditName, setSubredditName] = useState(subreddit);

	useEffect(() => {
		// updates posts score after clicking on a different subreddit
		setUpdatedScore(score);
		// subreddit is undefined if accessing from homepage
		if (subreddit === undefined) {
			setSubredditName(sub);
		} else if (sub === undefined) {
			setSubredditName(subreddit);
		}
	}, [score]);

	const upVote = async () => {
		if (!signedIn) {
			alert('You must be signed in to vote.');
			return;
		}

		if (currentUser === name) {
			alert("You can't vote on your own post.");
			return;
		}

		console.log(subredditName);

		const docRef = doc(firestore, 'UserLikes', currentUser);
		const docSnap = await getDoc(docRef);
		const upvote = docSnap.data().upvotes;
		const downvote = docSnap.data().downvotes;

		const collectionRef = collection(
			firestore,
			`Subreddit/${subredditName}/posts`
		);
		const q = query(collectionRef);
		const querySnapshot = await getDocs(q);
		querySnapshot.forEach(async (item) => {
			// searches if user already upvoted & removes it
			if (upvote.length > 0) {
				const originalVote = upvote.filter((item) => item === time);
				if (item.data().timestamp === originalVote[0]) {
					await updateDoc(
						doc(firestore, `Subreddit/${subredditName}/posts/${item.id}`),
						{
							score: increment(-1),
						}
					);
					await updateDoc(doc(firestore, `UserLikes/${currentUser}`), {
						upvotes: arrayRemove(time),
					});
					setUpdatedScore(item.data().score - 1);
					return;
				}
			}

			// if user already downvoted, and then upvotes, it'll add 2 to score
			if (downvote.length > 0) {
				const originalVote = downvote.filter((item) => item === time);
				if (item.data().timestamp === originalVote[0]) {
					await updateDoc(
						doc(firestore, `Subreddit/${subredditName}/posts/${item.id}`),
						{
							score: increment(2),
						}
					);
					await updateDoc(doc(firestore, `UserLikes/${currentUser}`), {
						upvotes: arrayUnion(time),
						downvotes: arrayRemove(time),
					});
					setUpdatedScore(item.data().score + 2);
					return;
				}
			}

			// updates vote if user hasn't already upvoted
			if (item.data().timestamp === time) {
				await updateDoc(
					doc(firestore, `Subreddit/${subredditName}/posts/${item.id}`),
					{
						score: increment(1),
					}
				);
				await updateDoc(doc(firestore, `UserLikes/${currentUser}`), {
					upvotes: arrayUnion(time),
					downvotes: arrayRemove(time),
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

		if (currentUser === name) {
			alert("You can't vote on your own post.");
			return;
		}

		const docRef = doc(firestore, 'UserLikes', currentUser);
		const docSnap = await getDoc(docRef);
		const upvote = docSnap.data().upvotes;
		const downvote = docSnap.data().downvotes;

		const collectionRef = collection(
			firestore,
			`Subreddit/${subredditName}/posts`
		);
		const q = query(collectionRef);
		const querySnapshot = await getDocs(q);
		querySnapshot.forEach(async (item) => {
			// searches if user already downvoted & removes it
			if (downvote.length > 0) {
				const originalVote = downvote.filter((item) => item === time);
				if (item.data().timestamp === originalVote[0]) {
					await updateDoc(
						doc(firestore, `Subreddit/${subredditName}/posts/${item.id}`),
						{
							score: increment(1),
						}
					);
					await updateDoc(doc(firestore, `UserLikes/${currentUser}`), {
						downvotes: arrayRemove(time),
					});
					setUpdatedScore(item.data().score + 1);
					return;
				}
			}

			// if user already upvoted post and then downvotes it, it'll -2 from score
			if (upvote.length > 0) {
				const originalVote = upvote.filter((item) => item === time);
				if (item.data().timestamp === originalVote[0]) {
					await updateDoc(
						doc(firestore, `Subreddit/${subredditName}/posts/${item.id}`),
						{
							score: increment(-2),
						}
					);
					await updateDoc(doc(firestore, `UserLikes/${currentUser}`), {
						upvotes: arrayRemove(time),
						downvotes: arrayUnion(time),
					});
					setUpdatedScore(item.data().score - 2);
					return;
				}
			}

			// downvotes if user already hasn't downvoted
			if (item.data().timestamp === time) {
				await updateDoc(
					doc(firestore, `Subreddit/${subredditName}/posts/${item.id}`),
					{
						score: increment(-1),
					}
				);
				await updateDoc(doc(firestore, `UserLikes/${currentUser}`), {
					upvotes: arrayRemove(time),
					downvotes: arrayUnion(time),
				});
				setUpdatedScore(item.data().score - 1);
			}
		});
	};

	const deletePost = async () => {
		// removes all comments from post
		const collectionRef = collection(
			firestore,
			`Subreddit/${subredditName}/posts/${docID}/comments`
		);
		const q = query(collectionRef);
		const querySnapshot = await getDocs(q);
		querySnapshot.forEach((item) => {
			deleteDoc(
				doc(
					firestore,
					`Subreddit/${subredditName}/posts/${docID}/comments/${item.id}`
				)
			);
		});

		// removes posts
		const docRef = doc(firestore, `Subreddit/${subredditName}/posts/${docID}`);
		await deleteDoc(docRef);
		removePost(true);
	};

	return (
		<li className="post">
			<div className="post-index">{index}</div>
			<div className="score-wrapper">
				<div className="upvote-downvote">
					<img src={up} alt="upvote arrow" onClick={() => upVote()} />
					<span className="post-score">{updatedScore}</span>
					<img src={down} alt="downvote arrow" onClick={() => downVote()} />
				</div>
			</div>
			<div className="posts-wrapper">
				<div className="post-title">
					<Link to={`/r/${subredditName}/${docID}`}>
						<p>{title}</p>
					</Link>
				</div>
				<div className="post-submitter">
					Submitted by {name}{' '}
					{formatDistanceToNow(time, { includeSeconds: true })} ago
					{subreddit === undefined ? (
						<>
							{' '}
							to
							<Link to={`/r/${subredditName}`}>
								<span> r/{subredditName}</span>
							</Link>
						</>
					) : null}
				</div>
				<div className="post-comments">
					<Link to={`/r/${subredditName}/${docID}`}>
						<p>Comments</p>
					</Link>
					{currentUser === name ? (
						<button
							type="button"
							className="delete-post"
							onClick={() => deletePost()}
						>
							Delete
						</button>
					) : null}
				</div>
			</div>
		</li>
	);
};

export default Post;
