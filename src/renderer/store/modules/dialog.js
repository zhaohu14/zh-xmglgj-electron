export default {
  state: {
    batchImport: '', // 批量导入
    onImport: '', // 单个导入
  },
  mutations: {
    batchImport (state, Str) {
      state.batchImport = Str
    },
    onImport (state, Str) {
      state.onImport = Str
    }
  },
  actions: {
    
  }
}