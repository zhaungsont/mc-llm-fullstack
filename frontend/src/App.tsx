import { useEffect, useState } from 'react';
import { Socket, io } from 'socket.io-client';
import BotCard from './BotCard';
import InitialConnectCard from './InitialConnectCard';
enum SocketConnectStatus {
	CONNECTED = 'connected',
	DISCONNECTED = 'disconnected',
	CONNECTING = 'connecting',
}

const BE_PORT = 3000;
export const SOCKET_PORT = 3001;
// const BE_URL_BASE = 'http://54.238.209.192';
const BE_URL_BASE = 'http://localhost';
const DEFAULT_GAME_SERVER_IP = 'AppleInSpace.aternos.me';

interface Bot {
	botId: string;
	botName: string;
	health: number;
	food: number;
	botStatus: string;
}

function App() {
	const [BEStatus, setBEStatus] = useState('');
	const [socket, setSocket] = useState<Socket | null>(null);
	const [socketConnectStatus, setSocketConnectStatus] =
		useState<SocketConnectStatus>(SocketConnectStatus.DISCONNECTED);
	// const [botStatus, setBotStatus] = useState('');
	const [gameServerIp, setGameServerIp] = useState(DEFAULT_GAME_SERVER_IP);
	const [botUsername, setBotUsername] = useState('Bot');
	const [bots, setBots] = useState<Bot[]>([]);

	async function fetchHealth() {
		try {
			const res = await fetch(`${BE_URL_BASE}:${BE_PORT}/health`);
			const data = await res.json();
			console.log(data);
			setBEStatus(data.status);
		} catch (err) {
			console.error(err);
		}
	}

	async function connectSocket() {
		console.log('Connecting to Socket.IO');
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
			// setBotStatus('Initializing...');
		});

		s.on('disconnect', () => {
			setSocketConnectStatus(SocketConnectStatus.DISCONNECTED);
			console.log('Disconnected from Socket.IO server');
			setBots([]);
		});

		// s.on('botStatus', (status) => {
		// 	if (status === 'spawn') {
		// 		setSocketConnectStatus(SocketConnectStatus.CONNECTED);
		// 		setBotStatus('Success');
		// 	} else {
		// 		setBotStatus(status);
		// 	}
		// });

		s.on('botsUpdate', (bots: Bot[]) => {
			setBots(bots);
		});

		setSocket(s);
	}

	// const disconnectSocket = () => {
	// 	if (socket) {
	// 		socket.disconnect();
	// 		setSocket(null);
	// 		setBotStatus('Disconnected');
	// 	}
	// };

	// Clean up socket connection on component unmount
	useEffect(() => {
		return () => {
			if (socket) {
				socket.disconnect();
			}
		};
	}, [socket]);

	useEffect(() => {
		fetchHealth();
	}, []);

	// const socketConnectStatusText = () => {
	// 	switch (socketConnectStatus) {
	// 		case SocketConnectStatus.CONNECTED:
	// 			return `Connected to port ${SOCKET_PORT}`;
	// 		case SocketConnectStatus.CONNECTING:
	// 			return 'Connecting...';
	// 		case SocketConnectStatus.DISCONNECTED:
	// 			return 'Connect to Socket.IO';
	// 	}
	// };

	console.log(socket);

	return (
		<>
			<div className="bg-red-300">
				<h1>Debug</h1>
				{JSON.stringify(bots)}
			</div>
			<div className="flex items-center justify-center flex-col h-screen bg-gray-100">
				<div className="mb-5 text-4xl font-bold text-center">
					Mineflayer Web (Commercial)
				</div>

				<hr className="my-6 w-[50%]" />

				<div className="flex flex-col items-center">
					<h3>BE Status:</h3>
					<p className="text-lg font-bold">
						{BEStatus ? BEStatus : 'Not Connected'}
					</p>
				</div>

				<hr className="my-6 w-[50%]" />
				{!bots.length && (
					<InitialConnectCard
						gameServerIp={gameServerIp}
						setGameServerIp={setGameServerIp}
						botUsername={botUsername}
						setBotUsername={setBotUsername}
						socketConnectStatus={socketConnectStatus}
						connectSocket={connectSocket}
					/>
				)}

				<div className="flex flex-row gap-5 justify-center flex-wrap">
					{bots.map((bot) => (
						<BotCard
							key={bot.botId}
							botName={bot.botName}
							botStatus={bot.botStatus}
							botId={bot.botId}
							health={bot.health}
							food={bot.food}
							addBot={() => {}}
							removeBot={() => {
								socket?.emit('removeBot', bot.botId);
								console.log('Removed bot', bot.botId);
							}}
						/>
					))}
					{bots.length ? (
						<BotCard
							botName="__create__"
							botStatus=""
							botId=""
							health={0}
							food={0}
							addBot={(botUsername) => {
								socket?.emit('addBot', botUsername);
							}}
							removeBot={() => {}}
						/>
					) : null}
				</div>
			</div>
			<div className="flex flex-col items-center justify-center text-sm text-gray-500">
				<h3 className="text-center text-sm">Attribution</h3>
				<a
					href="https://www.flaticon.com/free-icons/minecraft"
					title="minecraft icons"
				>
					Minecraft icons created by pocike - Flaticon
				</a>
			</div>
		</>
	);
}

export default App;
