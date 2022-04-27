import React from 'react';
import up from '../images/arrow-single-up.svg';
import down from '../images/arrow-single-down.svg';
import { formatDistanceToNow } from 'date-fns';

const Comment = ({ name, score, text, time }) => {
	return (
		<div className='comment'>
			<div className="comments-upvote">
				<img src={up} alt="comment upvote" />
				<p className="comment-score">{score}</p>
				<img src={down} alt="comment downvote" />
			</div>
			<div className="comment-submitter">{name}</div>
			<div className="comment-score">{score} points </div>
			<div className="comment-time">
				{formatDistanceToNow(time, { includeSeconds: true })} ago
			</div>
			<p className="comment-text">{text}</p>
		</div>
	);
};

export default Comment;


// finish styling and check how often it reads firestore when refreshing