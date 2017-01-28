/* global describe it */
'use strict';

const assert = require('chai').assert;
const DiscordResponder = require('../src/discord-responder');

describe('DiscordResponder', function() {

  let config = {
    listenUser: 'Test',
    flood: 1000
  };

  let loadedPhrases = [
    {
      regex: [
        /should match this/,
        /^And.*also.*ones?.$/
      ],
      handler: function (message, match, responder) {}
    }
  ];

  let responder = new DiscordResponder(config, loadedPhrases);

  describe('#getMatchingPhrase()', function() {

    it('should return a match when the value is present', function () {

      let result = responder.getMatchingPhrase({content: 'We should match this string.'});
      assert.isObject(result, 'Match result was object');
      assert.isDefined(result.regex, 'Regex option was set');
      assert.isArray(result.match, 'Regex match was array');
      assert.isFunction(result.handler, 'Phrase callback was set');
    });

    it('should return null when the value is not present', function() {

      let result = responder.getMatchingPhrase({content: 'But do not match this one.'});
      assert.isNull(result, 'No match found');
    });

    it('should check all matches to see if a value is present', function () {

      let result = responder.getMatchingPhrase({content: 'And we should also match this one.'});
      assert.isOk(result, 'Second match found');
    });
  });

  describe('#isAllowedUser()', function() {

    it('should return false when the user is not matching', function() {

      let match = responder.isAllowedUser('not a matching name');
      assert.isFalse(match, 'Username was not a match');
    });

    it('should return true when the user is matching', function () {

      let match = responder.isAllowedUser('Test');
      assert.isTrue(match, 'Username was a match');
    });
  });

  describe('#hasFloodTimeElapsed()', function () {

    it('should return false when not enough time has passed', function () {

      responder.last_sent = Date.now();
      assert.isFalse(responder.hasFloodTimeElapsed(), 'Not enough time passed');
    });

    it('should return true when enough time has passed', function () {

      responder.last_sent = Date.now() - 1500;
      assert.isTrue(responder.hasFloodTimeElapsed(), 'Enough time passed');
    });

    it('should return true when no flood is set', function () {

      let original = responder.config.flood;
      responder.config.flood = 0;
      assert.isTrue(responder.hasFloodTimeElapsed(), 'Flood protection disabled');

      responder.config.flood = original;
    });
  });
});
