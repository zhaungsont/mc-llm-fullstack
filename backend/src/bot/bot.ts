import mineflayer from 'mineflayer';
import pkg from 'mineflayer-pathfinder';
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

export function createBot() {
	const newBot = mineflayer.createBot({
		host: process.env.GAME_SERVER, // minecraft server ip
		auth: 'offline', // for offline mode servers, you can set this to 'offline'
		// auth: 'microsoft', // for offline mode servers, you can set this to 'offline'
		username: BOT_USERNAMES[Math.floor(Math.random() * BOT_USERNAMES.length)],
		// username: process.env.BOT_USERNAME || 'Bot',
		// password: process.env.BOT_PASSWORD || '',
	});

	newBot.loadPlugin(pathfinder);
	// newBot.loadPlugin(pvp);
	// newBot.loadPlugin(autoeat);
	// newBot.loadPlugin(armorManager);

	return newBot;
}

export function botLoginHandler(bot: mineflayer.Bot) {
	talk(bot, 'Hello, I am a bot !');
}

export function botSpawnHandler(bot: mineflayer.Bot) {
	return;
}

export function botChatHandler(
	bot: mineflayer.Bot,
	username: string,
	message: string
) {
	console.log(`Chat received: ${username}: ${message}`);
	if (username === bot.username && BOT_USERNAMES.includes(username)) return;

	humanPlayerRequestHandler(bot, username, message);
}

function talk(bot: mineflayer.Bot, message: string) {
	bot.chat(message);
}

function followPlayer(bot: mineflayer.Bot, username: string) {
	const playerEntity = bot.players[username]?.entity;
	if (!playerEntity) {
		talk(bot, "I don't see you !");
		return;
	}
	talk(bot, `Coming, ${username} !`);
	const goal = new GoalFollow(playerEntity, 3);
	bot.pathfinder.setGoal(goal, true);
}

function stopFollowingPlayer(bot: mineflayer.Bot) {
	bot.pathfinder.stop();
}

function lookAtNearestEntity(bot: mineflayer.Bot) {
	const livingEntity = bot.nearestEntity((entity) => {
		return entity.type === 'player' || entity.type === 'mob';
	});

	if (!livingEntity) return;

	const pos = livingEntity.position.offset(0, livingEntity.height, 0);
	bot.lookAt(pos);
}

export function botPhysicTickHandler(bot: mineflayer.Bot) {
	lookAtNearestEntity(bot);
}

function humanPlayerRequestHandler(
	bot: mineflayer.Bot,
	username: string,
	message: string
) {
	const formattedMessage = message.toLowerCase();
	if (formattedMessage.includes(`${bot.username.toLowerCase()} follow`)) {
		followPlayer(bot, username);
	}
	if (formattedMessage.includes(`${bot.username.toLowerCase()} stop`)) {
		stopFollowingPlayer(bot);
	}
}
