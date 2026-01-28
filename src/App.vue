<template>
  <div id="app">
    <RotatingWheel
      @category-change="handleCategoryChange"
    />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import RotatingWheel from './components/RotatingWheel.vue'

export default Vue.extend({
  name: 'App',
  components: {
    RotatingWheel
  },
  methods: {
    handleCategoryChange(event: any) {
      // Category changed event
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
