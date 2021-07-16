<template>
  <div class="dashboard-container" style="width:100%">
    <el-form id="ArthasPath" ref="ruleFrom" :inline="true" :model="fromData" style="width:100%;">
      <el-form-item
        prop="ip"
        :rules="[
          { required: true, message: '请输入ip', trigger: 'blur' },
          { min: 6, max: 50, message: '长度在 6 到 50 个字符', trigger: 'blur' }
        ]"
      >
        <el-input v-model="fromData.ip" placeholder="请输入IP">
          <template slot="prepend">IP</template>
        </el-input>
      </el-form-item>
      <el-form-item
        prop="port"
        :rules="[
          { required: true, message: '请输入port', trigger: 'blur' },
          { min: 1, max: 8, message: '长度在 1 到 5 个字符', trigger: 'blur' }
        ]"
      >
        <el-input v-model="fromData.port" placeholder="请输入Port">
          <template slot="prepend">Port</template>
        </el-input>
      </el-form-item>

      <el-button id="connect" type="primary" style="margin-left:1%" @click="connectArthas('ruleFrom')">Connect</el-button>
      <el-button id="Disconnect" type="primary" style="margin-left:1%">Disconnect</el-button>
      <el-button id="OutPut" type="primary" disabled style="margin-left:1%">OutPut</el-button>
    </el-form>

    <div id="ThreadSpace" style="width: 100%">
      <h4 align="center" font-size:smaller style="width: 100%">Thread</h4>
      <!-- 最近2000ms内最繁忙的5个线程 -->
      <div id="busyThreadTable" style="width: 100%;">
        <h4 align="left" font-size:smaller style="width: 100%">Busy Thread</h4>
        <el-table
          :data="busyThreadData"
          style="width: 100%"
        >
          <el-table-column
            prop="name"
            label="name"
            width="100%"
          />
          <el-table-column
            prop="cpu"
            label="cpu"
            width="180"
          />
          <el-table-column
            prop="state"
            label="state"
            width="180"
          />
          <el-table-column
            prop="lockOwnerId"
            label="lockOwnerId"
            width="180"
          />
          <el-table-column
            prop="lockedMonitors"
            label="lockedMonitors"
            width="180"
          />
          <el-table-column
            prop="blockedCount"
            label="blockedCount"
            width="180"
          />
          <el-table-column
            prop="lockedSynchronizers"
            label="lockedSynchronizers"
            width="180"
          />
          <el-table-column
            prop="stackTrace"
            label="stackTrace"
            width="180"
          >
            <template slot-scope="scope">
              <div>
                <a href="javascript:;" target="_blank" @click="goEnviro(scope.row.stackTrace)">查看详情</a>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <!-- 查看指定状态的线程（堆叠折线图） -->
      <div id="waitingThread" style="width:90%;height:300px; margin-top:30px" />
      <div id="runnableThread" style="width:90%;height:300px;margin-top:10px" />
      <div id="timedWaitingThread" style="width:90%;height:300px;margin-top:10px" />
      <!-- 找出当前阻塞其他线程的线程 -->
      <div id="blockThread" style="width:90%;height:300px;margin-top:40px" />
    </div>

    <div id="JVMSpace" style="width: 90%;height:100%">
      <h4 align="center" font-size:smaller>JVM</h4>
      <div id="runtimeList" style="width:30%">
        <json-viewer
          :value="runtimeList"
          :expand-depth="10"
          copyable
          boxed
        />
      </div>
      <div id="ClassLoadingList" style="width:30%">
        <json-viewer
          :value="classLoadingList"
          :expand-depth="10"
          copyable
          boxed
        />
      </div>
      <div id="GarbageCollectorsList" style="width:30%">
        <json-viewer
          :value="garbageCollectorsList"
          :expand-depth="10"
          copyable
          boxed
        />
      </div>
      <div id="MemoryManagersList" style="width:30%">
        <json-viewer
          :value="memoryManagersList"
          :expand-depth="10"
          copyable
          boxed
        />
      </div>
      <div id="MemoryList" style="width:30%">
        <json-viewer
          :value="memoryList"
          :expand-depth="10"
          copyable
          boxed
        />
      </div>
      <div id="OperatingSystemList" style="width:30%">
        <json-viewer
          :value="operatingSystemList"
          :expand-depth="10"
          copyable
          boxed
        />
      </div>
    </div>

    <div id="ClassLoaderSpace" style="width: 100%">
      <h4 align="center" font-size:smaller>ClassLoader</h4>
    </div>

  </div>
