import axios from 'axios'
import Vue from 'vue'

const xhr = axios.create({
  baseURL: `${process.env.API_FX_RATES_ENDPOINT}`, // root API endpoint
  timeout: 10000, // 10second timeout?
  headers: {
    'Content-Type': 'UTF-8'
  } // any custom headers? key-value pair
})

const DEFAULT_CURRENCY = process.env.API_FX_RATES_DEFAULT_CURRENCY

export default {
  getLatest: function () {
    return new Promise((resolve, reject) => {
      xhr.get('/latest', {
        params: {
          base: DEFAULT_CURRENCY
        }
      })
        .then(response => {
          this.handleResponse(response, resolve, reject)
        })
        .catch(reject)
    })
  },
  getByDate: function (date) {
    return new Promise((resolve, reject) => {
      try {
        let petsa = this.checkDate(date)
        xhr.get(`/${petsa}`, {
          params: {
            base: DEFAULT_CURRENCY
          }
        })
          .then(response => {
            this.handleResponse(response, resolve, reject)
          })
      } catch (ex) {
        reject(ex)
      }
    })
  },
  getSpecific: function (baseCurrency, targetCurrency) {
    return new Promise((resolve, reject) => {
      xhr.get('/latest', {
        params: {
          base: baseCurrency,
          symbols: targetCurrency.toUpperCase()
        }
      })
        .then(response => {
          this.handleResponse(response, resolve, reject)
        })
        .catch(reject)
    })
  },
  getSpecificTarget: function (targetCurrency) {
    return this.getSpecific(DEFAULT_CURRENCY, targetCurrency)
  },
  // Format: {{date}} {{base currency}} {{target currency}}
  getSpecificDateRate: function (date, baseCurrency, targetCurrency) {
    return new Promise((resolve, reject) => {
      try {
        let petsa = this.checkDate(date)
        xhr.get(`${petsa}`, {
          params: {
            base: baseCurrency,
            symbols: targetCurrency.toUpperCase()
          }
        })
          .then(response => {
            this.handleResponse(response, resolve, reject)
          })
          .catch(reject)
      } catch (ex) {
        reject(ex)
      }
    })
  },
  // Format: {{date}} {{target currency}}
  getSpecificDateRates: function (date, targetCurrency) {
    return this.getSpecificDateRate(date, DEFAULT_CURRENCY, targetCurrency)
  },
  formatRates: function (data) {
    let keys = Object.keys(data.rates)
    Vue.$log.debug('keys', keys)
    let result = keys
      .map(currency => `1 ${data.base} = ${data.rates[currency]} ${currency}`)
      .join('\n')
    Vue.$log.debug('result', result)
    return `**here are FX rates for ${data.date}**\n${result}`
  },
  checkDate: function (date) {
    let timestamp
    try {
      Vue.$log.debug(date)
      timestamp = Date.parse(date)
    } catch (err) {
      throw new Error('Invalid date!')
    }
    let petsa = (new Date(timestamp)).toISOString().slice(0, 10) // check if it is a valid date, then date the date part only
    let today = (new Date()).toISOString().slice(0, 10) // get the current date, as a string
    if (petsa > today) { // if date is a future date
      throw new Error('Date can only be today or past dates.')
    } else if (petsa === today) {
      petsa = 'latest'
    }
    return petsa
  },
  handleResponse: function (response, resolve, reject) {
    if (response.status === 200) {
      Vue.$log.debug(response.data)
      if (response.data.rates.length === 0) {
        reject(new Error('Target currency is not supported.'))
        return
      }
      let result = this.formatRates(response.data)
      resolve(result)
    } else if (response.status === 404) {
      reject(new Error('Request was not found.'))
    } else if (response.status === 500) {
      reject(new Error('There was a problem from the FX server. Please try again later.'))
    } else if (response.status === 422) {
      reject(new Error('Base currency supplied is not supported.'))
    } else {
      Vue.$log.error(response.data)
      reject(new Error('Your request did not return an expected result.'))
    }
  },
  getCommands: function () {
    return `###FX Rates Bot
####Purpose
* To display a list of FX conversion rates against a base currency. The default base currency is US Dollar (USD).
####Command syntax
The command keyword is **!fx**.

To show the latest FX rates of all supported currencies.
\`\`\`
!fx
\`\`\`
To show the latest FX rate of the default base currency against a given currency code.
\`\`\`
!fx HKD
\`\`\`
To show the latest FX rates of the default base currency against a set currency codes. 
Provide a comma-separated list of currencies, without any white space in between.
\`\`\`
!fx EUR,GBP,HKD
\`\`\`
To show the latest FX rate of a given base currency against another currency.
The first argument should be the base currency, and the second argument should be the target currency.
\`\`\`
!fx EUR HKD
\`\`\`
You can also supply a list of target currencies.
\`\`\`
!fx EUR USD,GBP,HKD
\`\`\`
To show the FX rates for a given date, provide a date as the first argument. The date format must be YYYY-MM-DD.
\`\`\`
!fx 2018-01-15
\`\`\`
You can also set this in combination of the previous commands.
\`\`\`
!fx 2018-01-15 HKD
!fx 2018-01-15 EUR,GBP,HKD
!fx 2018-01-15 EUR HKD
!fx 2018-01-15 EUR USD,GBP,HKD
`
  }
}
