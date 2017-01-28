# Discord Responder

A simple Discord self-bot to automatically respond to messages as yourself.

## Requirements

 * nodejs
 * A [Discord](https://discordapp.com/) account

## Installation

`npm install`

## Configuration

Copy `config.json.example` to `config.json` in the project's root folder.

**token**: Your client token value. This can be accessed by opening the Electron inspector in Discord, going to the Application » Local Storage, and copying your token. See [Selfbot's README](https://github.com/SplitPixl/Selfbot) for more detail.

**listenUser**: The username of the bot that listens to.

**flood**: The delay between the sending of messages.

**delay**: The delay between receiving a message and responding.

## Phrases

Copy `phrase.js.example` to `something.js` within the phrases folder as needed.

**regex**: An array of one or more regular expressions to match.

**handler**: A callback that runs when a regex is matched.
