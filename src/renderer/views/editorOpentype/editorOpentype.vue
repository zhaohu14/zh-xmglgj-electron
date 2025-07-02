<template>
  <div class="editorOpentype">
    <!-- =============================顶部===================================== -->
    <div class="batchImport">
      <div class="breadcrumb">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item>编辑打开方式</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
    </div>
    <!-- =============================表格===================================== -->
    <div class="btns">
      <el-button type="primary" icon="el-icon-circle-plus-outline" @click="addOpenType">添加</el-button>
      <el-button type="primary" icon="el-icon-copy-document" @click="saveOpenType">保存</el-button>
    </div>
    <el-table :data="openType" style="width: 100%;">
      <el-table-column label="名称" width="180" prop="name"></el-table-column>
      <el-table-column label="打开类型" width="180" prop="openTools"></el-table-column>
      <el-table-column label="程序安装地址" width="240" prop="exePath"></el-table-column>
      <el-table-column label="命令语句" width="180" prop="executeStatement"></el-table-column>
      <el-table-column fixed="right" label="操作" width="100">
        <template slot-scope="scope">
          <el-button @click="editorRows(scope.row, scope.$index)" type="text" size="small">编辑</el-button>
          <el-button @click.native.prevent="deleteRow(scope.$index, openType)" type="text" size="small">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- =============================对话框===================================== -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="80%" :before-close="closeOpenType">
      <div class="inputRows">
        <div class="inputTitle">方式名称：</div>
        <el-input class="elInput" v-model="newRows.name"></el-input>
      </div>
      <div class="inputRows">
        <div class="inputTitle">打开类型：</div>
        <el-input class="elInput" v-model="newRows.openTools" placeholder="请从以下选项中选取打开方式" disabled></el-input>
      </div>
      <div class="tips">
        <el-tooltip class="item" effect="dark" content="执行命令语句" placement="top-start">
          <el-button @click="changOpenTools('cmd')">cmd</el-button>
        </el-tooltip>
        <el-tooltip class="item" effect="dark" content="指定程序打开文件夹" placement="top-start">
          <el-button @click="changOpenTools('exe')">exe</el-button>
        </el-tooltip>
        <el-tooltip class="item" effect="dark" content="指定程序打开子目录文件夹" placement="top-start">
          <el-button @click="changOpenTools('pathExe')">pathExe</el-button>
        </el-tooltip>
      </div>
      <div class="inputRows">
        <div class="inputTitle">程序安装地址：</div>
        <el-input class="elInput" v-model="newRows.exePath" placeholder="点击选择程序">
          <template slot="append">
            <el-button @click="selectEXE">选择</el-button>
          </template>
        </el-input>
      </div>
      <div class="inputRows">
        <div class="inputTitle">命令语句：</div>
        <el-input class="elInput" v-model="newRows.executeStatement"></el-input>
      </div>
      <div class="inputRows">
        <div class="inputTitle">其他文件夹：</div>
        <el-input class="elInput" v-model="newRows.openPath"></el-input>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="closeOpenType">取 消</el-button>
        <el-button type="primary" @click="confirmOpenType">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { readConfigJson, writeConfigJson } from '../../utils/utils'
import path from 'path'
export default {
  name: 'editorOpentype',
  data() {
    return {
      openType: [],
      newRows: {
        name: '',
        openTools: '',
        executeStatement: '',
        exePath: ''
      },
      dialogVisible: false,
      dialogTitle: '添加',
      dialogType: 'add',
      editorIndex: null
    }
  },
  methods: {
    readJson() {
      // 读取配置文件
      readConfigJson('config.json').then((ret) => {
        console.log(ret)
        this.openType = ret.openType
      })
    },
    // 删除
    deleteRow(index, openType) {
      console.log(index)
      openType.splice(index, 1)
      this.openType = openType
    },
    // 编辑
    editorRows(item, index) {
      console.log(item)
      this.newRows = item
      this.dialogVisible = true
      this.dialogTitle = '编辑'
      this.dialogType = 'editor'
      this.editorIndex = index
    },
    // 打开对话框
    addOpenType () {
      this.dialogTitle = '添加'
      this.dialogType = 'add'
      this.editorIndex = null
      this.newRows = {
        name: '',
        openTools: '',
        executeStatement: '',
        exePath: ''
      }
      this.dialogVisible = true
    },
    // 关闭对话框
    closeOpenType () {
      this.newRows = {
        name: '',
        openTools: '',
        executeStatement: '',
        exePath: ''
      }
      this.dialogVisible = false
      this.editorIndex = null
    },
    // 编辑新增确认
    confirmOpenType () {
      let openType = JSON.parse(JSON.stringify(this.openType))
      
      if (this.dialogType === 'editor') {
        openType[this.editorIndex] = this.newRows
      } else if (this.dialogType === 'add') {
        openType.push(this.newRows)
        this.openType = openType
      }
      this.newRows = {
        name: '',
        openTools: '',
        executeStatement: '',
        exePath: ''
      }
      this.dialogVisible = false
      this.editorIndex = null
    },
    // 选择程序
    selectEXE () {
      this.$ipcRenderer.send('dialog:select-exe')
      this.$ipcRenderer.on('dialog:dialog-exe-result', this.onDialogExeResult)
    },
    // 监听选择完成
    onDialogExeResult (event, filePaths) {
      let folderPath = path.join(filePaths[0])
      let newRows = JSON.parse(JSON.stringify(this.newRows))
      newRows.exePath = folderPath
      this.newRows = newRows
      this.$ipcRenderer.removeListener('dialog:dialog-exe-result', this.onDialogExeResult)
    },
    saveOpenType () {
      readConfigJson('config.json').then((ret) => {
        console.log(ret)
        ret.openType = this.openType
        writeConfigJson(ret, 'config').then(res => {
          if (!ret) {
              this.$message.error(`保存失败${JSON.stringify(err)}`)
              return
            }
            this.$message({
              message: '保存成功',
              type: 'success'
            })
        })
      })
    },
    // 更改打开方式
    changOpenTools (type) {
      this.newRows.openTools = type
    }
  },
  mounted() {
    this.readJson()
  },
}
</script>

<style scoped>
@import url('./index.css');
</style>