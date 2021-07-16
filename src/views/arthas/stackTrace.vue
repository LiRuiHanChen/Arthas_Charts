<template>
  <div class="dashboard-container" style="width:100%">
    <div id="runtimeList" style="width:50%;margin-left:30%;margin: auto;">
      <json-viewer
        style="line-height:20px"
        :value="stackTraceValue"
        :expand-depth="5"
        copyable
        boxed
      />
    </div>
  </div>
</template>

<script>
import 'vue-json-viewer/style.css'

export default {
  name: 'App',
  data() {
    return {
      stackTraceValue: []
    }
  },
  created() {
    this.getInfo()
  },
  methods: {
    getInfo() {
      const tempData = this.$route.query.data
      if (tempData !== undefined) {
        this.stackTraceValue = JSON.parse(this.$route.query.data)
      }
    }
  }
}
</script>
