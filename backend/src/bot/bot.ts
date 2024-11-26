import mineflayer from 'mineflayer';
import pkg from 'mineflayer-pathfinder';
import { Vec3 } from 'vec3';
const { pathfinder, Movements, goals } = pkg;
const { GoalNear, GoalFollow } = goals;

const BOT_USERNAMES = [
	'Alice',
	'Bob',
	'Charlie',
	'Dave',
	'Eve',
	'Frank',
	'Grace',
	'Hank',
	'Ivy',
	'Jack',
	'Kyle',
	'Liam',
	'Mia',
	'Noah',
	'Olivia',
	'Pam',
	'Quinn',
];

export class BotController {
	socketId: string;
	botInstance: mineflayer.Bot | null;
	botName: string;

	constructor(socketId: string, botName: string, gameServerIp: string) {
		this.socketId = socketId;
		this.botName = botName;

		const newBot = mineflayer.createBot({
			host: gameServerIp, // minecraft server ip
			auth: 'offline', // for offline mode servers, you can set this to 'offline'
			// auth: 'microsoft', // for offline mode servers, you can set this to 'offline'
			username:
				botName ||
				BOT_USERNAMES[Math.floor(Math.random() * BOT_USERNAMES.length)],
			// username: process.env.BOT_USERNAME || 'Bot',
			// password: process.env.BOT_PASSWORD || '',
		});

		newBot.loadPlugin(pathfinder);
		// newBot.loadPlugin(pvp);
		// newBot.loadPlugin(autoeat);
		// newBot.loadPlugin(armorManager);

		this.botInstance = newBot;

		// // Getters
		// public getSocketId(): string {
		// 	return this.socketId;
		// }

		// public getInstance(): mineflayer.Bot | null {
		// 	return this.botInstance;
		// }

		// public getName(): string {
		// 	return this.botName;
		// }

		// // Setters
		// public setInstance(bot: mineflayer.Bot | null): void {
		// 	this.botInstance = bot;
		// }
	}

	public loginHandler(): void {
		if (!this.botInstance) return;

		const bot = this.botInstance;
		console.log(`${this.botName} logged in`);
		// bot.chat('Hello, I am a bot!');
	}

	public spawnHandler(): void {
		if (!this.botInstance) return;

		const bot = this.botInstance;
		console.log(`${this.botName} spawned`);
		bot.chat('Hello, I am a bot!!!!');
	}

	public chatHandler(username: string, message: string): void {
		if (!this.botInstance) {
			throw new Error(
				`Bot instance not found in chatHandler. params: ${username}, ${message}`
			).stack;
		}

		const bot = this.botInstance;
		if (username === bot.username || BOT_USERNAMES.includes(username)) return;

		console.log(`${this.botName} chat: ${username}: ${message}`);
		bot.chat(`${username} said ${message}`);
		this.humanRequestHandler(username, message);
	}

	public physicTickHandler(): void {
		if (!this.botInstance) return;

		// const bot = this.botInstance;
		// console.log(`${this.botName} physic tick`);

		this.lookAtNearestEntity();
		// console.log(`bot ${bot.username} is looking at ${bot.entity.position}`);
	}

	private lookAtNearestEntity(): void {
		if (!this.botInstance) {
			throw new Error('Bot instance not found in lookAtNearestEntity').stack;
		}
		const bot = this.botInstance;
		const livingEntity = bot.nearestEntity((entity) => {
			return entity.type === 'player' || entity.type === 'mob';
		});

		if (!livingEntity) return;
		// console.log('livingEntity', livingEntity);
		const pos = livingEntity.position.offset(0, livingEntity.height, 0);
		bot.lookAt(pos);
	}

	public humanRequestHandler(username: string, message: string): void {
		const bot = this.botInstance;
		if (!bot) {
			throw new Error(
				`Bot instance not found in humanRequestHandler. params: ${username}, ${message}`
			).stack;
		}
		const formattedMessage = message.toLowerCase();
		if (
			formattedMessage.includes(`${bot.username.toLowerCase()} follow`) ||
			formattedMessage.includes(`${bot.username.toLowerCase()} come`)
		) {
			this.followPlayer(username);
		}
		if (formattedMessage.includes(`${bot.username.toLowerCase()} stop`)) {
			this.stopFollowingPlayer();
		}
	}

	private followPlayer(username: string) {
		if (!this.botInstance) {
			throw new Error(
				`Bot instance not found in followPlayer. params: ${username}`
			).stack;
		}
		const bot = this.botInstance;
		const playerEntity = bot.players[username]?.entity;
		if (!playerEntity) {
			bot.chat("I don't see you !");
			bot.pathfinder.stop();
			return;
		}
		bot.chat(`Coming, ${username} !`);
		const goal = new GoalFollow(playerEntity, 3);
		bot.pathfinder.setGoal(goal, true);
		console.log('playerEntity', playerEntity);
	}

