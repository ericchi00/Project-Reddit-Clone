import React, { useState } from 'react';
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
} from '@firebase/firestore';

const Post = ({ score, title, index, name, time, signedIn }) => {
	const { subreddit } = useParams();
	const firestore = getFirestore();
	const [updatedScore, setUpdatedScore] = useState(score);

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
					setUpdatedScore(score);
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
			setUpdatedScore(newScore);
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
					setUpdatedScore(score);
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
			setUpdatedScore(newScore);
		});
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
				<Link to={`/r/${subreddit}/${title}`}>
					<div className="post-title">{title}</div>
				</Link>
				<div className="post-submitter">
					Submitted by {name}{' '}
					{formatDistanceToNow(time, { includeSeconds: true })} ago
				</div>
				<div className="post-comments">Comments</div>
			</div>
		</li>
	);
};

export default Post;
