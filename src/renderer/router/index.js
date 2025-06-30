import Vue from "vue"
import VueRouter from "vue-router"
import Home from "../views/home/home.vue"
import batchImport from "../views/batchImport/batchImport.vue"
import editorOpentype from "../views/editorOpentype/editorOpentype.vue"
Vue.use(VueRouter)

const routes = [
  {
    path: "/",
    name: "home",
    component: Home,
    meta: { keepAlive: true }
  },
  {
    path: "/batch-import",
    name: "batchImport",
    component: batchImport,
  },
  {
    path: "/editorOpentype",
    name: "editorOpentype",
    component: editorOpentype,
  }
]

const router = new VueRouter({
  routes,
})

export default router
