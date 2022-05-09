import React, { useState, useEffect } from 'react';
import {
	getFirestore,
	doc,
	collection,
	getDoc,
	getDocs,
	setDoc,
	query,
} from 'firebase/firestore';
import { Link } from 'react-router-dom';

const SubredditList = (props) => {
	const [create, setCreate] = useState(false);
	const [name, setName] = useState();
	const [list, setList] = useState([]);

	useEffect(() => {
		getSubreddits();
	}, [create]);

	const getSubreddits = async () => {
		try {
			const listArr = [];
			const firestore = getFirestore();
			const collectionRef = collection(firestore, 'Subreddit');

			const q = query(collectionRef);
			const querySnapshot = await getDocs(q);
			querySnapshot.forEach((doc) => {
				listArr.push(doc.data().name);
			});
			setList(listArr);
		} catch (error) {
			console.error(error);
			return;
		}
	};

	const handleInput = (e) => {
		const { value } = e.target;
		const processValue = value.toLowerCase().replace(/[^A-Z0-9]+/gi, '');
		setName(processValue);
	};

	const onSubmit = async (e) => {
		try {
			e.preventDefault();
			const db = getFirestore();
			const checkIfSubredditExists = doc(db, 'Subreddit', name);
			const subreddit = await getDoc(checkIfSubredditExists);
			if (!subreddit.exists()) {
				await setDoc(doc(db, 'Subreddit', name), { name: name });
				setCreate(false);
			} else {
				const create = document.getElementsByName('create')[0];
				create.value = '';
				create.placeholder = 'Subreddit already exists';
			}
		} catch (error) {
			console.log(error);
			return;
		}
	};
	return (
		<div className="subreddit-list-wrapper">
			<ul>
				{list.map((item, i) => {
					return (
						<Link to={`/r/${item}`} key={i}>
							<li>r/{item}</li>
						</Link>
					);
				})}
			</ul>
			<button
				type="button"
				className="subreddit-create"
				onClick={() => setCreate(true)}
			>
				Create Subreddit
			</button>
			{create ? (
				<div className="create-subreddit-form">
					<input
						type="text"
						id="create"
						name="create"
						placeholder="Enter Subreddit Name"
						onChange={(e) => handleInput(e)}
					/>
					<button type="button" onClick={(e) => onSubmit(e)}>
						Submit
					</button>
				</div>
			) : null}
		</div>
	);
};

export default SubredditList;
