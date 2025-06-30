<template>
  <div class="home">
    <keep-alive>
      <menuHeader @toPage="toPage"></menuHeader>
    </keep-alive>
    <!-- 项目管理系统 -->
     <div class="content">
        <recentlyOpened></recentlyOpened>
        <projectContent></projectContent>
     </div>
  </div>
</template>

<script>
import menuHeader from '@/renderer/components/menuHeader/menuHeader.vue';
import recentlyOpened from '@/renderer/components/recentlyOpened/recentlyOpened.vue';
import projectContent from '@/renderer/components/projectContent/projectContent.vue';
export default {
  name: "Home",
  components: {
    menuHeader,
    recentlyOpened,
    projectContent
  },
  data() {
    return {
    }
  },
  mounted() {

  },
  methods: {
    toPage(e) {
      console.log(this, '=====')
      console.log(e)
      this.$router.push(e)
    }
  },
}
</script>
<style lang="scss">
.content {
  width: 100%;
  display: flex;
  justify-content: flex-start;
  height: calc(100vh - 120px);
  margin-top: 10px;
}
</style>
