import Vue from 'vue'
import Vuex from 'vuex'
import project from './modules/project'
Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    project
  }
})
export default store
