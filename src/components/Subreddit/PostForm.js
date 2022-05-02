import React from 'react';

const PostForm = ({ titleHandler, textHandler, setCreatePost, addPosts }) => {
	return (
		<form id="create-post-form">
			<fieldset>
				<legend>New Post</legend>
				<label htmlFor="title">Title*: </label>
				<input
					type="text"
					name="title"
					id="title"
					onChange={(e) => titleHandler(e)}
					required
				/>
				<label htmlFor="text">Text*: </label>
				<textarea
					id="text"
					name="text"
					rows="4"
					cols="50"
					onChange={(e) => textHandler(e)}
					required
				/>
			</fieldset>
			<div className="submit-wrapper">
				<button
					className="close-form"
					onClick={() => {
						setCreatePost(false);
					}}
				>
					Close
				</button>
				<button
					type="submit"
					className="new-post-submit"
					onClick={(e) => addPosts(e)}
				>
					Submit
				</button>
			</div>
		</form>
	);
};

export default PostForm;
