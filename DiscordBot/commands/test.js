const { SlashCommandBuilder } = require('discord.js');
const childProcess = require("child_process");
const git = childProcess.exec("git pull");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('test')
		.setDescription('TESTING')
		.addStringOption(option =>
			option.setName("input")
				.setDescription("the input to echo back")
			),
	async execute(interaction) {
		const input = interaction.options.getString("input");
		git.stdout.on("data", data =>{
			console.log(`git replied ${data}`);
		})
		console.log(git);
		await interaction.reply(input);
	},
};