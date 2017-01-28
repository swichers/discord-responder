'use strict';

(function () {
  const DiscordResponder = require('discord-responder');
  const config = require('./config.json');
  const requireDir = require('require-dir');

  /**
   * An array of phrases to match against.
   *
   * @type {Phrases}
   */
  const loadedPhrases = requireDir('./phrases');

  let responder = new DiscordResponder(config, loadedPhrases);
  responder.run();
})();
