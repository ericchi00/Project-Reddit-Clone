import React from 'react';

const CommentForm = ({ commentHandler, submitComment }) => {
	return (
		<form id="comment-form">
			<textarea
				id="comment"
				name="comment"
				rows="5"
				cols="60"
				placeholder="Enter comment"
				onChange={(e) => commentHandler(e)}
			/>
			<button type="button" onClick={(e) => submitComment(e)}>
				Save
			</button>
		</form>
	);
};

export default CommentForm;
