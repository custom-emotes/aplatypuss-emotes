'use strict';
(() => {
	function main_init() {
		class Aplatypuss extends FrankerFaceZ.utilities.addon.Addon {
			HOST_URL = "https://aplatypuss-emotes.pages.dev/";
			ASSETS_URL = this.HOST_URL + "static/";
			CHANNEL_ID = 39464264;
			ADDON_ID = 'addon--aplatypuss';
			ADDON_EMOTES_ID = 'addon--aplatypuss--emotes';
			ADDON_BADGES_ID = 'addon--aplatypuss--badges';
			BADGES_SETTINGS_CHECK = 'aplatypuss.enable_badges';
			EMOTICONS_SETTINGS_CHECK = 'aplatypuss.enable_emoticons';
			BADGE_PREFIX = 'aplatypuss-badge-';
			ADDON_NAME = 'APlatypuss';
			BADGE_URL = 'https://aplatypuss-emotes.pages.dev';
		
			constructor(...args) {
				super(...args);
		
				this.inject('settings');
				this.inject('chat');
				this.inject('chat.badges');
				this.inject('chat.emotes');
				this.inject('i18n');
		
				this.badgesLength = 0;
		
				this.settings.add(this.BADGES_SETTINGS_CHECK, {
					default: true,
					ui: {
						path: `Add-Ons > ${this.ADDON_NAME} >> Badges`,
						title: 'Enable Badges',
						description: 'Enable to show custom badges',
						component: 'setting-check-box',
					},
					changed: () => this.updateAllChannels()
				});
		
				this.settings.add(this.EMOTICONS_SETTINGS_CHECK, {
					default: true,
		
					ui: {
						path: `Add-Ons > ${this.ADDON_NAME} >> Emotes`,
						title: 'Show Emotes',
						description: 'Enable to show custom emotes.',
						component: 'setting-check-box',
					},
					changed: () => this.updateAllChannels()
				});

				this.onEnable();
			}
		
			onEnable() {
				this.log.debug(`${this.ADDON_NAME} module was enabled successfully.`);
		
				this.on('chat:room-add', this.roomChange);
				this.on('chat:room-remove', this.roomChange);
				this.on('chat:room-update-login', this.roomChange);
				this.updateAllChannels();
			}

			roomChange(room) {
				this.updateChannel(room);
			}

			updateChannel(room) {
				if (room._id != this.CHANNEL_ID) {
					this.unloadEmotes();
					this.disableBadges();
				}
				else {
					this.updateChannelEmotes(room);
					//this.updateBadges();
				}
			}
		
			updateAllChannels() {
				for (const room of this.chat.iterateRooms()) {
					if (room) this.updateChannel(room);
				}
			}
		
			async updateBadges(attempts = 0) {
				this.disableBadges();
				if (!this.settings.get(this.BADGES_SETTINGS_CHECK)) {
					return;
				}
				const response = await fetch(this.HOST_URL + 'badges.json');
				if (response.ok) {
					const badgeData = await response.json();
					this.badgesLength = badgeData.length;
		
					for (let i = 0; i < this.badgesLength; i++) {
						const badge = badgeData[i];
						const badgeId = `${this.BADGE_PREFIX}${i}`;
						this.badges.loadBadgeData(badgeId, {
							id: `${this.BADGE_PREFIX}${i}`,
							addon: this.ADDON_ID,
							title: badge.tooltip,
							slot: 420 + i,
							image: this.ASSETS_URL + badge.image1,
							urls: {
								1: this.ASSETS_URL + badge.image1,
								2: this.ASSETS_URL + badge.image2,
								4: this.ASSETS_URL + badge.image3,
							},
							click_url: this.BADGE_URL
		
						});
						this.badges.setBulk(this.ADDON_BADGES_ID, badgeId, badge.users);
		
					}
					this.badges.buildBadgeCSS();
					this.emit('chat:update-lines');
		
				} else {
					if (response.status === 404) return;
		
					const newAttempts = (attempts || 0) + 1;
					if (newAttempts < 12) {
						this.log.error(`Failed to fetch ${this.ADDON_NAME} badges. Trying again in 5 seconds.`);
						setTimeout(this.updateBadges.bind(this, newAttempts), 5000);
					}
				}
		
			}
		
			async updateChannelEmotes(room, attempts = 0) {
				room.removeSet(this.ADDON_ID, this.ADDON_EMOTES_ID);
		
				if (!this.chat.context.get(this.EMOTICONS_SETTINGS_CHECK)) {
					return;
				}
		
				const response = await fetch(this.HOST_URL + 'emotes.json');
				if (response.ok) {
					const emotesData = [];
		
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
							modifier_offset: dataEmote.modifier,
						};
		
						emote.urls = {
							1: this.ASSETS_URL + `${dataEmote.id}` + "_1X.webp",
							2: this.ASSETS_URL + `${dataEmote.id}` + "_2X.webp",
							4: this.ASSETS_URL + `${dataEmote.id}` + "_3X.webp",
						};
		
		
						emotesData.push(emote);
					}
		
		
					let setEmotes = [];
					setEmotes = setEmotes.concat(emotesData);
		
					let set = {
						emoticons: setEmotes,
						title: 'Channel Emotes',
						source: `${this.ADDON_NAME}`,
						icon: this.ASSETS_URL + 'icon.png',
					};
					room.addSet(this.ADDON_ID, this.ADDON_EMOTES_ID, set);
		
				} else {
					if (response.status === 404) return;
		
					const newAttempts = (attempts || 0) + 1;
					if (newAttempts < 12) {
						this.log.error(`Failed to fetch ${this.ADDON_NAME} emotes. Trying again in 5 seconds.`);
						setTimeout(this.updateChannelEmotes.bind(this, room, newAttempts), 5000);
					}
				}
			}
		
			disableBadges() {
				for (let i = 0; i < this.badgesLength; i++) {
					this.badges.deleteBulk(this.ADDON_BADGES_ID, `${this.BADGE_PREFIX}${i}`);
				}
				this.badges.buildBadgeCSS();
				this.emit('chat:update-lines');
			}
		
			unloadEmotes() {
				this.emotes.unloadSet(this.ADDON_ID, this.ADDON_EMOTES_ID);
			}
		
			// loadEmotes() {
			// 	this.emotes.loadSet(this.ADDON_ID, this.ADDON_EMOTES_ID);
			// }
		
			getIdFromIndex(index) {
				return;
			}
		}
		
		Aplatypuss.register();
	}
	function checkExistance(attempts) {
		if (window.FrankerFaceZ) {
			main_init();
		} else {
			const newAttempts = (attempts || 0) + 1;
			if (newAttempts < 600)
				return setTimeout(checkExistance.bind(this, newAttempts), 100);
			console.warn(`Could not find FFZ.`);
		}
	}


	if (/^(?:player|im|chatdepot|tmi|api|spade|api-akamai|dev|)\./.test(window.location.hostname)) return;
	setTimeout(checkExistance.bind(this), 100);
})();