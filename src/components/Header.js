import React from 'react';
import bot from '../images/bot.svg';

const Header = () => {
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
					<div className="google-login">
						<p>
							Google Sign(this will display user name or it will display sign
							in)
						</p>
					</div>
				</ul>
			</nav>
		</header>
	);
};

export default Header;
