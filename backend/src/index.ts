import express from 'express';
import { Request, Response } from 'express';
import cors from 'cors';
import 'dotenv/config';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mineflayer from 'mineflayer';
import {
	botLoginHandler,
	botPhysicTickHandler,
	createBot,
	botChatHandler,
	botSpawnHandler,
} from './bot/bot';

const app = express();
const SERVER_PORT = Number(process.env.SERVER_PORT) || 3000;

const SOCKET_PORTS = [3001, 3002, 3003, 3004, 3005];

const CLIENT_ORIGIN = `https://mcbot.zhsont.cc/`;

const servers: SocketServer[] = new Array(SOCKET_PORTS.length).fill({
	instance: null,
	port: -1,
	isInUse: false,
	botInstance: null,
});

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
	res.json({ message: 'OK' });
});

app.get('/quotaAvailability', (req: Request, res: Response) => {
	const availablePort = servers.find((server) => !server.isInUse);
	if (!availablePort) {
		res.json({ code: 1, data: -1 });
		return;
	}
	res.json({ code: 0, data: availablePort.port });
});

app.post('/post', (req: Request, res: Response) => {
	console.log('POST request received', req.body);
	res.json({ message: 'OK' });
});

app.listen(SERVER_PORT, '0.0.0.0', () => {
	console.log(`Server running at http://localhost:${SERVER_PORT}`);
});

type SocketServer = {
	instance: Server | null;
	port: number;
	isInUse: boolean;
	botInstance: mineflayer.Bot | null;
};

// Create multiple HTTP servers and Socket.IO instances
SOCKET_PORTS.forEach((port, index) => {
	const httpServer = createServer(app);

	// Create a Socket.IO server instance for each port
	const io = new Server(httpServer, {
		cors: {
			origin: '*',
			methods: ['GET', 'POST'],
			credentials: true,
		},
	});

	servers[index] = {
		instance: io,
		port,
		isInUse: false,
		botInstance: null,
	};

	// Socket.IO connection handling
	io.on('connection', (socket) => {
		console.log(`A user connected on port ${port}:`, socket.id);
		servers[index].isInUse = true;
		servers[index].botInstance = createBot();
		// Listening for messages from the client
		socket.on('message', (data) => {
			console.log(`Message received on port ${port}:`, data);
			// You can broadcast the message to all connected clients on the same port
			io.emit('message', data);
		});

		// Handle disconnection
		socket.on('disconnect', () => {
			console.log(`A user disconnected from port ${port}:`, socket.id);
			servers[index].isInUse = false;
			servers[index].botInstance?.end();
		});

		const bot = servers[index].botInstance;

		bot.on('login', () => {
			io.emit('botStatus', 'login');
			botLoginHandler(bot);
		});
		bot.on('spawn', () => {
			io.emit('botStatus', 'spawn');
			botSpawnHandler(bot);
		});
		bot.on('end', (reason: string) => {
			io.emit('botStatus', `end: ${reason}`);
			console.log('Bot ended,', reason);
			socket.disconnect();
		});

		bot.on('chat', (username: string, message: string) => {
			botChatHandler(bot, username, message);
		});

		bot.on('physicTick', () => {
			botPhysicTickHandler(bot);
		});
	});

	// Start the HTTP server for each port
	httpServer.listen(port, '0.0.0.0', () => {
		console.log(`Server running at ${port}`);
	});
});

setInterval(() => {
	console.log('-------');
	console.log(servers.map((server) => `${server.port}: ${server.isInUse}`));
}, 1000);
