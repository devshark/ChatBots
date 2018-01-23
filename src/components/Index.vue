<template>
  <div class="row">
    <p><a :href="invite_link" target="_blank" @click="login">Click here to join our Discord group.</a></p>
    <button class="btn btn-primary" v-if="!online" @click="login">Start Bot</button>
    <div id="commands" v-if="online">
      The bot is now <div class="label label-success">online</div>.
      <h3>Supported Commands:</h3>
      <div v-html="textCommands"></div>
    </div>
  </div>
</template>

<script>
import DiscordClient from '@/services/discord-service'

export default {
  data: function () {
    return {
      invite_link: process.env.DISCORD_INVITE,
      textCommands: '',
      online: false
    }
  },
  methods: {
    login: function () {
      try {
        DiscordClient.init()
          .then(() => {
            this.$log.info('Listening for messages.')
            this.online = true
          })
        this.textCommands = DiscordClient.getCommands()
      } catch (ex) {
        this.$log.error(ex)
      }
    }
  },
  mounted: function () {
    this.login()
  }
}
</script>
