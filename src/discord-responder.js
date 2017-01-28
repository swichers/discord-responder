'use strict';
/**
 * @file Discord self-bot autoresponder.
 */

/**
 * Responder configuration
 *
 * @typedef {Object} Configuration
 * @property {String} config.listenUser The user to respond to.
 * @property {String} config.token The Discord token to log in with.
 * @property {?Number} config.flood A length of time to wait between sending messages.
 * @property {Number} config.delay How long to wait before responding to a message.
 */

/**
 * Discord phrases
 *
 * @typedef {Object[]} Phrases
 * @property {String} phrases.regex The regex to match incoming messages against.
 * @property {Callback} phrases.handler The handler to call when a match is found.
 */

const Discord = require('discord.js');

 /**
 * An array of Discord events to not bother processing.
 *
 * @type {Array}
 */
const disabledEvents = [
  'GUILD_SYNC',
  'GUILD_CREATE',
  'GUILD_DELETE',
  'GUILD_UPDATE',
  'GUILD_MEMBER_ADD',
  'GUILD_MEMBER_REMOVE',
  'GUILD_MEMBER_UPDATE',
  'GUILD_MEMBERS_CHUNK',
  'GUILD_ROLE_CREATE',
  'GUILD_ROLE_DELETE',
  'GUILD_ROLE_UPDATE',
  'GUILD_BAN_ADD',
  'GUILD_BAN_REMOVE',
  'CHANNEL_CREATE',
  'CHANNEL_DELETE',
  'CHANNEL_UPDATE',
  'CHANNEL_PINS_UPDATE',
  'MESSAGE_DELETE',
  'MESSAGE_DELETE_BULK',
  'MESSAGE_REACTION_ADD',
  'MESSAGE_REACTION_REMOVE',
  'MESSAGE_REACTION_REMOVE_ALL',
  'USER_UPDATE',
  'USER_NOTE_UPDATE',
  'PRESENCE_UPDATE',
  'VOICE_STATE_UPDATE',
  'TYPING_START',
  'VOICE_SERVER_UPDATE',
  'RELATIONSHIP_ADD',
  'RELATIONSHIP_REMOVE'
];

/**
 * Constructor.
 *
 * @param {Configuration} config Configuration for the responder.
 * @param {Phrases} phrases The phrases to handle.
 */
var DiscordResponder = function(config, phrases) {
  this.config = config;
  this.phrases = phrases;
  this.last_sent = Date.now();

  this.bot = new Discord.Client({disabledEvents: disabledEvents});
  this.bot.on('ready', this.onReady.bind(this));
  this.bot.on('message', this.onMessage.bind(this));
};

/**
 * Starts the autoresponder.
 */
DiscordResponder.prototype.run = function () {

  this.bot.login(this.config.token);
};

/**
 * Handle ready event from Discord.
 */
DiscordResponder.prototype.onReady = function () {

  console.log(`Discord Responder ready and waiting for ${this.config.listenUser}.`);
};

/**
 * Respond to a message.
 *
 * @param {object} message Represents a message on Discord.
 *
 * @see https://discord.js.org/#/docs/main/stable/class/Message
 */
DiscordResponder.prototype.onMessage = function (message) {

  // Ignore messages not from the configured username.
  if (!this.isAllowedUser(message.author.username)) {

    return;
  }

  console.log(`Message from ${this.config.listenUser}: ${message.content}`);

  // Find a matching phrase.
  let matching = this.getMatchingPhrase(message);
  if (matching) {

    console.log(`"${message.content}" matches "${matching.regex}".`);

    // Only send messages if we're outside our flood timer.
    if (this.hasFloodTimeElapsed()) {

      setTimeout(function () {

        matching.handler(message, matching.match, this);
        this.last_sent = Date.now();
      }, this.config.delay);
    }
    else {

      console.warn('Not processing anything because it has been too soon.');
    }
  }
};

/**
 * Find matching a matching phrase for the given message.
 *
 * @param {object} message Represents a message on Discord.
 *
 * @return {?object} An object containing the matching regex, the regex match,
 *   and the callback to execute.
 *
 * @see https://discord.js.org/#/docs/main/stable/class/Message
 */
DiscordResponder.prototype.getMatchingPhrase = function (message) {

  var result = null;

  for (let key in this.phrases) {

    let item = this.phrases[key];

    item.regex.forEach(function (regex) {

      let match = message.content.match(regex);
      if (match) {

        result = {
          regex: regex,
          match: match,
          handler: item.handler
        };
      }
    });
  }

  return result;
};

/**
 * Send a message.
 *
 * @param  {String} to The user or channel to send a message to.
 * @param  {String} message The message to send.
 */
DiscordResponder.prototype.sendMessage = function (to, message) {

  this.bot.sendMessage(to, message)
    .then(message => console.log(`Sent message: ${message.content}`))
    .catch(console.error);
};

/**
 * Check if the given username is on the allowed list.
 *
 * @param {String} username The username to check.
 * @return {Boolean} Returns true if the username is allowed.
 */
DiscordResponder.prototype.isAllowedUser = function (username) {

  return username == this.config.listenUser;
};

/**
 * Check if enough time has elapsed for flood protection.
 *
 * @return {Boolean} Returns true if enough time has elapsed.
 */
DiscordResponder.prototype.hasFloodTimeElapsed = function () {

  return !this.config.flood || this.last_sent < (Date.now() - this.config.flood);
};

module.exports = DiscordResponder;
