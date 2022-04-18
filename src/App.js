import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import SubredditList from './components/SubredditList';
import './style/index.css';

const App = () => {
	// const [subreddit, setSubreddit] = useState([]);

	return (
		<BrowserRouter>
			<Header />
			<SubredditList />
			<Routes>
				<Route path="/" element="" />
				<Route path="/" element="" />
				<Route path="/" element="" />
			</Routes>
		</BrowserRouter>
	);
};

export default App;
