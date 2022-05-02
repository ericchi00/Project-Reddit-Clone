import React, { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
import { useParams } from 'react-router';
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
import { confirmAlert } from 'react-confirm-alert';
import { unmountComponentAtNode } from 'react-dom';

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
	const [upvoteActive, setUpvoteActive] = useState(false);
	const [downvoteActive, setDownvoteActive] = useState(false);

	useEffect(() => {
		// updates posts score after clicking on a different subreddit
		setUpdatedScore(score);
		// subreddit is undefined if accessing from homepage
		if (subreddit === undefined) {
			setSubredditName(sub);
		} else if (sub === undefined) {
			setSubredditName(subreddit);
		}
		addVoteClassOnLoad();
	}, [score]);

	const addVoteClassOnLoad = async () => {
		if (!signedIn) return;
		const docRef = doc(firestore, 'UserLikes', currentUser);
		const docSnap = await getDoc(docRef);
		const upvote = docSnap.data().upvotes;
		const downvote = docSnap.data().downvotes;
		if (upvote.length > 0) {
			upvote.forEach((vote) => {
				if (vote === time) {
					setUpvoteActive(true);
					setDownvoteActive(false);
				}
			});
		}
		if (downvote.length > 0) {
			downvote.forEach((vote) => {
				if (vote === time) {
					setDownvoteActive(true);
					setUpvoteActive(false);
				}
			});
		}
	};

	const upVote = async () => {
		if (!signedIn) {
			alert('You must be signed in to vote.');
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
					setUpvoteActive(false);
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
					setUpvoteActive(true);
					setDownvoteActive(false);
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
				setUpvoteActive(true);
				setUpdatedScore(item.data().score + 1);
			}
		});
	};

	const downVote = async () => {
		if (!signedIn) {
			alert('You must be signed in to vote.');
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
					setDownvoteActive(false);
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
					setDownvoteActive(true);
					setUpvoteActive(false);
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
				setDownvoteActive(true);
			}
		});
	};

	const deletePost = async () => {
		confirmAlert({
			title: 'Are you sure you want to delete your post?',
			buttons: [
				{
					label: 'No',
					onClick: () => {
						unmountComponentAtNode(
							document.getElementById('react-confirm-alert')
						);
					},
				},
				{
					label: 'Yes',
					onClick: async () => {
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
						const docRef = doc(
							firestore,
							`Subreddit/${subredditName}/posts/${docID}`
						);
						await deleteDoc(docRef);
						removePost(true);
					},
				},
			],
			closeOnEscape: true,
			closeOnClickOutside: true,
			keyCodeForClose: [8, 32],
		});
	};

	return (
		<li className="post">
			<div className="post-index">{index}</div>
			<div className="score-wrapper">
				<div className="upvote-downvote">
					<div
						className={upvoteActive ? 'arrow up active' : 'arrow up'}
						onClick={() => upVote()}
					></div>
					<span className="post-score">{updatedScore}</span>
					<div
						className={downvoteActive ? 'arrow down active' : 'arrow down'}
						onClick={() => downVote()}
					></div>
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
							Delete Post
						</button>
					) : null}
				</div>
			</div>
		</li>
	);
};

export default Post;
