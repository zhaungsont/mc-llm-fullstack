import express from 'express';
import { Request, Response } from 'express';
import cors from 'cors';
import 'dotenv/config';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mineflayer from 'mineflayer';
import { BotController, BotsManager } from './bot/bot';
import { v4 as uuidv4 } from 'uuid';

const SERVER_PORT = Number(process.env.SERVER_PORT) || 3000;
const SOCKET_PORT = 3001;
const CLIENT_ORIGIN = `https://mcbot.zhsont.cc/`;

const app = express();

// Middleware
app.use(
	cors({
		origin: '*', // allow requests from any origin
		methods: ['GET', 'POST'], // only allow certain HTTP methods
		credentials: true, // allow cookies and authentication headers
	})
);
app.use(express.json());

// Basic GET endpoint
app.get('/health', (req: Request, res: Response) => {
	res.json({ status: 'healthy' });
});

app.listen(SERVER_PORT, '0.0.0.0', () => {
	console.log(`HTTP Server running at http://localhost:${SERVER_PORT}`);
});

const httpServer = createServer(app);

function getBotsUpdatePayload() {
	return BotsManager.bots.map((bot) => ({
		botId: bot.botId,
		botName: bot.botName,
		botStatus: bot.botStatus,
		health: bot.health,
		food: bot.food,
		isConnected: bot.isConnected,
	}));
}

// Create a Socket.IO server instance for each port
const io = new Server(httpServer, {
	cors: {
		origin: '*',
		methods: ['GET', 'POST'],
		credentials: true,
	},
});

// Socket.IO connection handling
io.on('connection', (socket) => {
	const { gameServerIp, botUsername } = socket.handshake.query;
	console.log(`A user connected on port ${SOCKET_PORT}:`, socket.id);

	function addBot(botUsername: string) {
		return BotsManager.addBot({
			gameServerIp: gameServerIp as string,
			botUsername: botUsername as string,
			botId: uuidv4(),
		});
	}

	const firstBot = addBot(botUsername as string);
	console.log('First bot added');

	registerEventListeners(firstBot);

	console.log('First bot registered event listeners');

	socket.emit('botsUpdate', getBotsUpdatePayload());
	console.log('Initial Bot array emitted');

	// Handle disconnection
	socket.on('disconnect', () => {
		// this means the user has disconnected from the socket; all bots should be removed
		console.log(`A user disconnected from port ${SOCKET_PORT}:`, socket.id);
		BotsManager.removeAllBots();
	});

	socket.on('addBot', (botUsername: string) => {
		const subsequentBot = addBot(botUsername);
		if (subsequentBot.botInstance) {
			registerEventListeners(subsequentBot);
		}
		socket.emit('botsUpdate', getBotsUpdatePayload());
	});

	socket.on('removeBot', (botId: string) => {
		console.log('Removing bot', botId);
		BotsManager.removeBot(botId);
		socket.emit('botsUpdate', getBotsUpdatePayload());
	});

	// register event listeners
	function registerEventListeners(bot: BotController) {
		const botInstance = bot.botInstance;

		if (!botInstance) {
			throw new Error('Bot instance not found in registerEventListeners').stack;
		}

		botInstance.on('login', () => {
			bot.isConnected = true;
			bot.botStatus = 'login';
			socket.emit('botsUpdate', getBotsUpdatePayload());

			bot.loginHandler();
		});

		botInstance.once('spawn', async () => {
			bot.isConnected = true;
			bot.botStatus = 'spawn';
			socket.emit('botsUpdate', getBotsUpdatePayload());
			bot.initialSpawnHandler();
		});

		botInstance.on('spawn', () => {
			bot.isConnected = true;
			bot.botStatus = 'spawn';
			socket.emit('botsUpdate', getBotsUpdatePayload());
			bot.spawnHandler();
		});
		botInstance.on('end', (reason: string) => {
			bot.isConnected = false;
			bot.botStatus = `end`;
			socket.emit('botsUpdate', getBotsUpdatePayload());
			console.log(
				`${bot.botName} ended, Reason: ${reason}. botId: ${bot.botId}`
			);
			// socket.disconnect();
			BotsManager.removeBot(bot.botId);
		});

		botInstance.on('chat', (username: string, message: string) => {
			bot.chatHandler(username, message);
		});

		botInstance.on('physicTick', () => {
			bot.physicTickHandler();
		});

		botInstance.on('health', () => {
			// Fires when your hp or food change.
			bot.healthAndFoodChangeHandler();
			socket.emit('botsUpdate', getBotsUpdatePayload());
			// socket.emit('botsUpdate', botsManager.bots);
		});

		botInstance.on(
			'hardcodedSoundEffectHeard',
			(soundId, soundCategory, position, volume, pitch) => {
				bot.botHardcodedSoundEffectHeardHandler(
					soundId,
					soundCategory,
					position,
					volume,
					pitch
				);
				// botInstance.chat('Sound effect heard: ' + soundId);
			}
		);

		botInstance.on('chestLidMove', (block, isOpen, block2) => {
			bot.chestLidMoveHandler(block, isOpen, block2);
		});

		botInstance.on('rain', () => {
			bot.rainHandler();
		});

		botInstance.on('time', () => {
			bot.timeChangeHandler();
		});

		// bot.on(
		// 	'hardcodedSoundEffectHeard',
		// 	(soundId, soundCategory, position, volume, pitch) => {
		// 		botHardcodedSoundEffectHeardHandler(
		// 			bot,
		// 			soundId,
		// 			soundCategory,
		// 			position,
		// 			volume,
		// 			pitch
		// 		);
		// 	}
		// );
	}
});

// Start the HTTP server for each port
httpServer.listen(SOCKET_PORT, '0.0.0.0', () => {
	console.log(`Socket.IO Server running at ${SOCKET_PORT}`);
});

setInterval(() => {
	console.log('-------');
	if (BotsManager.bots.length > 0) {
		console.log('Current bots:');
		BotsManager.bots.forEach((bot) => {
			console.log(`Socket ID: ${bot.botId}, Bot name: ${bot.botName}`);
		});
	} else {
		console.log('No bots');
	}
}, 1000);

// type SocketServer = {
// 	instance: Server | null;
// 	port: number;
// 	isInUse: boolean;
// 	botInstance: mineflayer.Bot | null;
// };
