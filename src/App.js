import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import SubredditList from './components/SubredditList';
import Subreddit from './components/Subreddit';
import Homepage from './components/Homepage';
import {
	getAuth,
	GoogleAuthProvider,
	signInWithPopup,
	onAuthStateChanged,
	signOut,
} from 'firebase/auth';
import './style/index.css';
import { getFirestore, doc, setDoc, getDoc } from '@firebase/firestore';
import Thread from './components/Thread';

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
				<Route path="/" element={<Homepage />} />
				<Route
					path="/r/:subreddit"
					element={<Subreddit currentUser={username} signedIn={signedIn} />}
				/>
				<Route
					path="/r/:subreddit/:postID"
					element={<Thread currentUser={username} signedIn={signedIn} />}
				/>
			</Routes>
		</BrowserRouter>
	);
};

export default App;
