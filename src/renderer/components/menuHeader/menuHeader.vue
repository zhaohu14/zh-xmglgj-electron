<template>
  <div v-if="show" class="menuHeader">
    <div class="images">
      <img src="../../assets/icon/tiger.png" alt />
    </div>
    <div
      v-for="(item, index) in menu"
      :key="index"
      @click="menusMouseenter(item)"
      @mouseleave="menusMouseleave(item)"
      class="menus_rows"
    >
      {{ item.name }}
      <div v-if="item.showChidren" class="menus_chidren">
        <div
          v-for="(chidren1, chidrenIndex) in item.chidren"
          :key="chidrenIndex"
          class="menus_chidren_rows"
          @click="menuFunction(chidren1, index)"
        >{{ chidren1.name }}</div>
      </div>
    </div>
    <div v-show="showChangeProjectRows" class="changeProjectRows">
      <el-card class="box-card">
        <div slot="header" class="clearfix">
          <span>完善项目信息</span>
          <el-button
            style="float: right; padding: 3px 0"
            type="text"
            @click="closeChangeProjectRows"
          >关闭</el-button>
        </div>
        <div class="inpuutRows">
          项目名称：
          <el-input placeholder="请输入项目名称" v-model="waitProject.name"></el-input>
        </div>
        <div class="inpuutRows">
          项目地址：
          <el-input placeholder="请输入项目名称" v-model="waitProject.path"></el-input>
        </div>
        <div class="inpuutRows">
          打开方式：
          <!-- <el-input placeholder="请选择打开方式" v-model="waitProject.openType"></el-input> -->
           <el-autocomplete
            class="inline-input"
            v-model="waitProject.openType"
            :fetch-suggestions="querySearch1"
            placeholder="请输入内容"
          ></el-autocomplete>
        </div>
        <el-button class="btns" @click="saveProjectRows">保存</el-button>
      </el-card>
    </div>
  </div>
</template>
<script>
import path from 'path'
import { mapState } from 'vuex'
import {
  getFolderPathList,
  readConfigJson,
  writeConfigJson,
} from '../../utils/utils.js'
export default {
  data() {
    return {
      menu: [
        {
          name: '文件',
          showChidren: false,
          chidren: [
            {
              name: '导入项目',
              type: 'import_project',
            },
            {
              name: '新建项目',
              type: 'new_project',
            },
            {
              name: '批量导入',
              type: 'batch_import',
            },
          ],
        },
        {
          name: '编辑',
          showChidren: false,
          chidren: [
            {
              name: '编辑打开方式',
              type: 'editor_opentype',
            },
          ],
        },
      ],
      showChangeProjectRows: false,
      waitProject: {
        name: '',
        path: '',
        openType: ''
      },
      show: true,
    }
  },
  computed: {
    ...mapState({
      onImport: (state) => state.dialog.onImport,
      openTypeList: (state) => {
        return state.openType.openTypeList.map((ret) => {
          return {
            value: ret.name
          }
        })
      },
    })
  },
  watch: {
    onImport (newVal, oldVal) {
      if (newVal === '') {
        return
      }
      this.waitProject.path = newVal
      this.showChangeProjectRows = true
      this.$store.commit('onImport', '')
    }
  },
  methods: {
    querySearch1 (queryString, cb) {
      cb(this.openTypeList)
    },
    closeChangeProjectRows() {
      this.showChangeProjectRows = false
      this.waitProject = {
        name: '',
        path: '',
        openType: ''
      }
    },
    menusMouseenter(item) {
      item.showChidren = true
    },
    menusMouseleave(item) {
      item.showChidren = false
    },
    menuFunction(chidren, index) {
      this.menu[index].showChidren = false
      switch (chidren.type) {
        case 'import_project':
          this.importProject()
          console.log('导入项目')
          break

        case 'new_project':
          console.log('新建项目', this.$store.state)
          break

        case 'batch_import':
          console.log('批量导入')
          this.$emit('toPage', { name: 'batchImport' })
          // this.$router.push({ name: 'batchImport' })
          // this.scanProject()
          break
        case 'editor_opentype':
          this.$router.push({ name: 'editorOpentype' })
          break
      }
    },
    
    importProject() {
      this.$ipcRenderer.send('dialog:select-folder-configuration', {
        sendKey: 'dialog:dialog-result'
      })
      console.log(this)
      // this.$ipcRenderer.on('dialog:dialog-result', this.onImporTProject)
    },
    onImporTProject(event, filePaths) {
      let folderPath = path.join(filePaths[0])
      let obj = {
        name: '',
        path: path.join(folderPath),
        openType: '',
      }
      console.log('导入项目：', folderPath)
      readConfigJson('config.json')
        .then((ret) => {
          console.log(ret)
          let hasPath = false
          ret.projectList.forEach((e) => {
            if (e.path === folderPath) {
              hasPath = true
              return alert('该项目已存在')
            }
          })
          console.log(hasPath)
          if (!hasPath) {
            this.$nextTick(() => {
              console.log('渲染完成')
              this.showChangeProjectRows = true
              this.waitProject = obj
            })
          }
        })
        .catch((err) => {
          console.log(err)
        })
    },
    saveProjectRows() {
      readConfigJson('config.json').then((ret) => {
        console.log(ret)
        let hasPath = false
        ret.projectList.forEach((e) => {
          if (e.path === this.waitProject.path) {
            hasPath = true
            return alert('该项目已存在')
          }
        })
        if (!hasPath) {
          this.showChangeProjectRows = false
          let obj = JSON.parse(JSON.stringify(this.waitProject))
          this.waitProject = {
            name: '',
            path: '',
            openType: ''
          }
          ret.projectList.push(obj)
          writeConfigJson(ret, 'config', this).then((ret, err) => {
            if (!ret) {
              this.$message.error(`添加失败：${JSON.stringify(err)}`)
              return
            }
            this.$message({
              message: '添加成功',
              type: 'success',
            })
          })
        }
      })
    },
  },
}
</script>
<style lang="scss">
@import url('./index.scss');
</style>