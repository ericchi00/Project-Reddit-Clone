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
import Post from '../../components/Post';
import PostForm from './PostForm';

const Subreddit = ({ currentUser, signedIn, uid }) => {
	const [posts, setPosts] = useState([]);
	const [createPost, setCreatePost] = useState(false);
	const [title, setTitle] = useState('');
	const [text, setText] = useState('');
	//default sort is hot
	const [sort, setSort] = useState('hot');
	const { subreddit } = useParams();

	const [loading, setLoading] = useState(true);

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
		setLoading(false);
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
		try {
			if (title.length <= 0 && text.length <= 0) return;
			const firestore = getFirestore();
			await addDoc(collection(firestore, `Subreddit/${subreddit}/posts`), {
				uid: uid,
				title: title,
				name: currentUser,
				score: 1,
				text: text,
				timestamp: Date.now(),
			});
			setCreatePost(false);
			const form = document.getElementById('create-post-form');
			form.reset();
		} catch (error) {
			console.error(error);
			return;
		}
	};

	return (
		<div className="subreddit">
			<div className="hot-new">
				<button onClick={() => setSort('hot')}>Hot</button>
				<button onClick={() => setSort('new')}>New</button>
			</div>
			<h2>r/{subreddit}</h2>
			{loading ? (
				<div className="lds-spinner">
					Loading
					<div></div>
					<div></div>
					<div></div>
					<div></div>
					<div></div>
					<div></div>
					<div></div>
					<div></div>
					<div></div>
					<div></div>
					<div></div>
					<div></div>
				</div>
			) : (
				<>
					{' '}
					{posts.length <= 0 ? (
						<div className="subreddit-empty">
							Subreddit is empty. Make the first post!
						</div>
					) : (
						<ul>
							{posts.map((post, i) => {
								return (
									<Post
										uid={uid}
										postUID={post.data.uid}
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
				</>
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
				<PostForm
					titleHandler={titleHandler}
					textHandler={textHandler}
					setCreatePost={setCreatePost}
					addPosts={addPosts}
				/>
			) : null}
		</div>
	);
};

export default Subreddit;
