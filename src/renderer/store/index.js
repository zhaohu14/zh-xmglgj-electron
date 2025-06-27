import Vue from 'vue'
import Vuex from 'vuex'
import project from './modules/project'
import openType from './modules/openType'
Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    project,
    openType
  }
})
export default store
