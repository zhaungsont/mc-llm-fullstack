import mineflayer from 'mineflayer';
import pkg from 'mineflayer-pathfinder';
const { pathfinder, Movements, goals } = pkg;
import minecraftData from 'minecraft-data';
import { Vec3 } from 'vec3';
const { GoalNear, GoalFollow, GoalBlock, GoalGetToBlock } = goals;

import { Block } from 'prismarine-block';

const mcData = minecraftData('1.20.4');

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
	botId: string;
	botInstance: mineflayer.Bot | null;
	botName: string;
	botStatus: string;
	health: number;
	food: number;
	isConnected: boolean;
	chatLogConfig: {
		isLogging: boolean;
		username?: string;
		chatLog: string[];
	};
	canLookAround: boolean;

	constructor(botId: string, botName: string, gameServerIp: string) {
		this.botId = botId;
		this.botName = botName;
		this.health = 0;
		this.food = 0;
		this.botStatus = 'initializing';
		this.isConnected = false;
		this.chatLogConfig = {
			isLogging: false,
			username: undefined,
			chatLog: [],
		};
		this.canLookAround = true;
		const newBot = mineflayer.createBot({
			host: gameServerIp, // minecraft server ip
			auth: 'offline', // for offline mode servers, you can set this to 'offline'
			// auth: 'microsoft', // for offline mode servers, you can set this to 'offline'
			username:
				botName ||
				BOT_USERNAMES[Math.floor(Math.random() * BOT_USERNAMES.length)],
			version: '1.20.4',
			// username: process.env.BOT_USERNAME || 'Bot',
			// password: process.env.BOT_PASSWORD || '',
		});

		newBot.loadPlugin(pathfinder);
		// newBot.loadPlugin(pvp);
		// newBot.loadPlugin(autoeat);
		// newBot.loadPlugin(armorManager);

		this.botInstance = newBot;
	}

	public loginHandler(): void {
		if (!this.botInstance) return;

		// const bot = this.botInstance;
		// console.log(`${this.botName} logged in`);
		// bot.chat('Hello, I am a bot!');
	}

	public spawnHandler(): void {
		if (!this.botInstance) return;

		const bot = this.botInstance;
		console.log(`${this.botName} spawned`);
		const movements = new Movements(bot);
		movements.entityCost = 10;
		movements.canDig = false;
		bot.pathfinder.setMovements(movements);

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

		if (BotsManager.bots.some((bot) => bot.botName === username)) {
			// ignore messages from other bots
			return;
		}
		if (message === 'debug') {
			this.debugHandler();
			return;
		}
		// console.log(`${this.botName} chat: ${username}: ${message}`);
		// bot.chat(`${username} said ${message}`);
		this.humanRequestHandler(username, message);
	}

	public physicTickHandler(): void {
		if (!this.botInstance) return;
		this.lookAtNearestEntity();
	}

	public healthAndFoodChangeHandler(): void {
		if (!this.botInstance) {
			throw new Error('Bot instance not found in healthAndFoodChangeHandler')
				.stack;
		}
		const bot = this.botInstance;
		this.health = bot.health;
		this.food = bot.food;
		console.log('health', bot.health);
		console.log('food', bot.food);
		if (bot.health <= 6) {
			bot.chat('Warning! Low health');
		}
		if (bot.food <= 6) {
			bot.chat('Warning! Low food');
		}
	}

	public botHardcodedSoundEffectHeardHandler(
		soundId: number,
		soundCategory: number,
		position: Vec3,
		volume: number,
		pitch: number
	): void {
		// console.log(
		// 	'botHardcodedSoundEffectHeard',
		// 	soundId,
		// 	soundCategory,
		// 	position,
		// 	volume,
		// 	pitch
		// );
	}

	public chestLidMoveHandler(block: any, isOpen: number, block2: any): void {
		if (!this.botInstance) {
			throw new Error('Bot instance not found in chestLidMoveHandler').stack;
		}
		const bot = this.botInstance;
		if (!isOpen) {
			bot.chat('Chest lid closed!');
			console.log('chestLidMove', block, isOpen, block2);
		}
	}

	private debugHandler(): void {
		if (!this.botInstance) {
			throw new Error('Bot instance not found in debugHandler').stack;
		}
		const bot = this.botInstance;
		console.log('bot inventory', bot.inventory);
	}

	public rainHandler(): void {
		if (!this.botInstance) {
			throw new Error('Bot instance not found in rainHandler').stack;
		}
		const bot = this.botInstance;
		bot.chat('/weather clear');
		bot.chat('Rain cleared.');
	}

	public timeChangeHandler(): void {
		if (!this.botInstance) {
			throw new Error('Bot instance not found in timeChangeHandler').stack;
		}
		const bot = this.botInstance;
		if (!bot.time.isDay) {
			bot.chat('/time set 0');
			bot.chat('Time set to day.');
		}
	}

	private startLoggingChat(username?: string): void {
		this.chatLogConfig.isLogging = true;
		this.chatLogConfig.username = username;
	}

	private stopLoggingChat(): void {
		this.chatLogConfig.isLogging = false;
		this.chatLogConfig.username = undefined;
		this.chatLogConfig.chatLog = [];
	}

	//////////////////////
	// HIGH LEVEL TASKS //
	//////////////////////

	public async itemsOrganizerHandler(requestUsername: string): Promise<void> {
		if (!this.botInstance) {
			throw new Error('Bot instance not found in itemsOrganizerHandler').stack;
		}
		const bot = this.botInstance;
		bot.chat(`Ok ${requestUsername}! Please stand on the chest for 3 seconds.`);

		await new Promise((resolve) =>
			setTimeout(() => {
				bot.chat("Ready? I'll start counting...");
				resolve(null);
			}, 1500)
		);

		for (let i = 3; i > 0; i--) {
			bot.chat(i + '...');
			await new Promise((resolve) => setTimeout(resolve, 1000));
		}
		bot.chat('Ok!');

		const chestBlock = bot.blockAt(
			bot.players[requestUsername]?.entity.position
		);
		console.log('chestBlock', chestBlock);
		if (!chestBlock || chestBlock.name !== 'chest') {
			bot.chat("I can't see the chest !");
			return;
		}
		bot.chat(
			`Chest coordinates: ${chestBlock.position.x}, ${chestBlock.position.y}, ${chestBlock.position.z}`
		);

		console.log('goalBlock', chestBlock);
		this.canLookAround = false;

		await bot.pathfinder.goto(
			new GoalGetToBlock(
				chestBlock.position.x,
				chestBlock.position.y,
				chestBlock.position.z
			)
		);

		bot.chat('I am at the chest!');
		this.canLookAround = true;
		console.log('opening', chestBlock);
		await bot.openContainer(chestBlock);
		console.log('transferring items');
	}

	private openTheChest(): void {
		if (!this.botInstance) {
			throw new Error('Bot instance not found in openTheChest').stack;
		}
		const bot = this.botInstance;

		bot.chat('Chest opened!');
	}

	/////////////////////
	// PRIVATE METHODS //
	/////////////////////

	private lookAtNearestEntity(): void {
		if (!this.botInstance) {
			throw new Error('Bot instance not found in lookAtNearestEntity').stack;
		}
		const bot = this.botInstance;
		const livingEntity = bot.nearestEntity((entity) => {
			return entity.type === 'player' || entity.type === 'mob';
		});

		if (!livingEntity) return;
		const pos = livingEntity.position.offset(0, livingEntity.height, 0);
		if (this.canLookAround) {
			bot.lookAt(pos);
		}
	}

	private humanRequestHandler(username: string, message: string): void {
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
		if (formattedMessage.includes(`${bot.username.toLowerCase()} organize`)) {
			if (formattedMessage.includes('organize chest')) {
				this.itemsOrganizerHandler(username);
			}
		}

		if (
			this.chatLogConfig.isLogging &&
			this.chatLogConfig.username === username
		) {
			this.chatLogConfig.chatLog.push(message);
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
		this.canLookAround = false;
		const goal = new GoalFollow(playerEntity, 3);
		bot.pathfinder.setGoal(goal, true);
		console.log('playerEntity', playerEntity);
	}

	private stopFollowingPlayer() {
		if (!this.botInstance) {
			throw new Error('Bot instance not found in stopFollowingPlayer');
		}
		const bot = this.botInstance;
		bot.pathfinder.stop();
		bot.chat('I stopped following you!');
		this.canLookAround = true;
	}
}
export class BotsManager {
	static bots: BotController[] = [];

	constructor() {}

	static addBot({
		gameServerIp,
		botUsername,
		botId,
	}: {
		gameServerIp: string;
		botUsername: string;
		botId: string;
	}): BotController {
		const newBot = new BotController(botId, botUsername, gameServerIp);
		BotsManager.bots.push(newBot);
		return newBot;
	}

	static removeBot(botId: string): void {
		const botToRemove = BotsManager.bots.find((bot) => bot.botId === botId);
		if (botToRemove) {
			botToRemove.botInstance?.end();
			BotsManager.bots = BotsManager.bots.filter((bot) => bot.botId !== botId);
			console.log('Bot removed', botId);
		}
		console.log('new bots array', BotsManager.bots);
	}

	static removeAllBots(): void {
		BotsManager.bots.forEach((bot) => {
			bot.botInstance?.end();
			bot.botStatus = 'end';
			bot.isConnected = false;
		});

		BotsManager.bots = [];
	}
}

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
