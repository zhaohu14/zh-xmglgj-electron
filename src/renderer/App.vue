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
      this.$ipcRenderer.on('dialog:dialog-result', this.onImporTProject)
      this.$ipcRenderer.on('dialog:dialog-result-batch', this.batchImport)
    })
  },
  beforeDestroy () {
    console.log('页面卸载')
    this.$ipcRenderer.removeAllListeners()
    console.log(this.$ipcRenderer, '111')
  },
  methods: {
    onImporTProject(event, filePaths) {
      console.log('单个项目导入')
      this.$store.commit('onImport', filePaths[0])
    },
    batchImport (event, filePaths) {
      console.log('批量导入')
      this.$store.commit('batchImport', filePaths[0])
    }
  }
}
</script>
<style lang="scss">
</style>