</template>

<script>
import * as echarts from 'echarts'
import { arthasRequest } from '@/api/arthas'

export default {
  name: 'App',
  data() {
    return {
      // websocket
      path: 'ws://localhost:9521/arthas_request',
      socket: '',
      busyThreadData: [],
      runtimeList: [],
      ClassLoadingList: [],
      CompilationList: [],
      GarbageCollectorsList: [],
      MemoryManagersList: [],
      MemoryList: [],
      OperatingSystemList: [],
      timedWaitingThreadsLegend: [],
      timedWaitingThreadsSeriesData: [],
      timedWaitingThreadsxAxis: [],
      runnbaleThreasdxAxis: [],
      runnbaleThreadsLegend: [],
      runnbaleThreadsSeriesData: [],
      waitingThreasdxAxis: [],
      waitingThreadsLegend: [],
      waitingThreadsSeriesData: [],
      blockThreadsLegend: [],
      blockThreadsSeriesData: [],
      blockThreadsxAxis: [],
      fromData: {
        ip: 'http://localhost',
        port: '8563'
      },
      arthasRequestParam: {
        host: '',
        url: '/api',
        action: '',
        command: '',
        requestId: '',
        execTimeout: '',
        sessionId: '',
        consumerId: ''
      }
    }
  },

  mounted() {
    this.drawRrnnableThreadsStatus()
    this.drawWaitingThreadsStatus()
    this.drawTimedWaitingThreadsStatus()
    this.drawBlockThreads()
    this.init()
  },

  methods: {
    // arthas链接请求
    async connectArthas(ruleFrom) {
      // 表单检查
      var checkValue = false
      this.$refs[ruleFrom].validate((valid) => {
        if (!valid) {
          this.$message.error('IP或Port异常,请检查!')
          return false
        } else {
          checkValue = true
        }
      })
      if (checkValue === true) {
        this.arthasRequestParam.host = this.fromData.ip.trim() + ':' + this.fromData.port.trim()
        this.arthasRequestParam.action = 'exec'
        this.arthasRequestParam.command = 'version'

        var response = await arthasRequest(this.arthasRequestParam)

        if (response !== null || response !== undefined) {
          if (response.code === 200) {
            var results = response.data.body.results
            results.forEach(element => {
              if (element.type === 'version') {
                this.$message({ message: '连接成功, 版本: ' + element.version, type: 'success' })
                return
              }
            })
          } else {
            this.$message.error('连接失败:' + response.message)
          }
        } else {
          this.$message({
            message: '响应数据为空',
            type: 'warning'
          })
        }
      }
    },
    // 线程运行状态
    drawRrnnableThreadsStatus() {
      const threadsStatusChart = echarts.init(
        document.getElementById('runnableThread')
      )
      const baseLineChartoption = {
        title: {
          text: 'Runnable Thread'
        },
        tooltip: {
          trigger: 'axis'
        },
        // legend: {
        // data: this.runnbaleThreadsLegend
        // },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: this.runnbaleThreasdxAxis
        },
        yAxis: {
          type: 'value'
        },
        series: this.runnbaleThreadsSeriesData
      }
      threadsStatusChart.setOption(baseLineChartoption)
    },
    // waiting 状态线程
    drawWaitingThreadsStatus() {
      const threadsStatusChart = echarts.init(
        document.getElementById('waitingThread')
      )
      const baseLineChartoption = {
        title: {
          text: 'Waiting Thread'
        },
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          data: this.waitingThreadsLegend
          // data: ['WAITING','RUNNABLE','TIMED_WAITING']
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: this.waitingThreasdxAxis
        },
        yAxis: {
          type: 'value'
        },
        series: this.waitingThreadsSeriesData
      }
      threadsStatusChart.setOption(baseLineChartoption)
    },
    // TIMED_WAITING 状态线程
    drawTimedWaitingThreadsStatus() {
      const threadsStatusChart = echarts.init(
        document.getElementById('timedWaitingThread')
      )
      const baseLineChartoption = {
        title: {
          text: 'Timed Waiting Thread'
        },
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          data: this.timedWaitingThreadsLegend
          // data: ['WAITING','RUNNABLE','TIMED_WAITING']
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: this.timedWaitingThreasdxAxis
        },
        yAxis: {
          type: 'value'
        },
        series: this.timedWaitingThreadsSeriesData
      }
      threadsStatusChart.setOption(baseLineChartoption)
    },
    // block 状态线程
    drawBlockThreads() {
      const blockThreadsLineChart = echarts.init(
        document.getElementById('blockThread')
      )
      const blcokThreadOption = {
        title: {
          text: 'Blocking Thread'
        },
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          data: this.blockThreadsLegend
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        toolbox: {
          feature: {
            saveAsImage: {}
          }
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: this.blockThreadsxAxis
        },
        yAxis: {
          type: 'value'
        },
        series: this.blockThreadsSeriesData
      }
      blockThreadsLineChart.setOption(blcokThreadOption)
    },
    // 最忙的5个线程

    init: function() {
      if (typeof WebSocket === 'undefined') {
        alert('您的浏览器不支持socket')
      } else {
        this.socket = new WebSocket(this.path)
        this.socket.onopen = this.open
        this.socket.onerror = this.error
        this.socket.onmessage = this.getMessage
        this.socket.colse = this.colse
      }
    },
    open: function() {
      console.log('socket连接成功')
      this.send(JSON.stringify(this.fromData)) // 前端传递时间戳(执行测试的时间)
    },
    error: function() {
      console.log('连接错误')
    },
    getMessage: function(msg) {
      const data = msg.data
      this.parsSocketMessage(data)
    },
    send(params) {
      this.socket.send(params)
    },
    close: function() {
      console.log('socket已经关闭')
    },
    destroyed() {
      this.socket.onclose = this.close
    },

    // 跳转新页面
    goEnviro(stackTraceData) {
      console.log(stackTraceData)
      if (stackTraceData !== undefined) {
        const routerData = this.$router.resolve({
          // name: 'stackTrace',
          path: '/stackTrace',
          query: {
            data: JSON.stringify(stackTraceData)
          }
        })
        window.open(routerData.href, '_blank')
      }
    },
    /**
     * 毫秒时间转换为HH:MM:SS
     */
    timeTransformation(timeSample) {
      var date = new Date(timeSample)
      var time =
        date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds()
      return time
    },

    // 解析socket接收数据
    parsSocketMessage(data) {
      const results = JSON.parse(data)
      // 遍历结果根据Key值进行赋值
      for (var key in results) {
        var json = JSON.parse(results[key])
        switch (key) {
          case 'jvm':
            this.garbageCollectorsList = json.garbageCollectorsList
            this.operatingSystemList = json.operatingSystemList
            this.runtimeList = json.runtimeList
            this.classLoadingList = json.classLoadingList
            this.compilationList = json.compilationList
            this.memoryManagersList = json.memoryManagersList
            this.memoryList = json.memoryList
            break
          case 'thread -i 1000 -n 5':
            this.busyThreadData = json
            break
          case 'thread --state BLOCKED':
            break
          case 'thread --state RUNNABLE':
            console.log(json)
            console.log('json.series = ')
            console.log(this.runnbaleThreadsSeriesData)
            this.runnbaleThreasdxAxis.push(json.xAxis)
            this.runnbaleThreadsSeriesData.push(json.series)
            // this.runnbaleThreadsLegend.push(json.legendData)
            this.drawRrnnableThreadsStatus()
            break
          case 'thread --state WAITING':
            break
          case 'thread –-state TIMED_WAITING':
            // this.timedWaitingThreadsLegend.push(json.legendData)
            // this.timedWaitingThreadsSeriesData.push(json.series)
            // this.timedWaitingThreadsxAxis.push(json.xAxis)
            // this.drawTimedWaitingThreadsStatus()
            break
        }
      }
      // this.busyThreadsSeriesData = data.series
      // this.busyThreadsLegend = data.legend
      // this.busyThreadsxAxis = data.xAxis
    }
  }

}
</script>

<style lang="scss" scoped>

#runtimeList, #ClassLoadingList,#CompilationList,
#GarbageCollectorsList,#MemoryManagersList,#MemoryList,
#OperatingSystemList{
    display: inline-block;
}

.dashboard {
  &-container {
    margin: 30px;
  }
  &-text {
    font-size: 30px;
    line-height: 46px;
  }
}
.dashboard-container {
  display: flex;
  flex-direction: row; //由左向右排列
  flex-wrap: wrap; //换行,且第一行在上方
  justify-content: flex-start; //左对齐
  flex-grow: 1; //平均分配项目控件(默认为0)
  flex-basis: auto; //分配多余控件
  // flex-shrink: 1;//等比缩小
}
</style>
