import {
	collection,
	getFirestore,
	query,
	setDoc,
	doc,
	getDocs,
	onSnapshot,
	QuerySnapshot,
} from '@firebase/firestore';
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import Post from './Post';

const Subreddit = (props) => {
	const [posts, setPosts] = useState([]);
	const [createPost, setCreatePost] = useState(false);
	const { subreddit } = useParams();

	useEffect(() => {
		grabPostsFromFirebase();
	}, [subreddit]);

	const grabPostsFromFirebase = async () => {
		let postsArr = [];
		const firestore = getFirestore();
		const collectionRef = collection(firestore, `Subreddit/${subreddit}/posts`);
		const q = query(collectionRef);
		// const querySnapshot = await getDocs(q);
		// querySnapshot.forEach((doc) => {
		// 	postsArr.push(doc.data());
		// });
		// setPosts(postsArr);

		const unsub = onSnapshot(q, (QuerySnapshot) => {
			QuerySnapshot.forEach((doc) => {
				postsArr.push(doc.data());
			});
			setPosts(postsArr);
		});
	};

	const addPosts = async () => {
		const firestore = getFirestore();
		await setDoc(doc(firestore, `Subreddit/${subreddit}`), {
			title: 'title',
			score: 1,
			text: 'text',
		});
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
						<input type="text" name="title" id="title" />
						<label htmlFor="text">Text: </label>
						<textarea id="text" name="text" rows="4" cols="50" />
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
						<button type="submit" className="new-post-submit">
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
