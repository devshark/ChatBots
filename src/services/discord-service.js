import weatherService from '@/services/weather-service'
import Vue from 'vue'

const Discord = require('discord.js')

export default {
  token: process.env.DISCORD_TOKEN,
  bot: null,
  init: function () {
    return new Promise((resolve, reject) => {
      try {
        this.onReady()
          .then(() => {
            this.listen()
            resolve()
          })
          .catch(reject)
        this.login()
      } catch (err) {
        reject(err)
      }
    })
  },

  login: function () {
    if (this.bot === null) throw new Error('Bot not yet ready!')
    try {
      this.bot.login(this.token)
    } catch (ex) {
      throw ex
    }
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
    const logger = Vue.$log
    this.bot.on('message', message => {
      console.log(message)
      if (message.content.startsWith('!')) {
        let parts = message.content.split(' ').map(a => a.trim()) // make sure all arguments have no leading and trailing spaces
        switch (parts[0]) {
          case '!weather': {
            if (parts[1] !== undefined) {
              parts.shift()
              let cityName = parts.join(' ')
              weatherService.getByCity(cityName)
                .then(data => {
                  logger.debug(data)
                  message.reply(data)
                })
                .catch(err => {
                  logger.debug(err)
                  if (err.message !== undefined) {
                    message.reply('City not found.')
                  } else {
                    logger.error(err)
                  }
                })
            } else {
              message.reply('City is required!')
            }
            break
          }
        }
      }
    })
  }
}
