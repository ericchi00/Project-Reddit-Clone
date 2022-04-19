import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import SubredditList from './components/SubredditList';
import Subreddit from './components/Subreddit';
import Post from './components/Post';
import './style/index.css';

const App = () => {
	// const [subreddit, setSubreddit] = useState([]);

	return (
		<BrowserRouter>
			<Header />
			<SubredditList />
			<Routes>
				<Route path="/" element="" />
				<Route path="/r/:subreddit" element={<Subreddit />} />
				<Route path="/r/:subreddit/:title" element={<Post />} />
			</Routes>
		</BrowserRouter>
	);
};

export default App;
