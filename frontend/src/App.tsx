import { useEffect, useState } from 'react';

function App() {
	const [count, setCount] = useState(0);
	const [message, setMessage] = useState('');

	async function fetchHealth() {
		const res = await fetch('http://localhost:3000/health');
		const data = await res.json();
		console.log(data);
		setMessage(data.message);
	}

	useEffect(() => {
		fetchHealth();
	}, []);

	return (
		<div className="flex justify-center items-center h-screen bg-gray-100">
			<div className="text-4xl font-bold">Hello World</div>
			<p>{count}</p>
			<button
				onClick={() => setCount(count + 1)}
				className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
			>
				Increment
			</button>
			<h1>MESSAGE: {message}</h1>
		</div>
	);
}

export default App;
