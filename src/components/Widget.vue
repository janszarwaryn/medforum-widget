<template>
  <div class="widget">
    <h1>{{ title }}</h1>
    <p>{{ message }}</p>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

interface WidgetData {
  title: string
  message: string
}

export default Vue.extend({
  name: 'MedforumWidget',
  data(): WidgetData {
    return {
      title: 'Medforum Widget',
      message: 'Widget działa z TypeScript!'
    }
  }
})
</script>

<style scoped>
.widget {
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
}
</style>
