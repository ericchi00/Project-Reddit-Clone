import React from 'react';

const Sort = ({ sortHandler }) => {
	return (
		<div className="comment-sort">
			<label htmlFor="sort">sorted by: </label>
			<select name="sort" id="sort" onChange={(e) => sortHandler(e)}>
				<option value="hot">Hot</option>
				<option value="new">New</option>
			</select>
		</div>
	);
};

export default Sort;
