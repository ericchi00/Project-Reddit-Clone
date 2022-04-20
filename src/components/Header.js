import React, { useState, useEffect } from 'react';
import {
	getAuth,
	GoogleAuthProvider,
	signInWithPopup,
	onAuthStateChanged,
	signOut,
} from 'firebase/auth';
import bot from '../images/bot.svg';

const Header = () => {
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
		<header>
			<nav>
				<ul>
					<div className="left-header">
						<li className="logo">
							<img src={bot} alt="Bot Logo" />
							<p>reddit</p>
						</li>
						<li className="link-header">Hot</li>
						<li className="link-header">New</li>
					</div>
					{!signedIn ? (
						<div className="google-wrapper">
							<button
								type="button"
								className="google-login"
								onClick={() => login()}
							>
								Login with Google
							</button>
						</div>
					) : (
						<div className="google-signedin">
							<div className="google-username">
								Signed in as: <span>{username}</span>
							</div>
							<button
								type="button"
								className="signout"
								onClick={() => signout()}
							>
								Sign Out
							</button>
						</div>
					)}
				</ul>
			</nav>
		</header>
	);
};

export default Header;
