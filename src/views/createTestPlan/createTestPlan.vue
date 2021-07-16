<template>
  <div id="app-container" class="app-container">
    <div class="nameList" style="width:20%">
      <el-tree
        ref="testPlanTree"
        :data="treeList"
        node-key="id"
        :props="defaultProps"
        :highlight-current="true"
        :check-on-click-node="true"
        :default-checked-keys="[1]"
        @node-click="handleNodeClick"
        default-expand-all
      ></el-tree>
    </div>
    <el-form
      ref="form"
      :model= "form"
      :label-position= "labelPosition"
      :rules= "rules"
      size= "medium"
      :inline= "true"
    >
      <!-- label-position="left" label-width="30%" -->
      <div class="creatTestPlan">
        <div v-show="showTestPlan" class="testPlan">
          <h3 align="left" font-size:smaller>Test Plan</h3>
          <el-form-item label="Plan Name" style="width:100%" prop="testPlanName" label-width="10%">
            <el-input v-model= "form.testPlanName" style="width:200%" />
          </el-form-item>
          <el-form-item label="Comments" style="width:100%" prop="testPlanComments" label-width="10%">
            <el-input v-model= "form.testPlanComments" style="width:200%"/>
          </el-form-item>
          <el-form-item label="run type" style="width:10%" prop="testPlanRunType" label-width="70%">
            <el-checkbox-group v-model= "form.testPlanRunType" style="width:100%">
              <el-checkbox
                label="run thread groups consecuively(i.e. one at a time)"
                name="type"
                value="run thread groups consecuively"
              />
              <el-checkbox
                label="run teardown thread groups after shutdown of main threads"
                name="type"
                value="run teardown thread groups after shutdown of main threads"
                checked
              />
              <el-checkbox
                label="functional test mode(i.e save Response Data and Sampler Data)"
                name="type"
                value="functional test mode"
              />
            </el-checkbox-group>
          </el-form-item>
        </div>

        <div v-show="showThreadGroup" class="threadGroup">
          <h3 align="left" font-size:smaller>Thread Group</h3>
          <el-form-item label="groupName" style="width:100%" prop="threadGroupName" label-width="10%">
            <el-input v-model= "form.threadGroupName" style="width:200%"/>
          </el-form-item>
          <el-form-item label="Comments" style="width:100%" prop="threadGroupComments" label-width="10%">
            <el-input v-model= "form.threadGroupComments" style="width:200%"/>
          </el-form-item>
          <el-form-item label="After a Sampler error" style="width:50%" prop="threadGroupResource" label-width="60%">
            <el-radio-group v-model= "form.threadGroupResource" style="width:150%">
              <el-radio label="Continue" value="Continue" checked />
              <el-radio label="Start Next Thread Loop" value="StartNextThreadLoop" />
              <el-radio label="Stop Thread" value="StopThread" />
              <el-radio label="Stop Test" value="StopTest" />
              <el-radio label="Stop Test Now" value="StopTestNow" />
            </el-radio-group>
          </el-form-item>
          <el-form-item
            label="Number of Threads"
            style="width:90%"
            label-width="14%"
            prop="threadGroupNumberThreads"
            :rules="[
              { required: true, message: '线程数量不能为空'},
              { type: 'number', message: '必须为数字值'}
            ]"
          >
            <el-input
              type="threadGroupNumberThreads"
              v-model.number="form.threadGroupNumberThreads"
              style="width:100%"
              placeholder="users"
            />
          </el-form-item>
          <el-form-item
            label="Ramp-Up Period"
            style="width:90%"
            label-width="14%"
            prop="threadGroupRampUpPeriod"
            :rules="[
              { required: true, message: '增加时间不能为空'},
              { type: 'number', message: '必须为数字值'}
            ]"
          >
            <el-input
              type="threadGroupRampUpPeriod"
              v-model.number="form.threadGroupRampUpPeriod"
              style="width:100%"
              placeholder="in seconds"
            />
          </el-form-item>
          <el-form-item
            label="Loop Count"
            label-width="14%"
            style="width:90%"
            prop="threadGroupLoopCount"
            :rules="[
              { required: false, message: '循环次数不能为空'},
              { type: 'number', message: '必须为数字值'}
            ]"
          >
            <el-input
              v-model.number="form.threadGroupLoopCount"
              style="width:70%"
              placeholder="input loop count"
            ></el-input>
            <!-- 选中时，input框disabled属性为true-->
            <el-checkbox margin-left="5px" v-model="form.threadGroupLoopForever" @change="handleForeverChange()">Infinite</el-checkbox>
          </el-form-item>
        </div>

        <div v-show="showTcpSampler" class="TcpSampler">
          <h3 align="left" font-size:smaller>Tcp Sampler</h3>
          <el-form-item label="Name" label-width="15%" style="text-align:left;width:30%">
            <el-input v-model="form.TcpSamplerName" style="width:175%" />
          </el-form-item>
          <el-form-item label="Comments" label-width="25%" style="width:45%">
            <el-input v-model="form.TcpSamplerComments" style="width:120%" />
          </el-form-item>
          <el-form-item label="TcpClient class name" label-width="13%" style="width:100%">
            <el-input v-model="form.TcpSamplerPath" style="width:120%" />
          </el-form-item>
          <el-form-item 
            label="Server Name or IP"
            style="width:30%"
            label-width="43%"
            :rules="[
              { required: true, message: 'ip或sever不能为空'}
            ]">
            <el-input v-model="form.TcpSamplerServerName" style="width:120%" />
          </el-form-item>

          <el-form-item label="Port Number" label-width="25%" style="width:45%">
            <el-input v-model="form.TcpSamplerPort" style="width:120%"/>
          </el-form-item>
          <el-form-item label="ConnectionTimeOut" label-width="43%" style="width:30%">
            <el-input
              v-model="form.TcpSamplerConnectionTimeOut"
              style="width:120%"
              placeholder="in milliseconds"
            />
          </el-form-item>
          <el-form-item label="ResponseTimeOut" label-width="25%" style="width:45%">
            <el-input
              v-model="form.TcpSamplerResponseTimeOut"
              placeholder="in milliseconds" 
              style="width:120%"
            />
          </el-form-item>
          <el-card class="box-card">
            <el-form-item style="width:80%">
                <el-checkbox-group v-model="form.type">
                  <el-checkbox label="Re-use connection" name="Re-use_connection"></el-checkbox>
                  <el-checkbox label="Close connection" name="Close_connection"></el-checkbox>
                  <el-checkbox label="Set NoDelay" name="Set_NoDelay"></el-checkbox>
                </el-checkbox-group>
            </el-form-item>
            <el-form-item label="SO_LINGER" label-width="39%" style="width:30%">
              <el-input
                v-model= "form.SO_LINGER"
                style="width:120%"
              />
            </el-form-item>
            <el-form-item label="End of line(EOL)byte value" label-width="40%" style="width:45%">
              <el-input
                v-model= "form.eolByteValue"
                style="width:70%"
              />
            </el-form-item>

            <el-form-item label="user name" label-width="39%" style="width:30%">
              <el-input
                v-model="form.TcpSamplerUserName"
                style="width:120%"
              />
            </el-form-item>
            <el-form-item label="pass word" label-width="40%"  style="width:45%">
              <el-input
                v-model="form.TcpSamplerPassWord"
                show-password
                style="width:70%"
              />
            </el-form-item>
          </el-card>
          <el-form-item class="textarea_item"
          label="send parameters with request"
          style="width:100%"
          >
            <textarea
              v-model="form.TcpSamplerRequestData"
              placeholder= "input request data"
              style= "width:300%;height: 150px"
            />
          </el-form-item>
        </div>

        <el-form-item>
          <el-button type="primary" @click="onCreateForm('form')">创建</el-button>
          <el-button @click="onResetForm('form')">重置</el-button>
        </el-form-item>
      </div>
    </el-form>
  </div>
