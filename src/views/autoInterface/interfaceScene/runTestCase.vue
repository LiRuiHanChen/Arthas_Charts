<template>
  <div class="app-container">
    <template>
      <el-form :inline="true" :model="runform" :rules="rules" ref="ruleForm" class="demo-ruleForm">
        <el-form-item label="域名" prop="host">
          <el-input v-model="host" style="width:350px" placeholder="请输入请求地址"></el-input>
        </el-form-item>
        <el-form-item>
          <!-- :indeterminate="isIndeterminate" -->
          <!-- <el-checkbox @change="toggleSelection()">取消全选</el-checkbox> -->
           <el-select v-model="envValue" placeholder="请选择环境">
            <el-option
              v-for="itemEnv in this.envList"
              :key="itemEnv"
              :label="itemEnv"
              :value="itemEnv">
            </el-option>
          </el-select>
          <el-select v-model="userValue" placeholder="请选择用户">
            <el-option
              v-for="itemUser in this.userList"
              :key="itemUser"
              :label="itemUser"
              :value="itemUser">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onRun">运行</el-button>
        </el-form-item>
        <el-tag>
          成功
          <svg-icon icon-class="success" />
        </el-tag>
        <el-tag>
          失败
          <svg-icon icon-class="failure" />
        </el-tag>
        <el-tag>
          未执行
          <svg-icon icon-class="nonExecution" />
        </el-tag>
      </el-form>

      <!-- table表格 -->
      <el-table
        :data="tableData"
        ref="multipleTable"
        tooltip-effect="dark"
        border
        @selection-change="handleSelectionChange"
        style="width: 100%"
      >
        <el-table-column type="selection"
        :reserve-selection="true"
        width="55"></el-table-column>
        <!-- 折叠面板中的内容 -->
        <el-table-column type="expand">
          <template slot-scope="props">
            <el-collapse v-for="(item, i) in props.row.sceneData" :key="i">
              <el-collapse-item>
                <template slot="title">
                  <!-- icon根据返回数据中flag属性决定 -->
                  <svg-icon v-if="item.flag === true" icon-class="success" />
                  <svg-icon v-else-if="item.flag === false" icon-class="failure" />
                  <svg-icon v-else icon-class="nonExecution" />
                  <!-- <span>{{props.row.method}}</span> -->
                  <span>({{item.method}})</span>
                  <span>{{item.url}}</span>
                  <span>({{item.description}})</span>
                </template>
                <div class="testdata-content">
                  <div style="width: 20%">
                    <el-tag color>Header</el-tag>
                      <!-- header以表格展示 -->
                      <el-table
                        :data="headerArr = parseHeaderToArr(item.header)"
                        border
                        tooltip-effect="dark"
                        style="width: 100%"
                      >
                      <el-table-column prop="key" label="key"></el-table-column>
                      <el-table-column prop="value" label="value"></el-table-column>
                    </el-table>
                  </div>
                  <div style="width: 20%;margin-left:5px">
                    <el-tag color>Request</el-tag>
                    <el-input
                      type="textarea"
                      :rows="4"
                      style="width:100%;height:80%"
                      v-model="item.requestData"
                    ></el-input>
                  </div>
                  <div style="width: 20%;margin-left:5px">
                    <el-tag color>Response</el-tag>
                    <el-input type="textarea" style="width:100%" :rows="4" :disabled="true" v-model="item.responseData"></el-input>
                  </div>
                  <!-- <div style="width:20%;margin-left:5px">
                    <el-tag color>Assert</el-tag>
                    <el-input
                      type="textarea"
                      :rows="4"
                      style="width:100%"
                      v-model="item.assertSample"
                    ></el-input>
                  </div> -->
                </div>
              </el-collapse-item>
            </el-collapse>
          </template>
        </el-table-column>
        <el-table-column label="id" prop="id" width="50"></el-table-column>
        <el-table-column label="描述" prop="remark"></el-table-column>
        <el-table-column label="请求头" prop="header"></el-table-column>
        <el-table-column label="请求数据" prop="requestData"></el-table-column>
        <el-table-column label="断言数据" prop="assertSample"></el-table-column>
        <el-table-column label="执行状态" width="100">
              <template slot-scope="scope">
                <span v-if ="scope.row.flag === true">成功</span>
                <span v-else-if ="scope.row.flag === false">失败</span>
                <span v-else>未执行</span>
              </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="120">
          <template slot-scope="scope">
            <el-button @click="handleClick(scope.row)" type="text" size="small">保存</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-button-group align="right">
        <el-button type="primary" icon="el-icon-arrow-left">上一页</el-button>
        <el-button type="primary">
          下一页
          <i class="el-icon-arrow-right el-icon--right"></i>
        </el-button>
      </el-button-group>
    </template>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import { fork } from "child_process";