	private stopFollowingPlayer() {
		if (!this.botInstance) {
			throw new Error('Bot instance not found in stopFollowingPlayer');
		}
		this.botInstance.pathfinder.stop();
	}
}
// export function createBot(
// 	config: {
// 		gameServerIp: string;
// 		botUsername: string;
// 	} = { gameServerIp: '', botUsername: '' }
// ) {
// 	const newBot = mineflayer.createBot({
// 		host: config.gameServerIp, // minecraft server ip
// 		auth: 'offline', // for offline mode servers, you can set this to 'offline'
// 		// auth: 'microsoft', // for offline mode servers, you can set this to 'offline'
// 		username:
// 			config.botUsername ||
// 			BOT_USERNAMES[Math.floor(Math.random() * BOT_USERNAMES.length)],
// 		// username: process.env.BOT_USERNAME || 'Bot',
// 		// password: process.env.BOT_PASSWORD || '',
// 	});

// 	newBot.loadPlugin(pathfinder);
// 	// newBot.loadPlugin(pvp);
// 	// newBot.loadPlugin(autoeat);
// 	// newBot.loadPlugin(armorManager);

// 	return newBot;
// }

export class BotsManager {
	bots: BotController[] = [];

	constructor() {}

	addBot({
		gameServerIp,
		botUsername,
		socketId,
	}: {
		gameServerIp: string;
		botUsername: string;
		socketId: string;
	}): BotController {
		const newBot = new BotController(socketId, botUsername, gameServerIp);
		this.bots.push(newBot);
		return newBot;
	}

	removeBot(socketId: string): void {
		const botToRemove = this.bots.find((bot) => bot.socketId === socketId);
		if (botToRemove) {
			botToRemove.botInstance?.end();
			this.bots = this.bots.filter((bot) => bot.socketId !== socketId);
		}
	}
}

// export function botLoginHandler(bot: mineflayer.Bot) {
// 	talk(bot, `Hello, I am ${bot.username}, I'm a bot!`);
// }

// export function botSpawnHandler(bot: mineflayer.Bot) {
// 	return;
// }

// export function botChatHandler(
// 	bot: mineflayer.Bot,
// 	username: string,
// 	message: string
// ) {
// 	console.log(`Chat received: ${username}: ${message}`);
// 	if (username === bot.username && BOT_USERNAMES.includes(username)) return;

// 	humanPlayerRequestHandler(bot, username, message);
// }

// function talk(bot: mineflayer.Bot, message: string) {
// 	bot.chat(message);
// }

// function followPlayer(bot: mineflayer.Bot, username: string) {
// 	const playerEntity = bot.players[username]?.entity;
// 	if (!playerEntity) {
// 		talk(bot, "I don't see you !");
// 		bot.pathfinder.stop();
// 		return;
// 	}
// 	talk(bot, `Coming, ${username} !`);
// 	const goal = new GoalFollow(playerEntity, 3);
// 	bot.pathfinder.setGoal(goal, true);
// 	console.log('playerEntity', playerEntity);
// }

// function stopFollowingPlayer(bot: mineflayer.Bot) {
// 	bot.pathfinder.stop();
// }

// function lookAtNearestEntity(bot: mineflayer.Bot) {
// 	const livingEntity = bot.nearestEntity((entity) => {
// 		return entity.type === 'player' || entity.type === 'mob';
// 	});

// 	if (!livingEntity) return;
// 	// console.log('livingEntity', livingEntity);
// 	const pos = livingEntity.position.offset(0, livingEntity.height, 0);
// 	bot.lookAt(pos);
// }

// export function botPhysicTickHandler(bot: mineflayer.Bot) {
// 	lookAtNearestEntity(bot);
// }

// function humanPlayerRequestHandler(
// 	bot: mineflayer.Bot,
// 	username: string,
// 	message: string
// ) {
// 	const formattedMessage = message.toLowerCase();
// 	if (
// 		formattedMessage.includes(`${bot.username.toLowerCase()} follow`) ||
// 		formattedMessage.includes(`${bot.username.toLowerCase()} come`)
// 	) {
// 		followPlayer(bot, username);
// 	}
// 	if (formattedMessage.includes(`${bot.username.toLowerCase()} stop`)) {
// 		stopFollowingPlayer(bot);
// 	}
// }

// export function botSoundEffectHeardHandler(
// 	bot: mineflayer.Bot,
// 	soundName: string,
// 	position: { x: number; y: number; z: number },
// 	volume: number,
// 	pitch: number
// ) {
// 	console.log('soundEffectHeard', soundName, position, volume, pitch);
// 	bot.chat(
// 		`I heard a ${soundName} coming from ${position.x}, ${position.y}, ${position.z}. volume: ${volume}, pitch: ${pitch}`
// 	);
// }

// export function botHardcodedSoundEffectHeardHandler(
// 	bot: mineflayer.Bot,
// 	soundId: number,
// 	soundCategory: number,
// 	position: { x: number; y: number; z: number },
// 	volume: number,
// 	pitch: number
// ) {
// 	console.log(
// 		'hardcodedSoundEffectHeard',
// 		soundId,
// 		soundCategory,
// 		position,
// 		volume,
// 		pitch
// 	);
// 	bot.chat(
// 		`I heard a hardcoded sound effect: ${soundId}, ${soundCategory}, ${position.x}, ${position.y}, ${position.z}. volume: ${volume}, pitch: ${pitch}`
// 	);
// }
