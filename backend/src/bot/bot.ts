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
	botId: string;
	botInstance: mineflayer.Bot | null;
	botName: string;
	botStatus: string;
	health: number;
	food: number;
	isConnected: boolean;

	constructor(botId: string, botName: string, gameServerIp: string) {
		this.botId = botId;
		this.botName = botName;
		this.health = 0;
		this.food = 0;
		this.botStatus = 'initializing';
		this.isConnected = false;
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
		console.log(`${this.botName} chat: ${username}: ${message}`);
		bot.chat(`${username} said ${message}`);
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
		bot.lookAt(pos);
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
		const bot = this.botInstance;
		bot.pathfinder.stop();
		bot.chat('I stopped following you!');
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
