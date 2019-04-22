<template>
  <div id="app">
    <div id="header">
      <span class="ads">Anomaly Detection System</span>
      <router-link class="nav-title" :to="{ name: 'Situation'}">SITUATION</router-link>
      <router-link class="nav-title" :to="{ name: 'Analysis'}">ANALYSIS</router-link>
      <router-view/>
    </div>
  </div>
</template>

<script>
import './assets/less/index.less'
export default {
  name: 'App'
}
</script>
