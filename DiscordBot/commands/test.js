const { SlashCommandBuilder } = require('discord.js');
const { exec } = require('child_process');
let directory = "../root/badges.json";
const fs = require("fs");
let info = "";

// fs.writeFile(directory, info, (err) => {
// 	if (err) throw err;
// 	console.log('Data written to file');
// });

let text = Date.now().toString();
console.log(text);

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
		exec('git pull', (err, stdout, stderr) => {
			console.log("<<<" + stderr + ">>>");
			 if(stdout.includes("Already up to date.")){
				console.log(info);
				fs.readFile(directory, 'utf8', (err, data) => {
					if (err) throw err;
					info = JSON.parse(data);
					info[0].users.push(input);
					console.log(info[0].users);
					fs.writeFile(directory, JSON.stringify(info), (err) => {
						if (err) throw err;
						console.log('Data written to file');
						exec(`git add --all`, (err, stdout, stderr) => {
							console.log(err)
							exec(`git commit -m "pushing all files to git`, (err, stdout, stderr) => {
								console.log(err)
								exec(`git push`, (err, stdout, stderr) => {
									console.log(err)
								});
							});
						});
					});
				  });
			 }
		   });
		// await interaction.reply(input);
	},
};