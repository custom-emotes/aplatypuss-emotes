'use strict';
(() => {
	function main_init() {
		class Aplatypuss extends FrankerFaceZ.utilities.addon.Addon {
			HOST_URL = 'https://ffz.thetiki.club';
			ASSETS_URL = `${this.HOST_URL}/static`;
			CHANNELS_ID = [39464264, 25118940];
			ADDON_ID = 'addon--aplatypuss';
			ADDON_EMOTES_ID = 'addon--aplatypuss--emotes';
			ADDON_BADGES_ID = 'addon--aplatypuss--badges';
			BADGES_SETTINGS_CHECK = 'aplatypuss.enable_badges';
			EMOTICONS_SETTINGS_CHECK = 'aplatypuss.enable_emoticons';
			BADGE_PREFIX = 'aplatypuss-badge-';
			ADDON_NAME = 'APlatypuss';
			BADGES_START_SLOT = 420;
			DEFAULT_BADGE_URL = 'https://thetiki.club/';
			REFRESH_TIME = 30 * 1000;
	
			updateTimer = null;
		
			constructor(...args) {
				super(...args);
		
				this.inject('settings');
				this.inject('chat');
				this.inject('chat.badges');
				this.inject('chat.emotes');
		
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
		
				setTimeout(() => this.onEnable(), 0)
		
			}
		
			onEnable() {
				this.log.debug(`${this.ADDON_NAME} module was enabled successfully.`);
				this.on('chat:room-add', this.roomChange);
				this.on('chat:room-remove', this.roomChange);
				this.on('chat:room-update-login', this.roomChange);
				this.updateAllChannels();
		
				this.updateTimer = setInterval(() => {
					this.refreshData();
				}, this.REFRESH_TIME);
		
				setInterval(this.refreshData(), this.REFRESH_TIME);
			}
		
			onDisable(){
				clearInterval(this.updateTimer);
			}
			async refreshData(){
				console.log('refreshing badges')
				this.updateAllChannels(false);
				await this.updateBadges(0,false);
				console.log('refreshed badges')
		
			}
			
			roomChange(room) {
				this.updateChannel(room);
			}
		
			updateChannel(room, retry) {
				if (this.CHANNELS_ID.indexOf(room._id) == -1) {
					this.unloadEmotes();
					this.disableBadges();
				}
				else {
					this.updateChannelEmotes(room, retry);
					this.updateBadges();
				}
			}
		
			updateAllChannels(retry = true) {
				for (const room of this.chat.iterateRooms()) {
					if (room) this.updateChannel(room, retry);
				}
			}
		
			async updateChannelEmotes(room, attempts = 0, retry = true) {
				room.removeSet(this.ADDON_ID, this.ADDON_EMOTES_ID);
		
				if (!this.chat.context.get(this.EMOTICONS_SETTINGS_CHECK)) {
					return;
				}
		
				const response = await fetch(`${this.HOST_URL}/emotes.json`);
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
							1: `${this.ASSETS_URL}/${dataEmote.id}_1X.webp`,
							2: `${this.ASSETS_URL}/${dataEmote.id}_2X.webp`,
							4: `${this.ASSETS_URL}/${dataEmote.id}_3X.webp`,
						};
						emotesData.push(emote);
					}
		
		
					let emotesArray = [];
					emotesArray = emotesArray.concat(emotesData);
		
					const emoteSet = {
						emoticons: emotesArray,
						title: 'Channel Emotes',
						source: `${this.ADDON_NAME}`,
						icon: `${this.ASSETS_URL}/icon.png`,
					};
					room.addSet(this.ADDON_ID, this.ADDON_EMOTES_ID, emoteSet);
		
				} else {
					if (response.status === 404 || !retry) return;
		
					const newAttempts = (attempts || 0) + 1;
					if (newAttempts < 12) {
						this.log.error(`Failed to fetch ${this.ADDON_NAME} emotes. Trying again in 5 seconds.`);
						setTimeout(this.updateChannelEmotes.bind(this, room, newAttempts), 5000);
					}
				}
			}
		
			async updateBadges(attempts = 0,retry = true) {
				this.disableBadges();
				if (!this.settings.get(this.BADGES_SETTINGS_CHECK)) {
					return;
				}
				const baseBadgesResponse = await fetch(`${this.HOST_URL}/badgesDefinitions.json`);
				const baseUsersResponse = await fetch(`${this.HOST_URL}/badgesUsers.json`);
		
				if (baseBadgesResponse.ok && baseUsersResponse.ok) {
					const baseBadgeData = await baseBadgesResponse.json();
					const badgeKeys = Object.keys(baseBadgeData);
					this.badgesLength = badgeKeys.length;
					let badges = {};
					let badgesUsers = {};
		
					for (let i = 0; i < badgeKeys.length; i++) {
						const badge = baseBadgeData[badgeKeys[i]]
						const badgeId = `${this.BADGE_PREFIX}${badgeKeys[i].toLowerCase()}`;
						badges[badgeId] = {
							id: `${badgeId}`,
							addon: this.ADDON_ID,
							name: badgeKeys[i],
							title: badge.tooltip,
							slot: this.BADGES_START_SLOT + i,
							image: this.ASSETS_URL + badge.image1,
							urls: {
								1: `${this.ASSETS_URL}/${badge.image1}`,
								2: `${this.ASSETS_URL}/${badge.image2}`,
								4: `${this.ASSETS_URL}/${badge.image3}`,
							},
							click_url: badge.url ?? this.DEFAULT_BADGE_URL
						};
						badgesUsers[badgeId] = badge.users ?? [];
					}
					const usersData = await baseUsersResponse.json();
		
					for (let i = 0; i < usersData.length; i++) {
						const userData = usersData[i]
						for (let j = 0; j < userData.badges.length; j++) {
							const badgeId = `${this.BADGE_PREFIX}${userData.badges[j].toLowerCase()}`;
							badgesUsers[badgeId] = badgesUsers[badgeId].concat(userData.user);
						}
		
					}
					for (let i = 0; i < badgeKeys.length; i++) {
						const badgeId = `${this.BADGE_PREFIX}${badgeKeys[i].toLowerCase()}`;
						this.badges.loadBadgeData(badgeId, badges[badgeId]);
						this.badges.setBulk(this.ADDON_BADGES_ID, badgeId, badgesUsers[badgeId]);
					}
					this.badges.buildBadgeCSS();
					this.emit('chat:update-lines');
		
				}
				else {
					if (baseBadgesResponse.status === 404 || !retry) return;
		
					const newAttempts = (attempts || 0) + 1;
					if (newAttempts < 12) {
						this.log.error(`Failed to fetch ${this.ADDON_NAME} badges. Trying again in 5 seconds.`);
						setTimeout(this.updateBadges.bind(this, newAttempts), 5000);
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
		
		}
		
		Aplatypuss.register('aplatypuss-emotes');
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