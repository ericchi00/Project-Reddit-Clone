import React, { useState, useEffect } from 'react';
import {
	getFirestore,
	doc,
	collection,
	getDoc,
	getDocs,
	setDoc,
	onSnapshot,
	query,
} from 'firebase/firestore';
import { Link } from 'react-router-dom';

const SubredditList = (props) => {
	const [create, setCreate] = useState(false);
	const [name, setName] = useState();
	const [list, setList] = useState([]);

	useEffect(() => {
		const getSubreddits = async () => {
			const listArr = [];
			const firestore = getFirestore();
			const collectionRef = collection(firestore, 'Subreddit');

			const q = query(collectionRef);
			const querySnapshot = await getDocs(q);
			querySnapshot.forEach((doc) => {
				listArr.push(doc.data().name);
			});
			setList(listArr);
		};
		getSubreddits();
	}, [create]);

	const createSubreddit = () => {
		setCreate(true);
	};

	const handleInput = (e) => {
		const { value } = e.target;
		const processValue = value.toLowerCase().replace(/[^A-Z0-9]+/gi, '');
		setName(processValue);
	};

	const onSubmit = async (e) => {
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
	};
	return (
		<div className="subreddit-list-wrapper">
			<input type="text" id="search" name="search" placeholder="Search" />
			<ul>
				{list.map((item, i) => {
					return (
						<Link to={`/r/${item}`}>
							<li key={i}>{item}</li>
						</Link>
					);
				})}
			</ul>
			{/* {this will map a list of subreddits, maybe 10 or 15 } */}
			<div className="subreddit-create" onClick={createSubreddit}>
				Create Subreddit
			</div>
			{create ? (
				<div className="create-subreddit-form">
					<input
						type="text"
						id="create"
						name="create"
						placeholder="Subreddit"
						onChange={(e) => handleInput(e)}
					/>
					<button type="button" onClick={(e) => onSubmit(e)}>
						Submit
					</button>
				</div>
			) : null}
			{console.log(list)}
		</div>
	);
};

export default SubredditList;
