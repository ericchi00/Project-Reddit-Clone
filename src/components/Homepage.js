import { collection, getDocs, getFirestore } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import Post from './Post';

const Homepage = ({ signedIn, currentUser }) => {
	const [posts, setPosts] = useState([]);
	const [removePost, setRemovePost] = useState(null);

	useEffect(() => {
		document.title = 'Reddit Clone';
		grabAllPosts();
		setRemovePost(false);
	}, [removePost]);

	const grabAllPosts = async () => {
		// using set as the for loops add duplicate objects
		let postsArr = new Set();
		const db = getFirestore();
		const querySnapshot = await getDocs(collection(db, 'Subreddit'));
		querySnapshot.forEach(async (item) => {
			const threads = await getDocs(
				collection(db, 'Subreddit', `${item.data().name}`, 'posts')
			);
			threads.forEach((thread) => {
				postsArr.add({
					data: thread.data(),
					name: item.data().name,
					id: thread.id,
				});
			});
			// sorting by high score to low
			let newArr = [...postsArr].sort((a, b) => b.data.score - a.data.score);
			setPosts(newArr);
		});
	};

	return (
		<div className="subreddit">
			<ul>
				<div className="home">Homepage</div>
				{posts.map((post, i) => {
					return (
						<Post
							removePost={setRemovePost}
							currentUser={currentUser}
							signedIn={signedIn}
							sub={post.name}
							time={post.data.timestamp}
							name={post.data.name}
							score={post.data.score}
							title={post.data.title}
							text={post.data.text}
							docID={post.id}
							key={i}
							index={i + 1}
						/>
					);
				})}
			</ul>
		</div>
	);
};

export default Homepage;
