import { useEffect, useState } from 'react';
import { Socket, io } from 'socket.io-client';

enum SocketConnectStatus {
	CONNECTED = 'connected',
	DISCONNECTED = 'disconnected',
	CONNECTING = 'connecting',
}

const BE_PORT = 3000;
const BE_URL_BASE = 'http://localhost';

type SocketInstance = {
	port: number;
	instance: Socket | null;
};

const socketInstance: SocketInstance = {
	port: -1,
	instance: null,
};

function App() {
	const [count, setCount] = useState(0);
	const [message, setMessage] = useState('');
	const [socket, setSocket] = useState<SocketInstance>(socketInstance);
	const [socketConnectStatus, setSocketConnectStatus] =
		useState<SocketConnectStatus>(SocketConnectStatus.DISCONNECTED);
	const [botStatus, setBotStatus] = useState('');
	async function fetchHealth() {
		const res = await fetch(`${BE_URL_BASE}:${BE_PORT}/health`);
		const data = await res.json();
		console.log(data);
		setMessage(data.message);
	}

	async function connectSocket() {
		// First ask BE for available port
		let port = -1;
		try {
			const res = await fetch(`${BE_URL_BASE}:${BE_PORT}/quotaAvailability`);
			const data = await res.json();

			if (data.code !== 0 || data.data === -1) {
				console.error('Failed to get available port.', data);
				setBotStatus('All sockets are in use. Please try again later.');
				return;
			}

			port = data.data;
		} catch (err) {
			console.error(err);
			return;
		}

		const s = io(`${BE_URL_BASE}:${port}`);
		setSocketConnectStatus(SocketConnectStatus.CONNECTING);

		s.on('connect', () => {
			// setSocketConnectStatus(SocketConnectStatus.CONNECTED);
			console.log('Connected to Socket.IO server');
			setBotStatus('Initializing...');
		});

		s.on('disconnect', () => {
			setSocketConnectStatus(SocketConnectStatus.DISCONNECTED);
			console.log('Disconnected from Socket.IO server');
		});

		s.on('botStatus', (status) => {
			if (status === 'spawn') {
				setSocketConnectStatus(SocketConnectStatus.CONNECTED);
				setBotStatus('Success');
			} else {
				setBotStatus(status);
			}
		});

		setSocket({ port, instance: s });
	}

	const disconnectSocket = () => {
		if (socket.instance) {
			socket.instance.disconnect();
			setSocket(socketInstance);
			setBotStatus('Disconnected');
		}
	};

	// Clean up socket connection on component unmount
	useEffect(() => {
		return () => {
			if (socket.instance) {
				socket.instance.disconnect();
			}
		};
	}, [socket]);

	useEffect(() => {
		fetchHealth();
	}, []);

	const socketConnectStatusText = () => {
		switch (socketConnectStatus) {
			case SocketConnectStatus.CONNECTED:
				return `Connected to port ${socket.port}`;
			case SocketConnectStatus.CONNECTING:
				return 'Connecting...';
			case SocketConnectStatus.DISCONNECTED:
				return 'Connect to Socket.IO';
		}
	};

	console.log(socket);

	return (
		<>
			<div className="flex items-center justify-center flex-col h-screen bg-gray-100">
				<div className="mb-5 text-4xl font-bold text-center">
					Mineflayer Web (Commercial)
				</div>
				<div className="">
					React state debugging: <em>{count}</em>
				</div>
				<div className="mb-5">
					<button
						onClick={() => setCount(count + 1)}
						className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
					>
						Increment
					</button>
				</div>
				<hr className="my-6 w-[50%]" />

				<div className="flex flex-col items-center">
					<h3>BE Status:</h3>
					<p className="text-lg font-bold">
						{message ? message : 'Not Connected'}
					</p>
				</div>
				<hr className="my-6 w-[50%]" />
				<div className="flex flex-col items-center gap-3">
					<h3>{socketConnectStatusText()}</h3>
					{socketConnectStatus !== SocketConnectStatus.CONNECTED && (
						<button
							disabled={socketConnectStatus === SocketConnectStatus.CONNECTING}
							onClick={() => {
								connectSocket();
							}}
							style={
								socketConnectStatus === SocketConnectStatus.CONNECTING
									? { opacity: 0.5 }
									: undefined
							}
							className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
						>
							Connect
						</button>
					)}
					{socketConnectStatus === SocketConnectStatus.CONNECTED && (
						<button
							onClick={() => {
								disconnectSocket();
							}}
							className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
						>
							Disconnect
						</button>
					)}
				</div>
				{botStatus && (
					<div className="flex flex-col items-center gap-3">
						<h3>Bot Status:</h3>
						<p className="text-lg font-bold">{botStatus}</p>
					</div>
				)}
			</div>
		</>
	);
}

export default App;
