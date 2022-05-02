import React, { useState, useEffect } from 'react';
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
	addDoc,
	orderBy,
	deleteDoc,
} from '@firebase/firestore';
import { confirmAlert } from 'react-confirm-alert';
import { Link } from 'react-router-dom';
import '../../style/post-comment.css';
import '../../style/confirm-alert.css';
import { formatDistanceToNow } from 'date-fns';
import { unmountComponentAtNode } from 'react-dom';
import Comment from './Comment';
import CommentForm from './CommentForm';
import Sort from './Sort';

const Thread = ({ currentUser, signedIn }) => {
	const { subreddit, postID } = useParams();
	const firestore = getFirestore();
	const [comments, setComments] = useState([]);
	const [newComment, setNewComment] = useState(null);
	const [postInfo, setPostInfo] = useState({ time: 0 });
	const [time, setTime] = useState(null);
	const [editable, setEditable] = useState(false);

	const [commentText, setCommentText] = useState(null);
	const [updatedScore, setUpdatedScore] = useState(null);

	const [sort, setSort] = useState('hot');
	// sets css class to show vote
	const [upvoteActive, setUpvoteActive] = useState(false);
	const [downvoteActive, setDownvoteActive] = useState(false);

	useEffect(() => {
		getPostData();
		getComments(sort);
		setNewComment(false);
		addVoteClassOnLoad();
	}, [newComment, sort, time]);

	const commentHandler = (e) => {
		const { value } = e.target;
		setCommentText(value);
	};

	const getPostData = async () => {
		try {
			const collectionRef = collection(
				firestore,
				`Subreddit/${subreddit}/posts`
			);
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
					setTime(item.data().timestamp);
				}
			});
		} catch (error) {
			alert(error, 'has occured. Please reload page');
		}
	};

	const getComments = async (expr) => {
		let commentsArr = [];
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
		} else if (downvote.length > 0) {
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
					setUpvoteActive(false);
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
					setUpvoteActive(true);
					setDownvoteActive(false);
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
					setDownvoteActive(false);
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
					setDownvoteActive(true);
					setUpvoteActive(false);
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
				setDownvoteActive(true);
			}
		});
	};

	const submitComment = async (e) => {
		e.preventDefault();
		if (!signedIn) {
			alert('You must be signed in to comment.');
			return;
		}
		const comment = document.getElementById('comment');
		comment.placeholder = 'Comment needs to be longer than 1 character.';
		if (commentText <= 1) {
			comment.placeholder = 'Comment needs to be longer than 1 character.';
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
		setCommentText(null);
		comment.placeholder = 'Enter a comment';
		setNewComment(true);
	};

	const sortHandler = (e) => {
		const { value } = e.target;
		setSort(value);
	};

	const deletePost = async (e) => {
		confirmAlert({
			title: 'Are you sure you want to delete this post?',
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
							`Subreddit/${subreddit}/posts/${postID}/comments`
						);
						const q = query(collectionRef);
						const querySnapshot = await getDocs(q);
						querySnapshot.forEach((item) => {
							deleteDoc(
								doc(
									firestore,
									`Subreddit/${subreddit}/posts/${postID}/comments/${item.id}`
								)
							);
						});

						// removes comments from post
						const docRef = doc(
							firestore,
							`Subreddit/${subreddit}/posts/${postID}`
						);
						await deleteDoc(docRef);
						window.location.href = `/r/${subreddit}`;
					},
				},
			],
			closeOnEscape: true,
			closeOnClickOutside: true,
			keyCodeForClose: [8, 32],
		});
	};

	const editPost = () => {
		setEditable(true);
	};

	const submitEdit = async () => {
		const newText = document
			.querySelector('.post-text')
			.querySelector('div').innerText;
		if (newText.length <= 1) {
			alert('Post must be greater than one character');
			return;
		}
		await updateDoc(
			doc(firestore, 'Subreddit', `${subreddit}`, 'posts', `${postID}`),
			{ text: newText }
		);
		// provides UI feedback that the edit was saved
		window.location.href = `/r/${subreddit}/${postID}`;
	};

	return (
		<div className="post-comment">
			<Link to={`/r/${subreddit}`}>
				<h2>r/{subreddit}</h2>
			</Link>
			<div className="post-comment-wrapper">
				<div className="up-down">
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
				<div className="posts-wrapper">
					<div className="thread-title">{postInfo.title}</div>
					<div className="post-submitter">
						Submitted by {postInfo.name}{' '}
						{formatDistanceToNow(postInfo.time, { includeSeconds: true })} ago{' '}
						{postInfo.name === currentUser ? (
							<>
								<button type="button" onClick={(e) => deletePost(e)}>
									Delete Post
								</button>{' '}
								<button type="button" onClick={() => editPost()}>
									Edit Post
								</button>{' '}
								{editable ? (
									<button
										type="button"
										className="submit-edit"
										onClick={() => submitEdit()}
									>
										Submit Edit
									</button>
								) : null}
							</>
						) : null}
					</div>
					<div className="post-text">
						<div
							className={editable ? 'edit' : null}
							contentEditable={editable}
							suppressContentEditableWarning={true}
						>
							{postInfo.text}
						</div>
					</div>
				</div>
			</div>
			<Sort sortHandler={sortHandler} />
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
								postID={postID}
								subreddit={subreddit}
								currentUser={currentUser}
								signedIn={signedIn}
								key={comment.timestamp}
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
