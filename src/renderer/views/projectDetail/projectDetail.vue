<template>
  <div class="projectDetail" v-loading="loading">
    <!-- =============================顶部===================================== -->
    <div class="breadcrumb">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>{{ project? project.name : '详情' }}</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <el-menu
      :default-active="activeIndex"
      class="el-menu-demo"
      mode="horizontal"
      @select="handleSelect"
      background-color="#545c64"
      text-color="#fff"
      active-text-color="#ffd04b"
      style="margin-top: 20px;"
    >
      <el-menu-item index="1">项目信息</el-menu-item>
      <el-menu-item index="2">git管理</el-menu-item>
      <el-menu-item index="3">测试</el-menu-item>
    </el-menu>
    <!-- =============================项目信息===================================== -->
    <div class="projectDetailContent" v-if="project && activeIndex === '1'">
      <div class="detailHeader">
        <el-descriptions title="项目信息" :border="true" :column="2">
          <el-descriptions-item label="项目名称">{{ project.name }}</el-descriptions-item>
          <el-descriptions-item label="打开方式">{{ project.openType }}</el-descriptions-item>
          <el-descriptions-item label="项目地址">
            <el-tag size="small">{{ project.path }}</el-tag>
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </div>
    <!-- =============================git管理===================================== -->
    <div class="gitBtns" v-if="activeIndex === '2'">
      <el-dropdown>
        <el-button
          class="el-icon-arrow-down rows_btn"
        >当前分支：{{ currentBranch ? currentBranch.name : '' }}</el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item
            v-for="(value, index) in branchs"
            :key="index"
            @click.native="switchBranch(value)"
          >{{ value.name }}</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
      <el-button class="rows_btn" @click="gitPull">更新代码</el-button>

      <!-- <el-button class="rows_btn" @click="gitPush">push代码</el-button> -->
    </div>
    <div class="gitHistory" v-if="activeIndex === '2'">
      <div class="gitHistoryShowList">
        <div class="submitGitDiv">
          <el-input placeholder="请输入提交内容" v-model="commitValue">
            <template slot="append">
              <el-button @click="gitAddAndCommit">提交</el-button>
            </template>
          </el-input>
        </div>
        <div
          :class="item.select ? 'historyRows y' : 'historyRows'"
          v-for="(item, index) in gitHistoryList"
          :key="index"
        >
          <div :class="item.select ? 'massage y' : 'massage'">{{ item.message }}</div>
          <div class="time">{{ item.time }}</div>
          <el-tag>{{ item.author_name }}</el-tag>
        </div>
      </div>
      <div class="gitDetail">
        <!-- =============================代码改动可视化===================================== -->
        <div class="gitCodeChange">
          <div class="changFileDiv">
            <div class="title">
              <el-tag class="el-tag" type="warning" size="medium">改动</el-tag>
            </div>
            <div class="fileRows" v-for="(file, fileIndex) in codeChange" :key="fileIndex">{{ file.file }}</div>
          </div>
          <div class="changeCodeDiv"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
