import React, { useEffect, useState } from 'react';
import up from '../images/arrow-single-up.svg';
import down from '../images/arrow-single-down.svg';
import { formatDistanceToNow } from 'date-fns';
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

const Comment = ({
	name,
	score,
	text,
	time,
	signedIn,
	currentUser,
	subreddit,
	postID,
	removeComment,
}) => {
	const [updatedScore, setUpdatedScore] = useState(score);
	const firestore = getFirestore();

	const upvote = async () => {
		if (!signedIn) {
			alert('You must be signed in to vote.');
			return;
		}
		const docRef = doc(firestore, 'UserLikes', currentUser);
		const docSnap = await getDoc(docRef);
		const upvote = docSnap.data().upvotes;

		const collectionRef = collection(
			firestore,
			`Subreddit/${subreddit}/posts/${postID}/comments`
		);
		const q = query(collectionRef);
		const querySnapshot = await getDocs(q);
		querySnapshot.forEach(async (item) => {
			// searches if user already downvoted & removes it
			if (upvote.length > 0) {
				const originalVote = upvote.filter((item) => item === time);
				if (item.data().timestamp === originalVote[0]) {
					await updateDoc(
						doc(
							firestore,
							`Subreddit/${subreddit}/posts/${postID}/comments/${item.id}`
						),
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
			// downvotes if user already hasn't downvoted
			if (item.data().timestamp === time) {
				await updateDoc(
					doc(
						firestore,
						`Subreddit/${subreddit}/posts/${postID}/comments/${item.id}`
					),
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

	const downvote = async () => {
		if (!signedIn) {
			alert('You must be signed in to vote.');
			return;
		}

		const docRef = doc(firestore, 'UserLikes', currentUser);
		const docSnap = await getDoc(docRef);
		const downvote = docSnap.data().downvotes;

		const collectionRef = collection(
			firestore,
			`Subreddit/${subreddit}/posts/${postID}/comments`
		);
		const q = query(collectionRef);
		const querySnapshot = await getDocs(q);
		querySnapshot.forEach(async (item) => {
			// searches if user already downvoted & removes it
			if (downvote.length > 0) {
				const originalVote = downvote.filter((item) => item === time);
				if (item.data().timestamp === originalVote[0]) {
					await updateDoc(
						doc(
							firestore,
							`Subreddit/${subreddit}/posts/${postID}/comments/${item.id}`
						),
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
			// downvotes if user already hasn't downvoted
			if (item.data().timestamp === time) {
				await updateDoc(
					doc(
						firestore,
						`Subreddit/${subreddit}/posts/${postID}/comments/${item.id}`
					),
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

	const deleteComment = async () => {
		const collectionRef = collection(
			firestore,
			`Subreddit/${subreddit}/posts/${postID}/comments`
		);
		const q = query(collectionRef);
		const querySnapshot = await getDocs(q);
		querySnapshot.forEach(async (item) => {
			if (item.data().timestamp === time) {
				await deleteDoc(
					doc(
						firestore,
						'Subreddit',
						`${subreddit}`,
						'posts',
						`${postID}`,
						'comments',
						item.id
					)
				);
			}
		});
		//state from Thread, forces the thread to rerender to remove the comment
		removeComment(true);
	};

	return (
		<div className="comment">
			<div className="comments-upvote">
				<img src={up} alt="comment upvote" onClick={() => upvote()} />
				<img src={down} alt="comment downvote" onClick={() => downvote()} />
			</div>
			<div className="comment-border">
				<div className="comment-info">
					<div className="comment-submitter">{name}</div>
					<div className="comment-score">{updatedScore} points </div>
					<div className="comment-time">
						{formatDistanceToNow(time, { includeSeconds: true })} ago
					</div>
					{currentUser === name ? (
						<button
							type="button"
							className="delete-comment"
							onClick={() => deleteComment()}
						>
							Delete
						</button>
					) : null}
				</div>
				<div className="comment-text">{text}</div>
			</div>
		</div>
	);
};

export default Comment;
