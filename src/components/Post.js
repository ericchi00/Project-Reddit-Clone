import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useParams } from 'react-router';
import up from '../images/arrow-single-up.svg';
import down from '../images/arrow-single-down.svg';

const Post = ({ score, title, text, index }) => {
	const { subreddit } = useParams();

	return (
		<li className="post">
			<div className="post-index">{index}</div>
			<div className="score-wrapper">
				<div className="upvote-downvote">
					<img src={up} alt="upvote arrow" />
					<span className="post-score">{score}</span>
					<img src={down} alt="downvote arrow" />
				</div>
			</div>
			<Link to={`/r/${subreddit}/${title}`}>
				<div className="post-title">{title}</div>
			</Link>
		</li>
	);
};

export default Post;
