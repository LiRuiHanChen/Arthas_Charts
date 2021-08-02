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
      <el-button id="Disconnect" type="primary" style="margin-left:1%" @click="stopSocket()">Disconnect</el-button>
      <!-- <el-button id="OutPut" type="primary" disabled style="margin-left:1%">OutPut</el-button> -->
    </el-form>
    <el-form ref="numberValidateForm" :inline="true" :model="numberValidateForm" style="width:100%">
      <el-form-item
        prop="durationTime"
        :rules="[
          { required: true, message: '请输入持续时长'},
          { type: 'number', message: '必须为数字值'}
        ]"
      >
        <el-input v-model.number="numberValidateForm.durationTime" type="durationTime" autocomplete="off" placeholder="请输入持续时长,单位:秒">
          <template slot="prepend">Profiler</template>
        </el-input>
      </el-form-item>
      <el-form-item>
        <el-button id="profiler" type="primary" style="margin-left:1%" @click="loadProfiler(numberValidateForm)">start</el-button>
      </el-form-item>
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
      <h4 align="left" font-size:smaller>Memory</h4>
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
import { arthasRequest } from '@/api/arthas'

// 心跳检测
var heartCheck = {
  timeout: 30000, // 30秒
  timeoutObj: null,
  reset: function() { // 接收成功一次推送，就将心跳检测的倒计时重置为30秒
    clearTimeout(this.timeoutObj)// 重置倒计时
    this.start()
  },
  start: function() { // 启动心跳检测机制，设置倒计时30秒一次
    this.timeoutObj = setTimeout(function() {
      if (this.socket !== undefined || this.socket !== '') {
        var message = {}
        message.key = 'ping'
        this.send(JSON.stringify(message))// 启动心跳
      }
    }, this.timeout)
  }
  // onopen连接上，就开始start及时，如果在定时时间范围内，onmessage获取到了服务端消息，就重置reset倒计时，距离上次从后端获取消息30秒后，执行心跳检测，看是不是断了。
}
var tt

export default {
  name: 'App',
  data() {
    return {
      // websocket
      path: process.env.VUE_APP_WEB_SOCKET_API,
      lockReconnect: false,
      socket: '',
      connectArthasState: false,
      tt: '',
      runnableThreadTableData: [],
      runnableThreadSearch: '',
      memorySearch: '',
      busyThreadData: [],
      memoryTableData: [],
      arthasOutputFile: '',
      fromData: {
        ip: 'http://localhost',
        port: '8563'
      },
      numberValidateForm: {
        durationTime: ''
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
    stopSocket() {
      var data = {}
      data.key = 'stop'
      this.socket.send(JSON.stringify(data))
      this.socket.close()
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
        var json = {}
        json.key = 'version'
        json.value = this.fromData
        this.send(JSON.stringify(json))
      }
    },
    error: function() {
      console.log('连接错误')
    },
    getMessage: function(msg) {
      const data = msg.data
      this.parsSocketMessage(data)
      heartCheck.start()
    },
    send(params) {
      this.socket.send(params)
    },
    close: function() {
      console.log('socket已经关闭')
    },
    destroyed() {
      this.socket.close()
    },

    // 跳转新页面
    goEnviro(stackTraceData) {
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
    // 执行火焰图
    loadProfiler(from) {
      const tempTime = from.durationTime
      if (tempTime < 1 || tempTime > 600) {
        this.$message.error('请输入1-600范围内的值')
      } else {
        if (this.socket === '') {
          this.$message.error('arthas 未连接!')
        } else {
          var json = {}
          json.key = 'profiler start --duration'
          json.value = from.durationTime
          // 异步执行需要等待通知
          this.send(JSON.stringify(json))
          this.$message({
            message: '生成中，请等待 ' + from.durationTime + '秒',
            type: 'success'
          })
        }
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
    openNotify() {
      const h = this.$createElement
      this.$notify({
        title: 'Profiler 结果已生成',
        message: h('i', { style: 'color: teal' }, '点击查看详情'),
        type: 'success',
        duration: 0,
        // 请求后端接口打开文件
        onClick: () => {
          window.open(this.arthasOutputFile, '_blank')
        }
      })
    },
    createWebSocket() {
      try {
        this.socket = new WebSocket(this.path)
        this.init()
      } catch (e) {
        this.reconnect(this.path)
      }
    },
    // websocket 重连
    reconnect(url) {
      if (this.lockReconnect) {
        return
      }
      this.lockReconnect = true
      // 没连接上会一直重连，设置延迟避免请求过多
      tt && clearTimeout(tt)
      tt = setTimeout(function() {
        this.createWebSocket(url)
        this.lockReconnect = false
      }, 4000)
    },
    // 解析socket接收数据
    parsSocketMessage(data) {
      const results = JSON.parse(data)
      // 遍历结果根据Key值进行赋值
      for (var key in results) {
        switch (key) {
          case 'dashboard -i 1000 -n 1':
            var json = JSON.parse(results[key])
            this.memoryTableData = json
            break
          case 'thread -i 1000 -n 5':
            var busyJson = JSON.parse(results[key])
            this.busyThreadData = busyJson
            break
          case 'thread --state':
            var runnableThreadJson = JSON.parse(results[key])
            this.runnableThreadTableData = runnableThreadJson
            break
          case 'profiler start --duration':
            this.arthasOutputFile = results[key]
            // 查看文件
            this.openNotify()
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
