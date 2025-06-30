<template>
  <div class="projectContentView">
    <div class="searcView">
      <el-input prefix-icon="el-icon-search" type="text" placeholder="请输入项目名称" v-model="key" @input="search" clearable>
      </el-input>
    </div>
    <div class="projectContent">
      <div v-for="(project, index) in list" :key="index" class="projectRows">
        <div class="projectName">{{ project.name }}</div>
        <div class="projectPath">{{ project.path }}</div>
        <div class="btns">
          <el-button class="rows_btn" type="primary" @click="openDefaultType(project)">{{ project.openType }}打开</el-button>
          <!-- <el-button>其他工具打开</el-button> -->
           <el-dropdown>
            <el-button class="el-icon-arrow-down rows_btn">
              其他工具打开
            </el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item v-for="(item, i) in openTypeList" :key="i" @click.native="openOtherType(project, item)">
                {{ item.name }}
              </el-dropdown-item>
            </el-dropdown-menu>
           </el-dropdown>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
const { exec } = require('child_process')
export default {
  data() {
    return {
      list: [],
      key: ''
    }
  },
  computed: {
    ...mapState({
      projectList: (state) => state.project.projectList,
      openTypeList: (state) => state.openType.openTypeList,
    }),
  },
  watch: {
    projectList (newVal, oldVal) {
      this.list = this.projectList
    }
  },
  mounted() {
    this.search('')
  },
  methods: {
    search (e) {
      const key = e
      if (key === '') {
        return this.list = this.projectList
      }
      const arr = []
      this.projectList.forEach(ret => {
        if (ret.name.indexOf(key) !== -1) {
          arr.push(ret)
        }
      })
      this.list = arr
    },
    openDefaultType(item) {
      const name = item.openType
      let openType = null
      this.openTypeList.forEach((ret) => {
        if (ret.name === name) {
          openType = ret
        }
      })
      console.log(openType)
      switch (openType.openTools) {
        case 'cmd':
          this.startCMD(item)
          break

        case 'exe':
          this.startEXE(item, openType.exePath)
          break
      }
    },
    openOtherType (project, item) {
      console.log(project, item)
      switch (item.openTools) {
        case 'cmd':
          this.startCMD(project)
          break

        case 'exe':
          this.startEXE(project, item.exePath)
          break
      }
    },
    startCMD(item) {
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
          type: 'success',
        })
      })
    },
    startEXE(item, exePath) {
      console.log('执行exe')
      console.log(process.platform)
      if (process.platform === 'win32') {
        exec(`"${exePath}" "${item.path}"`, (error, stdout, stderr) => {
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
            type: 'success',
          })
        })
      }
    },
  },
}
</script>

<style scoped>
@import url('./index.css');
</style>