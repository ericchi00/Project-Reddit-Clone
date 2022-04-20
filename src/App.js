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

const App = () => {
	const [signedIn, setSignedIn] = useState(false);
	const [username, setUserName] = useState('');
	const provider = new GoogleAuthProvider();
	const auth = getAuth();

	useEffect(() => {
		onAuthStateChanged(auth, (user) => {
			if (user) {
				setUserName(user.displayName);
				setSignedIn(true);
			} else {
				return;
			}
		});
	});

	const login = () => {
		signInWithPopup(auth, provider)
			.then((result) => {
				const credential = GoogleAuthProvider.credentialFromResult(result);
				const token = credential.accessToken;
				const user = result.user;
			})
			.catch((error) => {
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
					element={<Subreddit username={username} />}
				/>
				<Route path="/r/:subreddit/:postTitle" element={<Comment />} />
			</Routes>
		</BrowserRouter>
	);
};

export default App;
