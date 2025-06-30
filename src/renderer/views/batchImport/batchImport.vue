<template>
  <div class="batchImport">
    <!-- =============================顶部===================================== -->
    <div class="breadcrumb">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>批量导入项目</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <!-- =============================表格===================================== -->
    <div class="btns">
      <el-button type="primary" icon="el-icon-circle-plus-outline" @click="scanProject">选择文件夹批量导入</el-button>
      <el-button type="primary" icon="el-icon-copy-document" @click="saveProjectList">保存</el-button>
      <el-button type="primary" icon="el-icon-copy-document" @click="toggleSelection()">取消选择</el-button>
      <el-popover placement="top" width="160" style="margin-left: 10px;" v-model="deleteVisible">
        <p>是否确定删除？</p>
        <div style="text-align: right; margin: 0">
          <el-button size="mini" type="text" @click="deleteVisible = false">取消</el-button>
          <el-button type="primary" size="mini" @click="batchDelete">确定</el-button>
        </div>
        <el-button slot="reference" type="primary" icon="el-icon-copy-document">批量删除</el-button>
      </el-popover>
    </div>
    <el-table
      v-if="newprojectList.length > 0"
      :data="newprojectList"
      :border="true"
      ref="multipleTable"
      @selection-change="handleSelectionChange"
      style="width: 100%;"
    >
      <el-table-column type="selection" width="55"></el-table-column>
      <el-table-column label="项目名称" width="180" prop="name"></el-table-column>
      <el-table-column label="项目地址" width="180" prop="path"></el-table-column>
      <el-table-column label="打开方式" width="180" prop="openType"></el-table-column>
      <el-table-column fixed="right" label="操作" width="120">
        <template slot-scope="scope">
          <el-button type="text" size="small" @click="editorProject(scope.row, scope.$index)">编辑</el-button>
          <el-button
            @click.native.prevent="deleteRow(scope.$index, newprojectList)"
            type="text"
            size="small"
          >移除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- =============================对话框===================================== -->
    <el-dialog
      :title="'编辑'"
      :visible.sync="dialogVisible"
      width="80%"
      :before-close="closeOpenType"
    >
      <div class="inputRows">
        <div class="inputTitle">项目名称：</div>
        <el-input class="elInput" v-model="newProjectInfo.name"></el-input>
      </div>
      <div class="inputRows">
        <div class="inputTitle">打开方式：</div>
        <!-- <el-input class="elInput" v-model="newProjectInfo.openType"></el-input> -->
        <el-autocomplete
          class="elInput"
          v-model="newProjectInfo.openType"
          :fetch-suggestions="querySearch"
          placeholder="请选择方式"
        ></el-autocomplete>
      </div>
      <div class="inputRows">
        <div class="inputTitle">项目地址：</div>
        <el-input class="elInput" v-model="newProjectInfo.path"></el-input>
      </div>
      <span slot="footer" class="dialog-footer">
        <!-- <el-button @click="closeOpenType">取 消</el-button> -->
        <el-button
          type="primary"
          @click="dialogVisible = false;newProjectInfo = {name: '', openType: '', path: ''};newProjectIndex = null"
        >关 闭</el-button>
      </span>
    </el-dialog>
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
  name: 'BatchImport',
  data() {
    return {
      newprojectList: [],
      selectRows: [],
      deleteVisible: false, // 删除确认弹窗
      newProjectInfo: {
        name: '',
        openType: '',
        path: '',
      },
      newProjectIndex: null,
      dialogVisible: false,
    }
  },
  computed: {
    ...mapState({
      batchImport: (state) => state.dialog.batchImport,
      openTypeList: (state) => {
        return state.openType.openTypeList.map((ret) => {
          return {
            value: ret.name
          }
        })
      },
    }),
  },
  watch: {
    batchImport(newVal, oldVal) {
      if (newVal === '') {
        return
      }
      this.onDialogResult1(newVal)
      this.$store.commit('batchImport', '')
    },
  },
  methods: {
    toBack() {
      this.$router.go(-1)
    },
    querySearch (queryString, cb) {
      cb(this.openTypeList)
    },
    closeOpenType() {
      this.dialogVisible = false
      this.newProjectIndex = null
      this.newProjectInfo = {
        name: '',
        openType: '',
        path: '',
      }
    },
    // 选择文件夹
    scanProject() {
      this.$ipcRenderer.send('dialog:select-folder-configuration', {
        sendKey: 'dialog:dialog-result-batch',
      })
    },
    // 处理选择文件夹的结果
    onDialogResult1(filePaths) {
      console.log('选择的文件夹路径:', filePaths)
      let folderPath = path.join(filePaths)
      getFolderPathList(folderPath).then((ret) => {
        let arr = []
        ret.forEach((e) => {
          arr.push({
            name: '',
            path: path.join(e),
            openType: '',
          })
        })
        this.getProjectListAndFilter(arr)
      })
    },
    // 保存项目列表
    saveProjectList() {
      readConfigJson('config.json').then((ret) => {
        let projectList = ret.projectList || []
        let newprojectList = JSON.parse(JSON.stringify(this.newprojectList))
        // 合并新项目列表和已有项目列表
        let combinedList = [...projectList, ...newprojectList]
        ret.projectList = combinedList
        writeConfigJson(ret, 'config')
          .then(() => {
            this.$message({
              message: '项目列表保存成功',
              type: 'success',
            })
            this.newprojectList = []
          })
          .catch((err) => {
            console.error('保存失败:', err)
            this.$message.error('保存失败，请稍后重试')
          })
      })
    },
    // 获取配置文件projectList
    getProjectListAndFilter(arr) {
      readConfigJson('config.json').then((ret) => {
        let projectList = ret.projectList || []
        let projectListSet = new Set(projectList.map((item) => item.path))
        let filteredList = arr.filter((item) => !projectListSet.has(item.path))
        this.newprojectList = filteredList
        console.log(filteredList)
        this.$message({
          message: '导入成功，已过滤重复项目',
          type: 'success',
        })
      })
    },
    // 取消选择
    toggleSelection(rows) {
      if (rows) {
        rows.forEach((row) => {
          this.$refs.multipleTable.toggleRowSelection(row)
        })
      } else {
        this.$refs.multipleTable.clearSelection()
      }
    },
    // 处理选择变化
    handleSelectionChange(val, e) {
      this.selectRows = val
    },
    // 移除行
    deleteRow(index, rows) {
      rows.splice(index, 1)
    },
    // 批量删除
    batchDelete() {
      this.deleteVisible = false
      if (this.selectRows.length === 0) {
        this.$message({
          message: '请选择要删除的项目',
          type: 'warning',
        })
        return
      }
      let newprojectList = JSON.parse(JSON.stringify(this.newprojectList))
      let selectRows = JSON.parse(JSON.stringify(this.selectRows))
      // let newprojectListSet = new Set(newprojectList.map((item) => item.path))
      // let arr = selectRows.filter((item) => {
      //   return newprojectListSet.has(item.path)
      // })
      let selectRowsSet = new Set(selectRows.map((item) => item.path))
      let arr = newprojectList.filter((item) => {
        return !selectRowsSet.has(item.path)
      })
      this.newprojectList = arr
    },
    editorProject(item, index) {
      this.newProjectInfo = item
      this.dialogVisible = true
      this.newProjectIndex = index
    },
  },
  beforeUnmount() {
    this.$ipcRenderer.removeListener(
      'dialog:dialog-result-batch',
      this.onDialogResult
    )
  },
}
</script>
<style scoped>
@import url('./index.css');
</style>