import weatherService from '@/services/weather-service'
import fxService from '@/services/fx-rates-service'
import Vue from 'vue'

const Discord = require('discord.js')
const showdown = require('showdown') // for parsing Markdown doc format

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
      if (message.author === this.bot.user) return
      Vue.$log.debug(message)
      if (message.content.startsWith('!')) {
        let parts = message.content.split(' ').map(a => a.trim()) // make sure all arguments have no leading and trailing spaces
        switch (parts[0]) {
          case '!weather': {
            if (parts.length === 2) {
              parts.shift()
              let cityName = parts.join(' ')
              weatherService.getByCity(cityName)
                .then(data => {
                  logger.debug(data)
                  message.reply(data)
                })
                .catch(err => {
                  logger.debug(err)
                  if (typeof err.message !== 'undefined') {
                    message.reply('City not found.')
                  } else {
                    logger.error(err)
                    message.reply(err.toString())
                  }
                })
            } else {
              message.reply('City is required!')
            }
            break
          }
          case '!fx': {
            let result
            if (parts.length === 1) {
              // no arguments. just show the latest FX rates
              result = fxService.getLatest()
            } else if (parts.length === 2) {
              if (parts[1].length === 3) {
                // if first argument has only 3 letters, it's probably a currency code
                result = fxService.getSpecificTarget(parts[1])
              } else if (parts[1].indexOf(',') >= 3) {
                // we support comma-separated currencies for multiple rates
                result = fxService.getSpecificTarget(parts[1])
              } else {
                // if not, try to pass a request as a date
                result = fxService.getByDate(parts[1])
              }
            } else if (parts.length === 3) {
              // if there are 2 arguments
              if (parts[1].length === 3) {
                // check if first argument is a currency code
                result = fxService.getSpecific(parts[1], parts[2])
              } else {
                // else, pass as a date
                result = fxService.getSpecificDateRates(parts[1], parts[2])
              }
            } else if (parts.length === 4) {
              // pass the data accordingly
              result = fxService.getSpecificDateRate(parts[1], parts[2], parts[3])
            }
            if (result !== null && typeof result !== 'undefined') {
              result
                .then(data => {
                  logger.debug(data)
                  message.reply(data)
                })
                .catch(err => {
                  logger.error(err)
                  message.reply(err.toString())
                })
            } else {
              message.reply('Unsupported number of arguments.')
            }
            break
          }
        }
      }
    })
  },

  getCommands: function () {
    const converter = new showdown.Converter()
    let weatherMarkdown = weatherService.getCommands()
    let fxMarkdown = fxService.getCommands()
    return converter.makeHtml(weatherMarkdown + fxMarkdown)
  }
}
