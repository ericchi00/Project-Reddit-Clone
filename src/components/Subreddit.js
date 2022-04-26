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

const Subreddit = ({ username, signedIn }) => {
	const [posts, setPosts] = useState([]);
	const [createPost, setCreatePost] = useState(false);
	const [title, setTitle] = useState('');
	const [text, setText] = useState('');
	const { subreddit } = useParams();

	useEffect(() => {
		grabPostsFromFirebase();
	}, [subreddit, createPost]);

	const grabPostsFromFirebase = async () => {
		let postsArr = [];
		const firestore = getFirestore();
		const collectionRef = collection(firestore, `Subreddit/${subreddit}/posts`);
		// sorts by newest on bottom first, oldest on top
		const q = query(collectionRef, orderBy('timestamp', 'asc'));
		const querySnapshot = await getDocs(q);
		querySnapshot.forEach((doc) => {
			postsArr.push(doc.data());
		});
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
		const firestore = getFirestore();
		await addDoc(collection(firestore, `Subreddit/${subreddit}/posts`), {
			name: username,
			score: 1,
			title: title,
			text: text,
			timestamp: Date.now(),
		});
		setCreatePost(false);
		const form = document.getElementById('create-post-form');
		form.reset();
	};

	return (
		<div className="subreddit">
			<h2>r/{subreddit}</h2>
			{posts.length <= 0 ? (
				<div className="subreddit=empty">
					Subreddit is empty. Make the first post!
				</div>
			) : (
				<ul>
					{posts.map((post, i) => {
						return (
							<Post
								signedIn={signedIn}
								time={post.timestamp}
								name={post.name}
								score={post.score}
								title={post.title}
								text={post.text}
								key={i}
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
						<label htmlFor="title">Title: </label>
						<input
							type="text"
							name="title"
							id="title"
							onChange={(e) => titleHandler(e)}
						/>
						<label htmlFor="text">Text: </label>
						<textarea
							id="text"
							name="text"
							rows="4"
							cols="50"
							onChange={(e) => textHandler(e)}
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
			{console.log(posts)}
		</div>
	);
};

export default Subreddit;
