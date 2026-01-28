<template>
  <div id="app">
    <!-- RotatingWheel Component -->
    <RotatingWheel
      @category-change="handleCategoryChange"
      @animation-complete="handleAnimationComplete"
    />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Widget from './components/Widget.vue'
import RotatingWheel from './components/RotatingWheel.vue'

export default Vue.extend({
  name: 'App',
  components: {
    Widget,
    RotatingWheel
  },
  methods: {
    handleCategoryChange(event: any) {
      console.log('Category changed:', event)
    },
    handleAnimationComplete() {
      console.log('Animation completed')
    }
  }
})
</script>

<style>
body {
  margin: 0;
  padding: 0;
  background-color: #F7F7F9;
}

#app {
  background-color: #F7F7F9;
  min-height: 100vh;
}
</style>
