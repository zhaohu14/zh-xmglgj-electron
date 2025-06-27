<template>
  <div id="app">
    <router-view />
  </div>
</template>
<script>
import { existsSyncConfig } from './utils/utils.js'
export default {
  created () {
    this.$nextTick(() => {
      console.log(123456)
      existsSyncConfig('', 'config')
    })
  }
}
</script>
<style lang="scss">
</style>
