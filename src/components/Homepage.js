import { collection, getDocs, getFirestore } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import Post from './Post';

const Homepage = ({ signedIn, currentUser }) => {
	const [posts, setPosts] = useState([]);
	const [removePost, setRemovePost] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		document.title = 'Reddit Clone Project';
		grabAllPosts();
		setRemovePost(false);
	}, [removePost]);

	const grabAllPosts = async () => {
		try {
			// using set as the for loops add duplicate objects
			let postsArr = [];
			const db = getFirestore();
			const querySnapshot = await getDocs(collection(db, 'Subreddit'));
			// first for loop grabs each subreddit's name
			querySnapshot.forEach(async (item) => {
				let threads = await getDocs(
					collection(db, 'Subreddit', `${item.data().name}`, 'posts')
				);
				// adds each post data to postsArr
				threads.forEach((thread) => {
					postsArr.push({
						data: thread.data(),
						name: item.data().name,
						id: thread.id,
					});
				});
				// sorts from high to low & removes duplicates
				let newArr = [...new Set(postsArr)].sort((a, b) =>
					b.data.score > a.data.score ? 1 : -1
				);
				setPosts(newArr);
				setLoading(false);
			});
		} catch (error) {
			alert(error, 'Please try reloading page');
		}
	};

	return (
		<div className="subreddit">
			<ul>
				<div className="home">Homepage</div>
				{loading ? (
					<div className="loading">homepage is loading data</div>
				) : (
					posts.map((post, i) => {
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
								key={post.data.timestamp}
								index={i + 1}
							/>
						);
					})
				)}
			</ul>
		</div>
	);
};

export default Homepage;
