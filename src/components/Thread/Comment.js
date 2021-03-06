import React, { useEffect, useState } from 'react';
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
import { confirmAlert } from 'react-confirm-alert';
import { unmountComponentAtNode } from 'react-dom';

const Comment = ({
	name,
	score,
	text,
	time,
	signedIn,
	currentUser,
	subreddit,
	postID,
	uid,
	commentUID,
}) => {
	const [updatedScore, setUpdatedScore] = useState(score);
	// sets css class to show vote
	const [upvoteActive, setUpvoteActive] = useState(false);
	const [downvoteActive, setDownvoteActive] = useState(false);
	const [edit, setEdit] = useState(false);

	const firestore = getFirestore();

	useEffect(() => {
		addVoteClassOnLoad();
	}, []);

	const addVoteClassOnLoad = async () => {
		if (!signedIn) return;
		try {
			const docRef = doc(firestore, 'UserLikes', uid);
			const docSnap = await getDoc(docRef);
			const upvote = docSnap.data().upvotes;
			const downvote = docSnap.data().downvotes;
			if (upvote.length > 0) {
				upvote.forEach((vote) => {
					if (vote === time) {
						setDownvoteActive(false);
						setUpvoteActive(true);
					}
				});
			}
			if (downvote.length > 0) {
				downvote.forEach((vote) => {
					if (vote === time) {
						setUpvoteActive(false);
						setDownvoteActive(true);
					}
				});
			}
		} catch (error) {
			console.error(error);
			return;
		}
	};

	const upvote = async () => {
		if (!signedIn) {
			alert('You must be signed in to vote.');
			return;
		}
		try {
			const docRef = doc(firestore, 'UserLikes', uid);
			const docSnap = await getDoc(docRef);
			const upvote = docSnap.data().upvotes;
			const downvote = docSnap.data().downvotes;

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
						await updateDoc(doc(firestore, `UserLikes/${uid}`), {
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
							doc(
								firestore,
								`Subreddit/${subreddit}/posts/${postID}/comments/${item.id}`
							),
							{
								score: increment(2),
							}
						);
						await updateDoc(doc(firestore, `UserLikes/${uid}`), {
							upvotes: arrayUnion(time),
							downvotes: arrayRemove(time),
						});
						setUpdatedScore(item.data().score + 2);
						setUpvoteActive(true);
						setDownvoteActive(false);
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
					await updateDoc(doc(firestore, `UserLikes/${uid}`), {
						upvotes: arrayUnion(time),
						downvotes: arrayRemove(time),
					});
					setUpvoteActive(true);
					setUpdatedScore(item.data().score + 1);
				}
			});
		} catch (error) {
			console.error(error);
			return;
		}
	};

	const downvote = async () => {
		if (!signedIn) {
			alert('You must be signed in to vote.');
			return;
		}
		try {
			const docRef = doc(firestore, 'UserLikes', uid);
			const docSnap = await getDoc(docRef);
			const upvote = docSnap.data().upvotes;
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
						await updateDoc(doc(firestore, `UserLikes/${uid}`), {
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
							doc(
								firestore,
								`Subreddit/${subreddit}/posts/${postID}/comments/${item.id}`
							),
							{
								score: increment(-2),
							}
						);
						await updateDoc(doc(firestore, `UserLikes/${uid}`), {
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
						doc(
							firestore,
							`Subreddit/${subreddit}/posts/${postID}/comments/${item.id}`
						),
						{
							score: increment(-1),
						}
					);
					await updateDoc(doc(firestore, `UserLikes/${uid}`), {
						upvotes: arrayRemove(time),
						downvotes: arrayUnion(time),
					});
					setUpdatedScore(item.data().score - 1);
					setDownvoteActive(true);
				}
			});
		} catch (error) {
			console.error(error);
			return;
		}
	};

	const deleteComment = async () => {
		confirmAlert({
			title: 'Are you sure you want to delete your comment?',
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
						try {
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
									// // set timeout to wait for comment to be deleted first
									setTimeout(
										(window.location.href = `/r/${subreddit}/${postID}`),
										500
									);
								}
							});
						} catch (error) {
							console.error(error);
							alert(error, 'has occurred. Please reload page and try again');
							return;
						}
					},
				},
			],
			closeOnEscape: true,
			closeOnClickOutside: true,
			keyCodeForClose: [8, 32],
		});
	};

	const submitEdit = async (e) => {
		try {
			const updatedComment = e.currentTarget
				.closest('.comment')
				.querySelector('.comment-text.edit').innerText;
			if (updatedComment.length <= 1) {
				alert('Comment must be more than one character');
				return;
			}
			const collectionRef = collection(
				firestore,
				`Subreddit/${subreddit}/posts/${postID}/comments`
			);
			const q = query(collectionRef);
			const querySnapshot = await getDocs(q);
			querySnapshot.forEach(async (item) => {
				if (item.data().timestamp === time) {
					await updateDoc(
						doc(
							firestore,
							`Subreddit/${subreddit}/posts/${postID}/comments/${item.id}`
						),
						{ text: updatedComment }
					);
					// set timeout to provide UI feedback that comment was updated
					setTimeout((window.location.href = `/r/${subreddit}/${postID}`), 500);
				}
			});
		} catch (error) {
			console.error(error);
			alert(error, 'has occurred. Please reload page and try again');
			return;
		}
	};

	return (
		<div className="comment">
			<div className="comments-upvote">
				<div
					className={upvoteActive ? 'arrow up active' : 'arrow up'}
					onClick={() => upvote()}
				></div>
				<div
					className={downvoteActive ? 'arrow down active' : 'arrow down'}
					onClick={() => downvote()}
				></div>
			</div>
			<div className="comment-border">
				<div className="comment-info">
					<div className="comment-submitter">{name}</div>
					<div className="comment-score">{updatedScore} points </div>
					<div className="comment-time">
						{formatDistanceToNow(time, { includeSeconds: true })} ago
					</div>
					{commentUID === uid ? (
						<>
							<button
								type="button"
								className="delete-comment"
								onClick={() => deleteComment()}
							>
								Delete
							</button>
							<button type="button" onClick={() => setEdit(true)}>
								Edit Comment
							</button>
							{edit ? (
								<button type="button" onClick={(e) => submitEdit(e)}>
									Submit Edit
								</button>
							) : null}
						</>
					) : null}
				</div>
				<div
					className={edit ? 'comment-text edit' : 'comment-text'}
					contentEditable={edit}
					suppressContentEditableWarning={true}
				>
					{text}
				</div>
			</div>
		</div>
	);
};

export default Comment;
