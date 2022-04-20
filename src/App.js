import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import SubredditList from './components/SubredditList';
import Subreddit from './components/Subreddit';
import Comment from './components/Comment';
import {
	getAuth,
	GoogleAuthProvider,
	signInWithPopup,
	onAuthStateChanged,
	signOut,
} from 'firebase/auth';
import './style/index.css';
import { getFirestore, doc, setDoc, getDoc } from '@firebase/firestore';

const App = () => {
	const [signedIn, setSignedIn] = useState(false);
	const [username, setUserName] = useState('');
	const firestore = getFirestore();
	const provider = new GoogleAuthProvider();
	const auth = getAuth();

	useEffect(() => {
		onAuthStateChanged(auth, async (user) => {
			if (user) {
				setSignedIn(true);
				setUserName(user.displayName);
				const userFile = doc(firestore, 'UserLikes', user.displayName);
				const checkIfExists = await getDoc(userFile);
				if (!checkIfExists.exists()) {
					await setDoc(doc(firestore, 'UserLikes', user.displayName), {
						name: user.displayName,
					});
				} else return;
			} else return;
		});
	});

	// const onSubmit = async (e) => {
	// 	e.preventDefault();
	// 	const db = getFirestore();
	// 	const checkIfSubredditExists = doc(db, 'Subreddit', name);
	// 	const subreddit = await getDoc(checkIfSubredditExists);
	// 	if (!subreddit.exists()) {
	// 		await setDoc(doc(db, 'Subreddit', name), { name: name });
	// 		setCreate(false);
	// 	} else {
	// 		const create = document.getElementsByName('create')[0];
	// 		create.value = '';
	// 		create.placeholder = 'Subreddit already exists';
	// 	}
	// };

	const login = () => {
		signInWithPopup(auth, provider).catch((error) => {
			const errorCode = error.code;
			const errorMessage = error.message;
			const email = error.email;
			const credential = GoogleAuthProvider.credentialFromError(error);
			console.log(errorCode, errorMessage, email, credential);
		});
	};

	const signout = () => {
		signOut(auth)
			.then(() => {
				setSignedIn(false);
			})
			.catch((error) => {
				alert(error, 'Please try again!');
			});
	};

	return (
		<BrowserRouter>
			<Header
				signedIn={signedIn}
				username={username}
				login={login}
				signout={signout}
			/>
			<SubredditList />
			<Routes>
				<Route path="/" element="" />
				<Route
					path="/r/:subreddit"
					element={<Subreddit username={username} signedIn={signedIn} />}
				/>
				<Route path="/r/:subreddit/:postTitle" element={<Comment />} />
			</Routes>
		</BrowserRouter>
	);
};

export default App;
