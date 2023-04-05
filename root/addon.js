
class Aplatypuss extends Addon {
	constructor(...args) {
		super(...args);

		this.inject('settings');
		this.inject('chat');
		this.inject('chat.badges');
		this.inject('chat.emotes');
		this.inject('i18n');

		this.badgesLength = 0;

		this.settings.add('aplatypuss.badges', {
			default: true,
			ui: {
				path: 'Add-Ons > APlatypuss >> Badges',
				title: 'Enable Badges',
				description: 'Enable to show user badges',
				component: 'setting-check-box',
			},
			changed: () => this.updateBadges()
		});

		this.settings.add('aplatypuss.enable_emoticons', {
			default: true,

			ui: {
				path: 'Add-Ons > APlatypuss >> Emotes',
				title: 'Show Emotes',
				description: 'Enable to show APlatypuss emotes.',
				component: 'setting-check-box',
			},
			changed: () => this.updateEmotes()
		});
	}

	onEnable() {
		this.log.debug('Aplatypuss module was enabled successfully.');
		
		this.on('chat:room-add', this.roomAdd);
		this.on('chat:room-remove', this.roomRemove);

		this.updateEmotes();
		this.updateBadges();
	}

	roomAdd(room) {
		this.updateChannel(room);
	}

	roomRemove(room) {
		this.updateChannel(room);
	}

	async updateChannelEmotes(room, attempts = 0) {
		const realID = 'addon--aplatypuss--emotes';
		room.removeSet('addon--aplatypuss', realID);
		//this.emotes.unloadSet(realID);

		if (!this.chat.context.get('aplatypuss.enable_emoticons')) {
			return;
		}
		
		const BASE_URL = "https://aplatypuss-emotes.pages.dev/static/"
		const response = await fetch('https://aplatypuss-emotes.pages.dev/emotes.json');
		if (response.ok) {
			const platyEmotes = [];

			for (const dataEmote of await response.json()) {
				
				const arbitraryEmote = /[^A-Za-z0-9]/.test(dataEmote.code);
		
				const emote = {
					id: dataEmote.code,
					urls: {
						1: undefined,
					},
					name: dataEmote.code,
					width: dataEmote.width,
					height: dataEmote.width,
					require_spaces: arbitraryEmote,
					modifier: dataEmote.modifier !== undefined,
					modifier_offset:  dataEmote.modifier,
				};
		
				emote.urls = {
					1: BASE_URL + `${dataEmote.id}` + "_28.webp",
					2: BASE_URL + `${dataEmote.id}` + "_56.webp",
					4: BASE_URL + `${dataEmote.id}` + "_112.webp",
				};
		
		
				platyEmotes.push(emote);
			}
			
	
			let setEmotes = [];
			setEmotes = setEmotes.concat(platyEmotes);
	
			let set = {
				emoticons: setEmotes,
				title: 'Channel Emotes',
				source: 'Aplatypuss',
				icon: 'https://aplatypuss-emotes.pages.dev/static/icon.png',
			};
			room.addSet('addon--aplatypuss', realID, set);
		
		}else {
			if (response.status === 404) return;

			const newAttempts = (attempts || 0) + 1;
			if (newAttempts < 12) {
				this.log.error('Failed to fetch global emotes. Trying again in 5 seconds.');
				setTimeout(this.updateChannelEmotes.bind(this,room, newAttempts), 5000);
			}
		}
	}

	async updateChannel(room) {
		const realID = 'addon--aplatypuss--emotes';

		console.log(room);
		if(room._id != 39464264){ //Platy Twitch ID
			//console.log("disabling Aplatypuss emotes")
			this.emotes.unloadSet('addon--aplatypuss', realID);
		}
		else{
			//console.log("Aplatypuss emotes enabled")
			this.updateChannelEmotes(room);
			this.emotes.loadSet('addon--aplatypuss', realID);

		}

	}

	updateEmotes() {
		for (const room of this.chat.iterateRooms()) {
			if (room) this.updateChannel(room);
		}
	}

	async updateBadges() {
		this.removeBadges();
		const BASE_URL = "https://aplatypuss-emotes.pages.dev/static/"

		if (this.settings.get('aplatypuss.badges')) {
			const response = await fetch('https://aplatypuss-emotes.pages.dev/badges.json');
			const badgeData = await response.json();
			this.badgesLength = badgeData.length;

			for (let i = 0; i < this.badgesLength; i++) {
				const badge = badgeData[i];
				const badgeId = this.getIdFromIndex(i);
				this.badges.loadBadgeData(badgeId, {
					id: `aplatypuss-badge-${i}`,
					addon: 'aplatypuss',
					title: badge.tooltip,
					slot: 420,
					image: BASE_URL + badge.image1,
					urls: {
						1: BASE_URL + badge.image1,
						2: BASE_URL + badge.image2,
						4: BASE_URL + badge.image3,
					},
					click_url: 'https://aplatypuss-emotes.pages.dev'

				});
				this.badges.setBulk('aplatypuss', badgeId, badge.users);

			}
		}
		this.badges.buildBadgeCSS();
		this.emit('chat:update-lines');
	}

	removeBadges() {
		for (let i = 0; i < this.badgesLength; i++) {
			this.badges.deleteBulk('aplatypuss', this.getIdFromIndex(i));
		}

		this.badgesLength = 0;
	}

	getIdFromIndex(index) {
		return `aplatypuss-badge-${index}`;
	}
}

Aplatypuss.register();
