import axios from 'axios'
import Vue from 'vue'

const xhr = axios.create({
  baseURL: `${process.env.API_WEATHER_ENDPOINT}`, // root API endpoint
  timeout: 10000, // 10second timeout?
  headers: {
    'Content-Type': 'UTF-8'
  } // any custom headers? key-value pair
})

export default {
  getByCity: function (cityName) {
    if (typeof cityName === 'undefined') throw new Error('City Name is required')
    return new Promise((resolve, reject) => {
      xhr.get('/', {
        params: {
          q: cityName,
          units: 'metric',
          appid: process.env.API_WEATHER_KEY
        }
      })
        .then(response => {
          Vue.$log.debug(response, response.data)
          if (response.status === 200) {
            let c = response.data
            let date = new Date(c.dt * 1000).toUTCString()
            let sunrise = new Date(c.sys.sunrise * 1000).toUTCString()
            let sunset = new Date(c.sys.sunset * 1000).toUTCString()
            let topData = c.weather.map(q => q.main + ' - ' + q.description)
            if (typeof c.rain !== 'undefined') {
              topData.push('Rain volume for the last 3 hours: ' + c.rain['3h'])
            }
            if (typeof c.snow !== 'undefined') {
              topData.push('Snow volume for the last 3 hours: ' + c.snow['3h'])
            }
            topData = topData.join('\n')
            let result = `**here is a summary of the weather in ${cityName}, ${c.sys.country}:**
as of ${date}
${topData}
Sunrise: ${sunrise}
Sunset: ${sunset}
Temperature: ${c.main.temp}\u00b0C 
Low: ${c.main.temp_min}\u00b0C
High: ${c.main.temp_max}\u00b0C
Pressure: ${c.main.pressure} hPa
Humidity: ${c.main.humidity}%
Wind: ${c.wind.speed} meter/s
Cloudiness: ${c.clouds.all}%`
            resolve(result)
          } else {
            reject(new Error('Result is not OK!'))
          }
        })
        .catch(reject)
    })
  },
  getCommands: function () {
    return `###Weather bot
####Purpose
To display a summary of the weather condition in a specified city.
####Command syntax
The command keyword is **!weather**.
Enter the name of a city as the first argument.
\`\`\`
!weather Hong Kong
\`\`\`
`
  }
}
