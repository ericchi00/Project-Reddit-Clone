import {
	collection,
	getFirestore,
	query,
	getDocs,
	addDoc,
	orderBy,
} from '@firebase/firestore';
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import Post from './Post';

const Subreddit = ({ currentUser, signedIn }) => {
	const [posts, setPosts] = useState([]);
	const [createPost, setCreatePost] = useState(false);
	const [title, setTitle] = useState('');
	const [text, setText] = useState('');
	const [sort, setSort] = useState('hot');
	const { subreddit } = useParams();

	// state to pass down to post
	const [removePost, setRemovePost] = useState(null);

	useEffect(() => {
		document.title = `r/${subreddit}`;
		grabPostsFromFirebase(sort);
		setRemovePost(false);
	}, [subreddit, createPost, sort, removePost]);

	const grabPostsFromFirebase = async (expr) => {
		let postsArr = [];
		const firestore = getFirestore();
		const collectionRef = collection(firestore, `Subreddit/${subreddit}/posts`);
		// sorts by newest on bottom first, oldest on top
		if (expr === 'hot') {
			const q = query(collectionRef, orderBy('score', 'desc'));
			const querySnapshot = await getDocs(q);
			querySnapshot.forEach((doc) => {
				postsArr.push({ data: doc.data(), id: doc.id });
			});
		} else if (expr === 'new') {
			const q = query(collectionRef, orderBy('timestamp', 'desc'));
			const querySnapshot = await getDocs(q);
			querySnapshot.forEach((doc) => {
				postsArr.push({ data: doc.data(), id: doc.id });
			});
		}
		setPosts(postsArr);
	};

	const titleHandler = (e) => {
		const { value } = e.target;
		setTitle(value);
	};

	const textHandler = (e) => {
		const { value } = e.target;
		setText(value);
	};

	const addPosts = async (e) => {
		e.preventDefault();
		if (!signedIn) {
			alert('You must be signed in to create a post.');
			return;
		}
		if (title.length <= 0 && text.length <= 0) return;
		const firestore = getFirestore();
		await addDoc(collection(firestore, `Subreddit/${subreddit}/posts`), {
			title: title,
			name: currentUser,
			score: 1,
			text: text,
			timestamp: Date.now(),
		});
		setCreatePost(false);
		const form = document.getElementById('create-post-form');
		form.reset();
	};

	return (
		<div className="subreddit">
			<div className="hot-new">
				<button onClick={() => setSort('hot')}>Hot</button>
				<button onClick={() => setSort('new')}>New</button>
			</div>
			<h2>r/{subreddit}</h2>
			{posts.length <= 0 ? (
				<div className="subreddit-empty">
					Subreddit is empty. Make the first post!
				</div>
			) : (
				<ul>
					{posts.map((post, i) => {
						return (
							<Post
								removePost={setRemovePost}
								currentUser={currentUser}
								signedIn={signedIn}
								time={post.data.timestamp}
								name={post.data.name}
								score={post.data.score}
								title={post.data.title}
								text={post.data.text}
								docID={post.id}
								key={post.data.timestamp}
								index={i + 1}
							/>
						);
					})}
				</ul>
			)}
			<button
				type="button"
				className="add-post"
				onClick={() => {
					setCreatePost(true);
				}}
			>
				Create a new post!
			</button>
			{createPost ? (
				<form id="create-post-form">
					<fieldset>
						<legend>New Post</legend>
						<label htmlFor="title">Title*: </label>
						<input
							type="text"
							name="title"
							id="title"
							onChange={(e) => titleHandler(e)}
							required
						/>
						<label htmlFor="text">Text*: </label>
						<textarea
							id="text"
							name="text"
							rows="4"
							cols="50"
							onChange={(e) => textHandler(e)}
							required
						/>
					</fieldset>
					<div className="submit-wrapper">
						<button
							className="close-form"
							onClick={() => {
								setCreatePost(false);
							}}
						>
							Close
						</button>
						<button
							type="submit"
							className="new-post-submit"
							onClick={(e) => addPosts(e)}
						>
							Submit
						</button>
					</div>
				</form>
			) : null}
		</div>
	);
};

export default Subreddit;
