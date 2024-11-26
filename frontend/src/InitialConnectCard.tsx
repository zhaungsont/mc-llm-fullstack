import React from 'react';
import { SOCKET_PORT } from './App';

enum SocketConnectStatus {
	CONNECTED = 'connected',
	DISCONNECTED = 'disconnected',
	CONNECTING = 'connecting',
}

interface InitialConnectCardProps {
	gameServerIp: string;
	setGameServerIp: (gameServerIp: string) => void;
	botUsername: string;
	setBotUsername: (botUsername: string) => void;
	socketConnectStatus: SocketConnectStatus;
	connectSocket: () => void;
}

function InitialConnectCard({
	gameServerIp,
	setGameServerIp,
	botUsername,
	setBotUsername,
	socketConnectStatus,
	connectSocket,
}: InitialConnectCardProps) {
	const socketConnectStatusText = () => {
		switch (socketConnectStatus) {
			case SocketConnectStatus.CONNECTED:
				return `Connected to port ${SOCKET_PORT}`;
			case SocketConnectStatus.CONNECTING:
				return 'Connecting...';
			case SocketConnectStatus.DISCONNECTED:
				return 'Connect to Socket.IO';
		}
	};

	return (
		<div>
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
				{/* {socketConnectStatus === SocketConnectStatus.CONNECTED && (
					<button
						onClick={() => {
							disconnectSocket();
						}}
						className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
					>
						Disconnect
					</button>
				)} */}
			</div>
		</div>
	);
}

export default InitialConnectCard;
