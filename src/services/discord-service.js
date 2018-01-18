const Discord = require('discord.js')

export default {
  token: process.env.DISCORD_TOKEN,
  bot: null,
  init: function () {
    console.log('init')
    this.onReady()
      .then(() => {
        this.listen()
      })

    this.login()
  },

  login: function () {
    if (this.bot === null) throw new Error('Bot not yet ready!')
    this.bot.login(this.token)
  },

  onReady: function () {
    this.bot = new Discord.Client()
    return new Promise((resolve) => {
      this.bot.on('ready', () => {
        resolve()
      })
    })
  },

  listen: function () {
    console.log('listen')
    this.bot.on('message', message => {
      console.log(message)
      if (message.content.startsWith('!')) {
        let parts = message.content.split(' ').map(a => a.trim()) // make sure all arguments have no leading and trailing spaces
        switch (parts[0]) {
          case '!weather': {
            message.reply('cold')
            break
          }
        }
      }
    })
  }
}