const { simpleGit } = require('simple-git')
import { Loading } from 'element-ui'
// import simpleGit from 'simple-git';
// const git = simpleGit();
export default {
  name: 'projectDetail',
  data() {
    return {
      activeIndex: '1',
      project: null,
      projectIndex: null,
      theLatestGit: null,
      gitHistoryList: [],
      branchs: [],
      currentBranch: null,
      commitValue: '',
      git: null,
      loading: false,
      codeChange: [],
      getGitHistoryInterval: null
    }
  },
  mounted() {
    this.project = this.$route.query.project
    this.projectIndex = this.$route.query.projectIndex
    this.git = simpleGit(this.project.path)
    // this.getGitHistory()
  },
  beforeDestroy () {
    clearInterval(this.getGitHistoryInterval)
  },
  methods: {
    // 选择标签
    handleSelect(index) {
      this.activeIndex = index
      // 进入git管理
      if (index === '2') {
        clearInterval(this.getGitHistoryInterval)
        this.getGitHistory()
        this.getCodeChange()
        this.getGitHistoryInterval = setInterval(() => {
          this.getGitHistory()
          this.getCodeChange()
        }, 2000)
        
      }
    },
    // 获取git信息
    getGitHistory() {
      this.git
        .branch()
        .then((ret) => {
          console.log('分支信息:', ret)
          let objKeys = Object.keys(ret.branches)
          let arr = []
          objKeys.forEach((key) => {
            if (ret.branches[key].current) {
              this.currentBranch = ret.branches[key]
            }
            arr.push(ret.branches[key])
          })
          console.log(arr)
          this.branchs = arr
        })
        .catch((err) => {
          console.error('获取分支信息失败:', err)
        })
      // 获取提交记录
      this.git.log().then((ret) => {
        console.log(ret)
        this.theLatestGit = ret.latest
        ret.all.forEach((item) => {
          item.time = new Date(item.date).toLocaleString()
          item.select = false
        })
        ret.all[0].select = true
        this.gitHistoryList = ret.all
      })
    },
    // 切换分支
    switchBranch(item) {
      console.log('切换分支：', item)
      console.log(this.branchs)
      this.git.checkout(item.name).then((ret) => {
        console.log(ret)
        this.currentBranch = item
        this.getGitHistory()
      })
    },
    // 更新代码
    gitPull() {
      console.log(this.git)
      console.log(this.git.checkout)
      this.loading = true
      this.git
        .pull('origin', this.currentBranch.name)
        .then((ret) => {
          console.log(ret, '更新代码')
          this.loading = false
          this.getGitHistory()
        })
        .catch((err) => {
          console.log(err)
          this.loading = false
        })
    },
    // 提交代码
    gitAddAndCommit () {
      let commitValu = this.commitValue === '' ? '更新' : this.commitValue
      this.git.add('.').then(ret => {
        console.log(ret)
        this.git.commit(commitValu).then(commitResult => {
          console.log(commitResult)
          if (!commitResult.commit || commitResult.commit === '') {
            return this.$message({
              type: 'warning',
              message: `暂无可提交的内容`
            })
          }
          this.loading = true
          this.commitValue = ''
          this.git.push('origin', this.currentBranch.name).then(pushResult => {
            this.loading = false
            console.log(pushResult)
            this.$message({
              type: 'success',
              message: `提交成功`
            })
            this.getGitHistory()
          }).catch(err => {
            this.loading = false
            this.$message({
              type: 'error',
              message: `git push 失败：${JSON.stringify(err)}`
            })
          })
        }).catch(err => {
          this.$message({
            type: 'error',
            message: `git commit 失败：${JSON.stringify(err)}`
          })
        })
      }).catch(err => {
        this.$message({
          type: 'error',
          message: `git add 失败：${JSON.stringify(err)}`
        })
      })
    },
    // 获取代码改动
    getCodeChange() {
      console.log(this.git)
      let arr = []
      this.git.diff().then((ret) => {
        console.log(typeof ret)
        console.log(ret)
        const result = this.parseDiff(ret)
        console.log(result)
        arr.push(result)

        this.git.status((err, status) => {
          status.not_added.forEach((file) => {
            this.git.diff(['--no-index', '/dev/null', file], (err, diff) => {
              console.log(diff)
              let otherResult = this.parseDiff(diff)
              arr.push(otherResult)
            })
          })
          
          this.codeChange = arr
          console.log('最终结果:', this.codeChange)
        })
      })
    },
    // 解析diff文本

    parseDiff(diffText) {
      const lines = diffText.split('\n')
      const result = {
        file: '',
        changes: [],
        id: Date.now().toString(36) + Math.random().toString(36).substr(2)
      }

      // 提取文件名
      const fileMatch = diffText.match(/diff --git a\/(.+) b\//)
      if (fileMatch) result.file = fileMatch[1]

      // 解析每个变更块
      let currentBlock = null
      let newLineCounter = 0
      let oldLineCounter = 0

      lines.forEach((line) => {
        // 匹配变更头
        const headerMatch = line.match(/^@@ -(\d+),?(\d*) \+(\d+),?(\d*) @@/)
        if (headerMatch) {
          currentBlock = {
            oldStart: parseInt(headerMatch[1]),
            oldLines: headerMatch[2] ? parseInt(headerMatch[2]) : 1,
            newStart: parseInt(headerMatch[3]),
            newLines: headerMatch[4] ? parseInt(headerMatch[4]) : 1,
            changes: [],
          }
          newLineCounter = currentBlock.newStart - 1
          oldLineCounter = currentBlock.oldStart - 1
          result.changes.push(currentBlock)
          return
        }

        // 收集变更内容
        if (currentBlock) {
          if (line.startsWith('+')) {
            newLineCounter++
            currentBlock.changes.push({
              type: 'add',
              content: line.substring(1),
              newLine: newLineCounter, // 记录新文件中的行号
              oldLine: null, // 新增行在旧文件中不存在
            })
          } else if (line.startsWith('-')) {
            oldLineCounter++
            currentBlock.changes.push({
              type: 'del',
              content: line.substring(1),
              oldLine: oldLineCounter, // 记录旧文件中的行号
              newLine: null, // 删除行在新文件中不存在
            })
          } else {
            newLineCounter++
            oldLineCounter++
            currentBlock.changes.push({
              type: 'context',
              content: line,
              newLine: newLineCounter, // 记录新文件中的行号
              oldLine: oldLineCounter, // 记录旧文件中的行号
            })
          }
        }
      })

      return result
    },
  },
}
</script>
<style scoped>
@import url('./index.css');

@import url('./gitCodeChange.css');
</style>