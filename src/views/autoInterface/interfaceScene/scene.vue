<template>
  <div class="app-container">
    <!-- 搜索栏 -->
    <div id="statistics" style="width:100%;hight:auto">
      <el-form :inline="true" class="demo-form-inline">
        <el-form-item label="用例名">
          <el-input ref="seraceTestCase" v-model="form.caseName" placeholder="请输入用例名" size="medium" prefix-icon="el-icon-search" />
        </el-form-item>
        <el-form-item label="学段">
          <el-select v-model="form.stage" placeholder="请选择">
            <el-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="学科">
          <el-select v-model="form.subject" placeholder="请选择">
            <el-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button style="margin-left:10px" icon="el-icon-search" type="primary" @click="onSubmit()">搜索</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-circle-plus" @click="addDialog">添加</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-circle-plus" @click="runTestCase()">运行</el-button>
        </el-form-item>
      </el-form>
    </div>
    <!-- 列表 -->
    <div style="width:100%">
      <el-table :data="tableData" style="width: 100%" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="id" />
        <el-table-column prop="caseName" label="名称" />
        <el-table-column prop="stage" label="学段" />
        <el-table-column prop="subject" label="学科" />
        <el-table-column prop="requestBody" label="请求数据">
          <template slot-scope="scope">
            <span>{{ scope.row.requestBody | ellipsis }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="expectValue" label="期望结果" />
        <el-table-column prop="createTime" :formatter="dateFormat" label="创建时间" />
        <el-table-column prop="updateTime" :formatter="dateFormat" label="更新时间" />
        <el-table-column prop="update" label="操作" align="center">
          <template slot-scope="scope" class="operation-column">
            <el-button size="mini" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
            <!-- <el-button size="mini" @click="runTestCase()">运行</el-button> -->
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div style="width:100%;margin-top:10px">
      <span>运行结果展示</span>
      <editor
        ref="ec"
        v-model="shwoTestCaseResult"
        height="200"
        theme="chrome"
        width="40%;margin-top:15px"
        :options="editorOptions"
        @init="editorInit"
      />
    </div>
    <el-dialog
      :visible.sync="dialogVisible"
      width="30%"
    >
      <span slot="footer" class="dialog-footer">
        <!-- <el-button @click="dialogVisible = false">取 消</el-button> -->
        <el-form ref="saveHomeWorkRquest" :model="saveHomeWorkRquest" label-width="80px">
          <el-form-item label="名称">
            <el-input v-model="saveHomeWorkRquest.caseName" />
          </el-form-item>
          <el-form-item label="请求数据">
            <el-input v-model="saveHomeWorkRquest.requestBody" />
          </el-form-item>
          <el-form-item label="期望结果">
            <el-input v-model="saveHomeWorkRquest.expectValue" />
          </el-form-item>
        </el-form>
        <el-button type="primary" @click="saveScene(saveHomeWorkRquest)">保 存</el-button>
      </span>
    </el-dialog>

    <!-- 添加场景信息 -->
    <!-- <el-dialog ref="dailog" :visible.sync="addSceneDialogVisible" width="80%" center> -->
    <!-- <div> -->
    <!-- <el-button type="primary" icon="el-icon-circle-plus" @click="addForm">新增</el-button> -->
    <!-- <el-button type="primary" icon="el-icon-success" @click="saveScene">保存</el-button> -->
    <!-- </div>
    </el-dialog> -->

    <el-button-group align="right">
      <el-button type="primary" icon="el-icon-arrow-left">上一页</el-button>
      <el-button type="primary">
        下一页
        <i class="el-icon-arrow-right el-icon--right" />
      </el-button>
    </el-button-group>
  </div>
</template>

<script>
import {
  getHomeWork,
  saveHomeWork,
  // eslint-disable-next-line no-unused-vars
  runHomeWork
} from '@/api/scene'
// import moment, { now } from 'moment'

export default {
  components: {
    editor: require('vue2-ace-editor')
  },
  filters: {
    ellipsis(value) {
      if (!value) return ''
      if (value.length > 20) {
        return value.slice(0, 20) + '...'
      }
      return value
    }
  },
  data() {
    return {
      editorOptions: {
        // 设置代码编辑器的样式
        enableBasicAutocompletion: true,
        enableSnippets: true,
        enableLiveAutocompletion: true,
        tabSize: 2,
        fontSize: 10,
        showPrintMargin: false // 去除编辑器里的竖线
      },
      dialogVisible: false, // 添加按钮的弹框
      multipleSelection: [], // 列表页的选择框
      options: [{
        value: '',
        label: ''
      }],
      saveHomeWorkRquest: {
        id: 0,
        caseName: '',
        subject: 1,
        stage: 1,
        flag: 0,
        requestBody: '',
        expectValue: '',
        createTime: '',
        updateTime: ''
      },
      shwoTestCaseResult: '',
      tableData: [],
      form: {
        caseName: '',
        subject: '',
        stage: '',
        flag: 0
      }
    }
  },
  mounted() {
  },
  methods: {
    editorInit: function() {
      require('brace/theme/chrome')
      require('brace/ext/language_tools') // language extension prerequsite...
      require('brace/mode/yaml')
      require('brace/mode/json')
      require('brace/mode/less')
      require('brace/snippets/json')
    },
    handleClose(done) {
      this.$confirm('确认关闭？')
        .then(_ => {
          done()
        })
        .catch(_ => {})
    },
    // querySearch(queryString, cb) {
    //   var restaurants = this.restaurants
    //   var results = queryString ? restaurants.filter(this.createFilter(queryString)) : restaurants
    //   // 调用 callback 返回建议列表的数据
    //   cb(results)
    // },
    // createFilter(queryString) {
    //   return (restaurant) => {
    //     return (restaurant.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0)
    //   }
    // },
    // 动态添加表单
    // addForm() {
    //   var addJsonData = {
    //     url: '',
    //     requestData: '',
    //     testedObject: false,
    //     header: '',
    //     needInfo: '',
    //     requiredResponse: '',
    //     description: '',
    //     beforeUrl: '',
    //     afterUrl: '',
    //     needCondition: '',
    //     assertSample: ''
    //   }
    //   this.addList.push(addJsonData)
    // },
    // 编辑场景信息
    async handleEdit(index, row) {
      this.dialogVisible = true
      // 带原有值
      this.saveHomeWorkRquest.caseName = row.caseName
      this.saveHomeWorkRquest.expectValue = row.expectValue
      this.saveHomeWorkRquest.requestBody = row.requestBody
      this.saveHomeWorkRquest.id = row.id
    },
    // 添加弹框
    addDialog() {
      this.saveHomeWorkRquest.caseName = ''
      this.saveHomeWorkRquest.expectValue = ''
      this.saveHomeWorkRquest.requestBody = ''
      this.dialogVisible = true
    },
    // 保存场景
    async saveScene() {
      var mytime = Date.parse(new Date())

      if (this.saveHomeWorkRquest.id <= 0) {
        this.saveHomeWorkRquest.createTime = mytime
      }
      this.saveHomeWorkRquest.updateTime = mytime
      var saveResponse = await saveHomeWork(this.saveHomeWorkRquest)

      if (saveResponse.code === 200) {
        this.$message({
          message: '保存成功',
          type: 'success'
        })
        this.dialogVisible = false
      } else {
        this.$message.error('保存失败:' + saveResponse.message)
      }
    },
    // 动态删除表单
    // deleteItem(index) {
    //   this.addList.splice(index, 1)
    // },
    // async getUrlList() {
    //   var response = await getUrlList('', '')
    //   if (response.code === 10000) {
    //     this.restaurants = response.data
    //   }
    // },
    // 异步获取级联信息
    // async getCascade() {
    //   var response = await getCascadeInfo()
    //   if (response.code === 200) {
    //     this.search_options = response.data
    //   }
    // },
    dateFormat: function(row, column) {
      var date = row[column.property]
      if (date === undefined) {
        return ''
      }
      var moment = require('moment')
      return moment(date).format('YYYY-MM-DD HH:mm:ss')
    },
    async onSubmit() {
      var response = await getHomeWork(this.form.caseName, this.form.stage, this.form.subject, this.form.flag)
      if (response != null) {
        this.fetchData(response)
      }
    },
    fetchData(responseData) {
      var json = responseData
      if (json != null) {
        var code = json.code
        if (code === 200) {
          this.tableData = []
          if (json.data != null) {
            json.data.forEach(element => {
              this.tableData.push(element)
            })
          }
        }
      }
    },
    // filters_by_scene_id(scene_id) {
    //   // 判断避免为空
    //   if (scene_id !== 0) {
    //     this.sceneId = scene_id
    //     // 清空原有数据
    //     this.topoData.length = 0
    //     this.topoLinks.length = 0
    //     let x_value = 100 // x轴起始位置

    //     for (var j = 0, len = this.totalData.length; j < len; j++) {
    //       if (this.totalData[j].sceneId === this.sceneId) {
    //         // 通过比较sceneId避免数据错误
    //         const y_value = 200
    //         let category
    //         if (this.totalData[j].testedObject) {
    //           this.topoText = this.totalData[j].description
    //           category = 2
    //         } else {
    //           category = 1
    //         }
    //         var data_json = {
    //           name: this.totalData[j].url,
    //           x: x_value,
    //           y: y_value,
    //           draggable: true,
    //           category: category
    //         }
    //         this.topoData.push(data_json)
    //         x_value = x_value + 100

    //         let target
    //         let source
    //         const link_value = ''
    //         // 当数组长度=1或者当前元素为最后一个元素时直接获取url
    //         if (this.totalData.length === 1 || j === len - 1) {
    //           target = this.totalData[j].url
    //           source = this.totalData[j].url
    //         } else {
    //           source = this.totalData[j].url
    //           target = this.totalData[j + 1].url
    //         }
    //         // 输入参数和触发条件
    //         // if(this.totalData[j].needInfo !== ''){
    //         //   link_value = link_value + this.parseNeedInfoToString(this.totalData[j].needInfo)
    //         // }
    //         // if(this.totalData[j].needCondition!== ''){
    //         //   link_value =link_value + this.parseConditionToString(this.totalData[j].needCondition)
    //         // }
    //         var links_json = {
    //           source: source,
    //           target: target,
    //           value: link_value
    //         }
    //         this.topoLinks.push(links_json)
    //       }
    //     }
    //   }
    // },
    // rowClick: function(row) {
    //   this.centerDialogVisible = true
    //   this.row = row
    // },
    // 拓扑图
    // drawTopoChar() {
    //   if (this.row !== undefined) {
    //     this.filters_by_scene_id(this.row.sceneId)
    //   }
    //   const topoOption = {
    //     title: {
    //       text: this.topoText
    //     },
    //     tooltip: {
    //       trigger: 'item',
    //       formatter: this.char_format(this.row.sceneId)
    //     },
    //     animationDurationUpdate: 1500,
    //     animationEasingUpdate: 'quinticInOut',
    //     toolbox: {
    //       feature: {
    //         restore: {},
    //         saveAsImage: {}
    //       }
    //     },
    //     series: [{
    //       type: 'graph',
    //       layout: 'none',
    //       symbolSize: 50, // 关系图节点标记的大小
    //       roam: true,
    //       label: {
    //         show: true
    //       },
    //       edgeSymbol: ['circle', 'arrow'], // 指向箭头的方向
    //       edgeSymbolSize: [15, 25],
    //       edgeLabel: {
    //         normal: {
    //           show: true,
    //           textStyle: {
    //             fontSize: 11
    //           },
    //           formatter: '{c}' // 箭头上的文字信息
    //         }
    //       },
    //       categories: [{
    //         name: '依赖接口',
    //         itemStyle: {
    //           normal: {
    //             color: '#009800'
    //           }
    //         }
    //       },
    //       {
    //         name: '被测接口',
    //         itemStyle: {
    //           normal: {
    //             color: '#4592FF'
    //           }
    //         }
    //       }
    //       ],
    //       data: this.topoData, // 同一场景id的接口对象
    //       links: this.topoLinks, // 关系:source -> target
    //       // 线属性
    //       lineStyle: {
    //         opacity: 0.9,
    //         width: 2,
    //         curveness: 0
    //       }
    //     }]
    //   }
    //   var bar_dv = this.$refs.chart
    //   if (bar_dv) {
    //     const drawTopoChar = this.$echarts.init(bar_dv)
    //     drawTopoChar.setOption(topoOption)
    //   }
    // },

    // parseNeedInfoToString(needInfo) {
    //   if (needInfo.length <= 0) return ''
    //   let str = '参数:'
    //   var infoList = JSON.parse(needInfo)
    //   for (var j = 0, len = infoList.length; j < len; j++) {
    //     str = str + infoList[j].key + '=' + infoList[j].value + ';'
    //   }
    //   return str
    // },
    // parseConditionToString(needCondition) {
    //   if (needCondition.length <= 0) return ''
    //   let str = '触发条件:'
    //   var conditionList = JSON.parse(needCondition)
    //   for (var j = 0, len = conditionList.length; j < len; j++) {
    //     str =
    //       str +
    //       conditionList[j].key +
    //       conditionList[j].condition +
    //       conditionList[j].value +
    //       ';'
    //   }
    //   return str
    // },
    // char_format(scene_id) {
    //   if (scene_id !== 0) {
    //     var needInfo = ''
    //     var needCondition = ''

    //     for (var j = 0, len = this.totalData.length; j < len; j++) {
    //       if (this.totalData[j].sceneId === scene_id) {
    //         // if(this.totalData[j].needInfo){
    //         //   needInfo = this.parseNeedInfoToString(this.totalData[j].needInfo)
    //         // }
    //         if (this.totalData[j].needCondition) {
    //           needCondition = this.parseConditionToString(
    //             this.totalData[j].needCondition
    //           )
    //         }
    //       }
    //       return needInfo + needCondition
    //     }
    //   }
    // },
    // 运行测试case,跳转新页面
    async runTestCase() {
      if (this.multipleSelection.length !== 0) {
        var resp = await runHomeWork(this.multipleSelection)
        if (resp.code === 200) {
          this.shwoTestCaseResult = JSON.stringify(resp.data)
        }
      } else {
        this.$message({
          message: '请选择数据源',
          type: 'warning'
        })
      }
      // const routeData = this.$router.resolve({
      //   name: 'runTestCase',
      //   query: {
      //     scene_id: this.sceneId
      //   }
      // })
      // window.open(routeData.href, '_blank')
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
    }
    // editorInit: function() {
    //   require('brace/ext/language_tools') // language extension prerequsite...
    //   require('brace/mode/json')
    //   require('brace/mode/javascript') // language
    //   require('brace/mode/less')
    //   require('brace/theme/chrome')
    //   require('brace/snippets/javascript') // snippet
    // }
  }
}
</script>

<style lang="scss" scoped>
.line {
  text-align: center;
}
.operation-column {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: flex-start;
  flex-grow: 1;
  flex-basis: auto;
  flex-shrink: 1;
}
</style>

