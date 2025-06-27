<template>
  <div class="projectContent">
    <div
      v-for="(project, index) in projectList"
      :key="index"
      class="projectRows">
      <div class="projectName">{{ project.name }}</div>
      <div class="projectPath">{{ project.path }}</div>
      <div class="btns">
        <el-button @click="openDefaultType(project)">{{ project.openType }}打开</el-button>
        <el-button>其他工具打开</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
const { exec } = require('child_process')
export default {
  data () {
    return {}
  },
  computed: {
    ...mapState({
      projectList: state => state.project.projectList,
    }),
  },
  mounted () {
    setTimeout(() => {
      // 这里可以添加一些初始化逻辑
      console.log(this.$store.state.project.projectList);
      // console.log('Project content mounted');
    }, 2000);
  },
  methods: {
    openDefaultType (item) {
      if (item.openType === 'vsCode') {
        exec(`code ${item.path}`, (error, stdout, stderr) => {
          if (error) {
            this.$message.error(`执行失败${JSON.stringify(error)}`)
            return
          }
          if (stderr) {
            this.$message.error(`执行失败${JSON.stringify(stderr)}`)
            return
          }
          this.$message({
            message: '执行成功',
            type: 'success'
          })
        })
      }
    }
  }
}
</script>

<style scoped>
@import url('./index.css');
</style>