import moment from "moment";
import echarts from "echarts";
import { log } from 'util';

export default {
  data() {
    return {
      ws_paht: "ws://localhost:8086/send/scene",
      socket: null, //建立的连接
      lockReconnect: false, //是否真正建立连接
      timeout: 28 * 1000, //30秒一次心跳
      timeoutObj: null, //心跳心跳倒计时
      serverTimeoutObj: null, //心跳倒计时
      timeoutnum: null, //断开 重连倒计时
      rules: {
        host: [{ required: true, message: "请输入请求地址", trigger: "blur" }]
      },
      envList:['test-1','test-2'],
      userList:['fdsa@huobi.com'],
      envValue:'',
      userValue:'',
      host: "http://hkex-serving-gateway.hk-local.huobiapps.com",
      runform: {
        // host: "http://hkex-serving-gateway.hk-local.huobiapps.com",
      },
      runJson:{
        "testDataList":'',
        "sceneId": '',
        "type": "run",
        "host": '',
        "envValue":'',
        "userValue":''
      },
      tableData: 
		[{
			"createTime": 1591718657000,
			"header": "{\"Accept-Language\":\"zh-CN\",\"Content-Type\":\"application/json\"}",
			"remark": "重新绑定手机接口请求信息",
			"updateTime": 1591718657000,
			"sceneData": [{
				"method": "POST",
				"requiredResponse": "",
				"description": "使用新手机，参数userType =CHANGE_PHONE, 发送短信验证码",
				"updateTime": 1589938663000,
				"needCondition": "[{\"key\":\"code\",\"value\":\"10000\",\"condition\":\"==\"}]",
				"serviceName": "用户中心",
				"url": "/uc/v1/sms_code/send",
				"needInfo": "[{\"key\":\"useType\",\"value\":\"CHANGE_PHONE\"},{\"key\":\"phone\",\"value\":\"15178292340\",\"condition\":\"=\"},{\"key\":\"countryCode\",\"value\":\"0086\"},{\"key\":\"accountName\",\"value\":\"15178292340\"}]",
				"beforeUrl": "",
				"testedObject": false,
				"createTime": 1589938663000,
				"afterUrl": "/uc/v1/sms_code/verify",
				"sceneId": 8,
				"header": "{\"Accept-Language\":\"zh-CN\",\"Content-Type\":\"application/json\"}",
				"id": 12,
				"requestData": "{\"voice\":false,\"accountName\":\"15178292340\",\"phone\":\"15178292340\",\"countryCode\":\"0086\",\"useType\":\"CHANGE_PHONE\",\"token\":\"123456\",\"afs\":{\"sig\":\"test\",\"session\":\"test\",\"platform\":3,\"token\":\"test\",\"scene\":\"test\"}}"
			}, {
				"method": "POST",
				"requiredResponse": "[{\"getRespKey\":\"data.token\",\"toUrl\":\"/uc/v1/phone/change\",\"toParameterName\":\"newPhoneToken\"}]",
				"description": "使用新手机，参数userType =CHANGE_PHONE, 进行手机的验证, 获取到new_phone_token",
				"updateTime": 1586651521000,
				"needCondition": "[{\"key\":\"code\",\"value\":\"10000\",\"condition\":\"==\"}]",
				"serviceName": "用户中心",
				"url": "/uc/v1/sms_code/verify",
				"needInfo": "[{\"key\":\"useType\",\"value\":\"CHANGE_PHONE\"},{\"key\":\"phone\",\"value\":\"15178292340\",\"condition\":\"=\"},{\"key\":\"countryCode\",\"value\":\"0086\"},{\"key\":\"accountName\",\"value\":\"15178292340\"}]",
				"beforeUrl": "",
				"testedObject": false,
				"createTime": 1586651521000,
				"afterUrl": "/uc/v1/phone/change",
				"sceneId": 8,
				"header": "{\"Accept-Language\":\"zh-CN\",\"Content-Type\":\"application/json\"}",
				"id": 13,
				"requestData": "{\"phone\":\"15178292340\",\"accountName\":\"15178292340\",\"countryCode\":\"0086\",\"smsCode\":\"123456\",\"useType\":\"CHANGE_PHONE\",\"verificationCode\":\"123456\"}"
			}, {
				"method": "POST",
				"requiredResponse": "",
				"description": "重新换绑手机接口测试",
				"updateTime": 1591720317000,
				"needCondition": "",
				"serviceName": "用户中心",
				"url": "/uc/v1/phone/change",
				"needInfo": "",
				"beforeUrl": "/uc/v1/sms_code/send",
				"testedObject": true,
				"createTime": 1591720317000,
				"afterUrl": "",
				"sceneId": 8,
				"header": "{\"Accept-Language\":\"zh-CN\",\"Content-Type\":\"application/json\"}",
				"id": 11,
				"requestData": "{\"newCountryCode\":\"0086\",\"newPhone\":\"15178292340\",\"newPhoneToken\":\"b62843a523a14e67a183fe06222cd953\",\"emailCode\": \"123456\",\"oldSmsCode\": \"123456\",\"gaCode\": \"123456\"}"
			}],
			"id": 18,
			"basic": false,
			"requestData": "{\"newCountryCode\":\"0086\",\"newPhone\":\"15178292340\",\"newPhoneToken\":\"b62843a523a14e67a183fe06222cd953\",\"emailCode\": \"123456\",\"oldSmsCode\": \"123456\",\"gaCode\": \"123456\"}",
			"urlId": 12,
			"assertSample": "[{\"condition\":\"==\",\"expectValue\":10000,\"assertKey\":\"code\"}]"
		}],
      scene_id: ""
    };
  },

  created() {
    this.getParams();
    this.initWebpack();
  },

  methods: {
    getParams() {
      // 取到路由带过来的参数
      this.scene_id = this.$route.query.scene_id;
      return this.scene_id;
    },
    initWebpack() {
      this.ws = new WebSocket(this.ws_paht);
      this.ws.onopen = this.onopen;
      this.ws.onmessage = this.onmessage;
      this.ws.onclose = this.onclose;
      this.ws.onerror = this.onerror;
    },
    //重新连接
    reconnect() {
      var that = this;
      if (that.lockReconnect) {
        return;
      }
      that.lockReconnect = true;
      //没连接上会一直重连，设置延迟避免请求过多
      that.timeoutnum && clearTimeout(that.timeoutnum);
      that.timeoutnum = setTimeout(function() {
        //新连接
        that.initWebpack();
        that.lockReconnect = false;
      }, 5000);
    },
    reset() {
      //重置心跳
      var that = this;
      //清除时间
      clearTimeout(that.timeoutObj);
      clearTimeout(that.serverTimeoutObj);
      //重启心跳
      that.start();
    },
    start() {
      //开启心跳
      var self = this;
      self.timeoutObj && clearTimeout(self.timeoutObj);
      self.serverTimeoutObj && clearTimeout(self.serverTimeoutObj);
      self.timeoutObj = setTimeout(function() {
        //这里发送一个心跳，后端收到后，返回一个心跳消息，
        if (self.ws.readyState == 1) {
          //如果连接正常
          self.ws.send("heartCheck");
        } else {
          //否则重连
          self.reconnect();
        }
        self.serverTimeoutObj = setTimeout(function() {
          //超时关闭
          self.ws.close();
        }, self.timeout);
      }, self.timeout);
    },
    onopen() {
      var sceneJson = {};
      sceneJson.type = "scene";
      sceneJson.value = this.scene_id;
      this.ws.send(JSON.stringify(sceneJson));
      // this.getNoReadRecords();
      //开启心跳
      // this.start();
    },
    onmessage(e) {
      var onMessageData = JSON.parse(e.data)
      var eventType = onMessageData.type

      switch(eventType){
        case "scene":
          this.tableData = onMessageData.tableData
          break;
        case "pong":
          //收到服务器信息，心跳重置
          console.log("pong")
          break;
        case "run":
          this.tableData = onMessageData.testDataList
          console.log("run")
          console.log(this.tableData)
          break;
      }
      // this.reset();
    },
    onclose(e) {
      console.log("连接关闭");
      console.log(
        "websocket 断开: " + e.code + " " + e.reason + " " + e.wasClean
      );
      // var msg = JSON.stringify({
      //   cmd: "out_chatting",
      //   token: this.COOKIE.getCookie("token")
      // });
      // this.ws.send(msg);
      //重连
      // this.reconnect();
    },
    onerror(e) {
      console.log("出现错误");
      //重连
      // this.reconnect();
    },
    destroyed() {
      this.socket.onclose = this.close;
    },
    onSubmit() {
      console.log("submit!");
    },
    //运行
    onRun() {
      this.runJson.sceneId =this.scene_id
      this.runJson.host = this.host
      this.runJson.userValue = this.userValue
      this.runJson.envValue = this.envValue
      this.ws.send(JSON.stringify(this.runJson));
    },
    //保存testData
    handleClick(row) {
      console.log(row);
    },
    //选择列表
    handleSelectionChange (val) {
      console.log(val)

      // if(val.length !== 0){
        //如果list为空直接添加
        // if(this.testDataList.length === 0){
          this.runJson.testDataList = val
        // }else{
          // this.testDataList.forEach(element => {
          //   if(element.id !== val.id){
          //     this.testDataList.push(val)
          //   }
          // });
        // }
      // }
    },
    // 取消全选
    toggleSelection() {
      this.$refs.multipleTable.clearSelection();
      // this.runJson.testDataList=""
    },
    //header转数组
    parseHeaderToArr(headerObject) {
      var headerArr = [];
      if (headerObject !== '' && headerObject !== undefined && headerObject !== null){
        var json = JSON.parse(headerObject);
        for (var key in json) {
          var jsonObject = {};
          jsonObject.key = key;
          jsonObject.value = json[key];
          headerArr.push(jsonObject);
        }
      }
      return headerArr;
    }
  },

  mounted() {}
};
</script>

<style scoped>
.line {
  text-align: center;
}
.demo-table-expand {
  font-size: 0;
}
.demo-table-expand label {
  width: 90px;
  color: #99a9bf;
}
.demo-table-expand .el-form-item {
  margin-right: 0;
  margin-bottom: 0;
  width: 50%;
}
.testdata-content {
  display: flex;
  flex-direction: row; /*由左向右排列*/
  flex-wrap: wrap; /*换行,且第一行在上方*/
  justify-content: flex-start; /*左对齐*/
  flex-grow: 1; /*平均分配项目控件(默认为0)*/
  flex-basis: auto; /*分配多余控件*/
  flex-shrink: 1; /*等比缩小*/
}
</style>
