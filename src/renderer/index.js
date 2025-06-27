import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import { ipcRenderer } from "../main/utils";

import "@/renderer/assets/common.scss";
import "element-ui/lib/theme-chalk/index.css";

import store from './store/index'

Vue.config.productionTip = false;
import ElementUI from 'element-ui';

import {
  Form,
  FormItem,
  Button,
  Input,
  Tag,
  Divider,
  Notification,
  Drawer,
  Radio,
  Checkbox,
  Transfer,
} from "element-ui";

Vue.use(Form);
Vue.use(FormItem);
Vue.use(Button);
Vue.use(Input);
Vue.use(Tag);
Vue.use(Divider);
Vue.use(Drawer);
Vue.use(Radio);
Vue.use(Checkbox);
Vue.use(Transfer);
Vue.use(ElementUI);


// Vue.prototype.$store = store
Vue.prototype.$notify = Notification;
Vue.prototype.$ipcRenderer = ipcRenderer();
Vue.prototype.$ELEMENT = { size: "small", zIndex: 3000 };

Vue.prototype.$EventBus = new Vue();

new Vue({
  store,
  router,
  render: (h) => h(App),
}).$mount("#app");
