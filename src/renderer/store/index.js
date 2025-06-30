import Vue from 'vue'
import Vuex from 'vuex'
import project from './modules/project'
import openType from './modules/openType'
import dialog from './modules/dialog'
Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    project,
    openType,
    dialog
  }
})
export default store
