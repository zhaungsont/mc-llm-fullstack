import React, { useState } from 'react';

interface BotCardProps {
	botName: string;
	botStatus: string;
	botId: string;
	health: number;
	food: number;
	addBot: (botUsername: string) => void;
	removeBot: () => void;
}

function HealthAndFoodBar({ rate, icon }: { rate: number; icon: string }) {
	if (rate < 0) {
		rate = 0;
	}
	if (rate > 20) {
		rate = 20;
	}

	const totalBars = Math.ceil(rate / 2);
	const fullBars = Math.floor(rate / 2);
	const halfBar = totalBars > fullBars;

	return (
		<div>
			{new Array(fullBars).fill(0).map((_, i) => (
				<span key={i}>{icon}</span>
			))}
			{halfBar ? (
				<span className="relative" style={{ clipPath: 'inset(0 50% 0 0)' }}>
					{icon}
				</span>
			) : null}
			{rate === 0 ? <span>💀</span> : null}
		</div>
	);
}

function BotCard({
	botName,
	botStatus,
	botId,
	health,
	food,
	addBot,
	removeBot,
}: BotCardProps) {
	const [newBotUsername, setNewBotUsername] = useState('');

	const createMode = botName === '__create__';

	const botIsConnected = botStatus === 'spawn';

	function getBotConnectActionText() {
		switch (botStatus) {
			case 'initializing':
				return <div>Initializing...</div>;
			case 'login':
				return <div>Logging in...</div>;
			case 'spawn':
				return <div>Disconnect</div>;
			case 'end':
				return <div>Reconnect</div>;
		}
	}

	function getBotNameText() {
		if (createMode) {
			if (newBotUsername) {
				return newBotUsername;
			}
			return 'New Bot';
		}
		return botName;
	}

	return (
		<div className="border border-gray-300 rounded-md p-2 w-[250px]">
			<div className="flex flex-col items-center gap-2">
				<div className="text-lg font-bold">{getBotNameText()}</div>
				<div className="text-sm text-gray-500">
					{createMode ? 'Create a new bot' : botStatus}
				</div>
				<div className="w-32 h-32 bg-gray-200 rounded-md">
					{botStatus === 'spawn' ? (
						<img src={`/creeper-active.png`} alt={botStatus} />
					) : (
						<img src={`/creeper-inactive.png`} alt={botStatus} />
					)}
				</div>
				{createMode ? (
					<>
						<input
							type="text"
							className="w-50 border-2 border-gray-300 rounded-md p-2 text-center"
							placeholder="Enter Bot Username"
							value={newBotUsername}
							onChange={(e) => {
								setNewBotUsername(e.target.value);
							}}
							disabled={
								botStatus === 'initializing' ||
								botStatus === 'login' ||
								botStatus === 'spawn'
							}
						/>
						<button
							className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition-colors"
							onClick={() => {
								addBot(newBotUsername);
								setNewBotUsername('');
							}}
						>
							Add Bot
						</button>
					</>
				) : (
					<button
						onClick={() => {
							removeBot();
						}}
						className={`${
							botIsConnected
								? 'bg-red-500 hover:bg-red-600'
								: 'bg-blue-500 hover:bg-blue-600'
						} text-white px-4 py-2 rounded transition-colors`}
						disabled={botStatus === 'initializing' || botStatus === 'login'}
					>
						{getBotConnectActionText()}
					</button>
				)}
				{!createMode && (
					<>
						<HealthAndFoodBar rate={health} icon="❤️" />
						<HealthAndFoodBar rate={food} icon="🍖" />
					</>
				)}
			</div>
		</div>
	);
}

export default BotCard;
