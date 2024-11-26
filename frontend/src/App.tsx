import { useEffect, useState } from 'react';
import { Socket, io } from 'socket.io-client';

enum SocketConnectStatus {
	CONNECTED = 'connected',
	DISCONNECTED = 'disconnected',
	CONNECTING = 'connecting',
}

const BE_PORT = 3000;
const SOCKET_PORT = 3001;
// const BE_URL_BASE = 'http://54.238.209.192';
const BE_URL_BASE = 'http://localhost';
const DEFAULT_GAME_SERVER_IP = 'AppleInSpace.aternos.me';

type SocketInstance = {
	port: number;
	instance: Socket | null;
};

const socketInstance: SocketInstance = {
	port: -1,
	instance: null,
};

function App() {
	const [message, setMessage] = useState('');
	const [socket, setSocket] = useState<SocketInstance>(socketInstance);
	const [socketConnectStatus, setSocketConnectStatus] =
		useState<SocketConnectStatus>(SocketConnectStatus.DISCONNECTED);
	const [botStatus, setBotStatus] = useState('');
	const [gameServerIp, setGameServerIp] = useState(DEFAULT_GAME_SERVER_IP);
	const [botUsername, setBotUsername] = useState('');
	async function fetchHealth() {
		const res = await fetch(`${BE_URL_BASE}:${BE_PORT}/health`);
		const data = await res.json();
		console.log(data);
		setMessage(data.status);
	}

	async function connectSocket() {
		// First ask BE for available port

		// try {
		// 	const res = await fetch(`${BE_URL_BASE}:${BE_PORT}/quotaAvailability`);
		// 	const data = await res.json();

		// 	if (data.code !== 0 || data.data === -1) {
		// 		console.error('Failed to get available port.', data);
		// 		setBotStatus('All sockets are in use. Please try again later.');
		// 		return;
		// 	}

		// 	port = data.data;
		// } catch (err) {
		// 	console.error(err);
		// 	return;
		// }

		const s = io(`${BE_URL_BASE}:${SOCKET_PORT}`, {
			query: {
				gameServerIp,
				botUsername: botUsername,
			},
		});
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

		setSocket({ port: SOCKET_PORT, instance: s });
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
					<input
						type="text"
						className="w-64 border-2 border-gray-300 rounded-md p-2 text-center"
						placeholder="Enter Server IP"
						value={gameServerIp}
						onChange={(e) => {
							setGameServerIp(e.target.value);
						}}
						disabled={
							socketConnectStatus === SocketConnectStatus.CONNECTING ||
							socketConnectStatus === SocketConnectStatus.CONNECTED
						}
					/>
					<input
						type="text"
						className="w-64 border-2 border-gray-300 rounded-md p-2 text-center"
						placeholder="Enter Bot Username"
						value={botUsername}
						onChange={(e) => {
							setBotUsername(e.target.value);
						}}
						disabled={
							socketConnectStatus === SocketConnectStatus.CONNECTING ||
							socketConnectStatus === SocketConnectStatus.CONNECTED
						}
					/>
					{socketConnectStatus !== SocketConnectStatus.CONNECTED && (
						<button
							disabled={
								socketConnectStatus === SocketConnectStatus.CONNECTING ||
								!botUsername ||
								!gameServerIp
							}
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
