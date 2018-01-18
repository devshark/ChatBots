<template>
  <div class="row">
    <p>Join our <a :href="invite_link" target="_blank" @click="login">Discord group</a></p>
    <button class="btn btn-primary" v-if="!bot_is_running" @click="login">Start Bot</button>
  </div>
</template>

<script>
import DiscordClient from '@/services/discord-service'

export default {
  data: function () {
    return {
      invite_link: process.env.DISCORD_INVITE,
      text: '',
      bot_is_running: false
    }
  },
  methods: {
    mounted: function () {
      this.text = ''
    },
    created: function () {
    },
    login: function () {
      try {
        DiscordClient.init()
          .then(() => {
            this.$log.info('Listening for messages.')
            this.bot_is_running = true
          })
      } catch (ex) {
        this.$log.error(ex)
      }
    }
  }
}
</script>
