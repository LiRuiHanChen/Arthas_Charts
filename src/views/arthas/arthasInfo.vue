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
      <!-- 最近2000ms内最繁忙的5个线程 -->
      <div id="busyThreadTable" style="width: 100%;">
        <h4 align="left" font-size:smaller style="width: 100%">Top 5 Busiest Threads</h4>
        <el-table
          :data="busyThreadData"
          style="width: 100%"
        >
          <el-table-column
            prop="name"
            label="NAME"
          />
          <el-table-column
            prop="cpu"
            label="CPU%"
          />
          <el-table-column
            prop="state"
            label="State"
          />
          <el-table-column
            prop="lockOwnerId"
            label="LockOwnerId"
          />
          <el-table-column
            prop="lockedMonitors"
            label="LockedMonitors"
          />
          <el-table-column
            prop="blockedCount"
            label="BlockedCount"
          />
          <el-table-column
            prop="lockedSynchronizers"
            label="LockedSynchronizers"
          />
          <el-table-column
            prop="stackTrace"
            label="StackTrace"
          >
            <template slot-scope="scope">
              <div>
                <a href="javascript:;" target="_blank" @click="goEnviro(scope.row.stackTrace)">查看详情</a>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <!-- 查看指定状态的线程 -->
      <div id="runnableThread" style="width:95%;margin-top:40px">
        <h4 align="left" font-size:smaller style="width: 100%">All Thread</h4>
        <el-table
          :data="runnableThreadTableData.filter(data => !runnableThreadSearch || data.name.toLowerCase().includes(runnableThreadSearch.toLowerCase()))"
          style="width: 100%"
        >
          <el-table-column
            prop="id"
            label="ID"
            width="90%"
          />
          <el-table-column
            prop="cpu"
            sortable
            label="CPU"
            width="90"
          />
          <el-table-column
            prop="deltaTime"
            sortable
            label="DeltaTime"
            width="90"
          />
          <el-table-column
            prop="name"
            label="ThreadName"
            width="300%"
          />
          <el-table-column
            prop="state"
            sortable
            label="State"
          />
          <el-table-column
            prop="interrupted"
            :formatter="formatBoolean"
            sortable
            label="Interrupted"
          />
          <el-table-column
            prop="group"
            sortable
            label="Group"
          />
          <el-table-column
            prop="priority"
            sortable
            label="Priority"
          />
          <el-table-column
            prop="time"
            sortable
            label="Time"
          />
          <el-table-column
            align="right"
          >
            <template slot="header" slot-scope="scope">
              <el-input
                v-model="runnableThreadSearch"
                size="mini"
                placeholder="输入线程名搜索"
              />
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <div id="JVMSpace" style="width: 90%;height:100%;margin-top:40px">
      <h4 align="left" font-size:smaller>Memory (GB)</h4>
      <div id="memoryTable">
        <el-table
          :data="memoryTableData.filter(data => !memorySearch || data.name.toLowerCase().includes(memorySearch.toLowerCase()))"
          style="width: 100%"
        >
          <el-table-column
            prop="name"
            label="Name"
          />
          <el-table-column
            prop="used"
            sortable
            label="Used(MB)"
          />
          <el-table-column
            prop="total"
            sortable
            label="Total(MB)"
          />
          <el-table-column
            prop="max"
            sortable
            label="Max(MB)"
          />
          <el-table-column
            align="right"
          >
            <template slot="header" slot-scope="scope">
              <el-input
                v-model="memorySearch"
                size="mini"
                placeholder="输入关键字搜索"
              />
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

  </div>
</template>

<script>
// import * as echarts from 'echarts'
import { arthasRequest } from '@/api/arthas'

export default {
  name: 'App',
  data() {
    return {
      // websocket
      path: 'ws://localhost:9521/arthas_request',
      socket: '',
      connectArthasState: false,
      runnableThreadTableData: [],
      runnableThreadSearch: '',
      memorySearch: '',
      busyThreadData: [],
      memoryTableData: [
        {
          'total': 124,
          'max': -1431306240,
          'name': 'ps_old_gen',
          'used': 34,
          'type': 'heap'
        },
        {
          'total': 71,
          'max': -1,
          'name': 'nonheap',
          'used': 68,
          'type': 'nonheap'
        }
      ],
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
    // this.init()
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
                this.connectArthasState = true
                this.init()
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
    init: function() {
      if (typeof WebSocket === 'undefined') {
        alert('您的浏览器不支持socket')
      } else {
        this.socket = new WebSocket(this.path)
        this.socket.onopen = this.open
        this.socket.onerror = this.error
        this.socket.onmessage = this.getMessage
        this.socket.onclose = this.colse
      }
    },
    open: function() {
      if (this.connectArthasState) {
        this.send(JSON.stringify(this.fromData)) // 前端传递时间戳(执行测试的时间)
      }
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
    /**
     * 转换Boolean值
     */
    formatBoolean(row) {
      return row.interrupted.toString()
    },
    // 解析socket接收数据
    parsSocketMessage(data) {
      const results = JSON.parse(data)

      // 遍历结果根据Key值进行赋值
      for (var key in results) {
        var json = JSON.parse(results[key])
        switch (key) {
          case 'dashboard -i 1000 -n 1':
            this.memoryTableData = json
            break
          case 'thread -i 1000 -n 5':
            this.busyThreadData = json
            break
          case 'thread --state':
            this.runnableThreadTableData = json
            break
        }
      }
    }
  }

}
</script>

<style lang="scss" scoped>

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
