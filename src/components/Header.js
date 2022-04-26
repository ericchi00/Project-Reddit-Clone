import React from 'react';
import { Link } from 'react-router-dom';
import bot from '../images/bot.svg';

const Header = ({ username, signedIn, login, signout }) => {
	return (
		<header>
			<nav>
				<ul>
					<div className="left-header">
						<li className="logo">
							<Link to="/">
								<img src={bot} alt="Bot Logo" />
							</Link>
							<Link to="/">
								<p>reddit</p>
							</Link>
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