</template>

<script>
import Vue from "vue";

export default {
  data() {
    return {
      labelPosition: 'left',
      treeList: [
        {
          id: 1,
          label: "TestPlan",
          children: [
            {
              id: 2,
              label: "Thread Group",
              children: [
                {
                  id: 3,
                  label: "Tcp Sampler"
                }
              ]
            }
          ]
        }
      ],
      defaultProps: {
        children: "children",
        label: "label"
      },
      rules: {
        testPlanName: [
          {
            required: true,
            message: "测试计划名称不能为空",
            trigger: "blur"
          },
          {
            min: 3,
            max: 20,
            message: "长度在3-20个字符",
            trigger: "blur"
          }
        ],
        testPlanRunType: [
          {
            required: true,
            message: "请选择活动资源",
            trigger: "change"
          }
        ],
        threadGroupName: [
          {
            required: true,
            message: "线程组名称不能为空",
            trigger: "blur"
          },
          {
            min: 3,
            max: 20,
            message: "长度在3-20个字符",
            trigger: "blur"
          }
        ],
        threadGroupResource: [
          {
            required: true,
            message: "请选择操作步骤",
            trigger: "change"
          }
        ]
      },
      form: {
        testPlanName: "",
        testPlanComments: "",
        testPlanRunType: [],
        threadGroupName: "",
        threadGroupComments: "",
        threadGroupResource: "",
        testGroupNumberThreads: "",
        testGroupRampUpPeriod: "",
        testGroupLoopCount: "",
        threadGroupLoopForever: false,
        threadGroupLoopCount: "",
        TcpSamplerName: "",
        TcpSamplerComments: "",
        TcpSamplerServerName: "",
        TcpSamplerPort: "",
        TcpSamplerConnectionTimeOut: "",
        TcpSamplerResponseTimeOut: "",
        TcpSamplerImplementation: "",
        TcpSamplerProtocol: "",
        TcpSamplerContentEncoding: "",
        TcpSamplerContentId: "",
        TcpSamplerPath: "",
        TcpSamplerRequestData: "",
      },
      showTestPlan: true,
      showThreadGroup: false,
      showTcpSampler: false
    };
  },
  methods: {
    handleForeverChange(item){
      console.log(item)
      this.threadGroupLoopForever=!this.threadGroupLoopForever
      console.log(this.threadGroupLoopForever)
      form.threadGroupLoopCount
    },
    handleNodeClick: function(obj, node, data) {
      if (node !== null) {
        var treeId = node.data.id;
        if (treeId == 1) {
          this.showTestPlan = true;
          this.showThreadGroup = false;
          this.showTcpSampler =  false;
        }
        if (treeId == 2) {
          this.showThreadGroup = true;
          this.showTestPlan = false;
          this.showTcpSampler = false;
        }
        if (treeId == 3) {
          this.showTcpSampler = true;
          this.showTestPlan = false;
          this.showThreadGroup = false;
        }
      }
    },
    onCreateForm(formName) {
      this.$message("submit!");
      this.$refs[formName].validate(valid => {
        if (valid) {
          alert("submit!");
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },
    onResetForm(formName) {
      this.$message({
        message: "cancel!",
        type: "warning"
      });
      this.$refs[formName].resetFields();
    }
  }
};
</script>

<style lang="scss" scoped>
.el-form-item label:after {
  content: "";
  display: inline-block;
  width: 100%;
}
.textarea_item{
  margin-top: 10px;
}

.app-container {
  display: flex;
  flex-direction: row; //由左向右排列
  //   flex-wrap: wrap; //换行,且第一行在上方
  justify-content: flex-start; //左对齐
  flex-grow: 1; //平均分配项目控件(默认为0)
  flex-basis: auto; //分配多余控件
  flex-shrink: 1; //等比缩小
  text-align: left;
}
</style>

