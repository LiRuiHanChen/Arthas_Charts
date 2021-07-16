<template>
<div class="app-container">
  <!-- 搜索栏 -->
  <div id="statistics" style="width:100%;hight:auto">
    <el-form>
      <!--label-width="10%"-->
      <el-form-item label="接口名">
        <!-- <el-col :span="6">
          <el-input ref="seraceUrl" placeholder="请输入url" size="medium" prefix-icon="el-icon-search" v-model="url"></el-input>
        </el-col> -->
        <el-cascader
          v-model= "urlSearchArr"
          :options= "search_options"
          :props= "{ expandTrigger: 'hover'}"
          @change= "handleChange"
          style= "width:25%; margin-left:5px"
        ></el-cascader>
        <el-button style="margin-left:10px" icon="el-icon-search" type="primary" @click="onSubmit('form')">搜索</el-button>
        <el-button type="primary" icon="el-icon-circle-plus" @click="addScene">添加</el-button>
      </el-form-item>
    </el-form>
  </div>
  <!-- 列表 -->
  <div>
    <el-table :data="tableData" border style="width: 100%">
      <el-table-column prop="id" label="id"></el-table-column>
      <el-table-column prop="sceneId" label="场景Id"></el-table-column>
      <el-table-column prop="serviceName" label="服务名"></el-table-column>
      <el-table-column prop="url" label="url"></el-table-column>
      <el-table-column prop="description" height="20" label="描述"></el-table-column>
      <!-- <el-table-column prop="beforeUrl" label="前置依赖url"></el-table-column>
      <el-table-column prop="afterUrl" label="后置依赖url"></el-table-column>
      <el-table-column prop="needInfo" label="传入请求参数"></el-table-column>
      <el-table-column prop="needCondition" label="触发条件"></el-table-column>
      <el-table-column prop="requiredResponse" label="需要获取信息"></el-table-column> -->
      <el-table-column prop="createTime" :formatter="dateFormat" label="创建时间"></el-table-column>
      <el-table-column prop="updateTime" :formatter="dateFormat" label="更新时间"></el-table-column>
      <el-table-column prop="update" label="操作" align="center">
        <template slot-scope="scope" class="operation-column">
            <el-button size="mini" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
            <el-button size="mini" @click="runTestCase()">运行</el-button>
            <el-button size="mini" @click="rowClick(scope.row)">关系图</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>

    <el-dialog
      title
      :visible.sync="centerDialogVisible"
      width="50%"
      center
      ref="dailog"
      @opened="drawTopoChar"
    >
      <div id="topo" ref="chart" style="width: 100%;height:300%;"></div>
    </el-dialog>
    <!-- 添加场景信息 -->
    <el-dialog :visible.sync="addSceneDialogVisible" width="80%" center ref="dailog">
      <div>
        <el-button type="primary" icon="el-icon-circle-plus" @click="addForm">新增</el-button>
        <el-button type="primary" icon="el-icon-success" @click="saveScene">保存</el-button>
      </div>

      <div v-for="(item, index) in addList" :key="index">
        <el-form
          :inline="true"
          :model="form"
          :label-position="labelPosition"
          label-width="80px"
          :rules="rules"
          ref="form"
          style="margin-top:10px"
        >
          <el-form-item label="接口名">
            <el-autocomplete
            class="inline-input"
            v-model="item.url"
            :fetch-suggestions="querySearch"
            placeholder="请输入接口名"
            @select="handleSelect"
          ></el-autocomplete>
          </el-form-item>
          <el-form-item label="描述">
            <el-input
              type="text"
              placeholder="请输入描述信息"
              v-model="item.description"
              maxlength="50"
              show-word-limit="true"
              style="width:100%"
            ></el-input>
          </el-form-item>
          <el-form-item label="前置接口">
            <el-autocomplete
            class="inline-input"
            v-model="item.beforeUrl"
            :fetch-suggestions="querySearch"
            placeholder="请输入前置接口名"
            @select="handleSelect"
          ></el-autocomplete>
          </el-form-item>
          <el-form-item label="后置接口">
            <el-autocomplete
            class="inline-input"
            v-model="item.afterUrl"
            :fetch-suggestions= "querySearch"
            placeholder= "请输入后置接口名"
            @select= "handleSelect"
          ></el-autocomplete>
          </el-form-item>
          <el-form-item label="触发条件">
            <el-input v-model="item.needCondition" style="width:100%" placeholder="请输入触发条件"></el-input>
          </el-form-item>
          <el-form-item label="请求头">
            <el-input
              style="width:95%"
              type="textarea"
              :rows="1"
              placeholder="请输入请求头"
              v-model="item.header"
            ></el-input>
          </el-form-item>
          <el-form-item label="需要数据">
            <el-input v-model="item.requiredResponse" style="width:95%" placeholder="请输入需要提取的数据"></el-input>
          </el-form-item>
          <el-form-item label="目标接口">
            <el-checkbox v-model="item.testedObject"></el-checkbox>
          </el-form-item>
          <el-form-item label="请求数据" >
            <editor
              v-model="item.requestData"
              @init="editorInit"
              lang="json"
              theme="chrome"
              width="400"
              height="100"
            ></editor>
          </el-form-item>
          <el-button type="danger" icon="el-icon-delete" @click="deleteItem">删除表单</el-button>
        </el-form>
      </div>
    </el-dialog>

    <el-button-group align="right">
      <el-button type="primary" icon="el-icon-arrow-left" @click="runTestCase()">上一页</el-button>
      <el-button type="primary">
        下一页
        <i class="el-icon-arrow-right el-icon--right"></i>
      </el-button>
    </el-button-group>
  </div>
</template>

<script>
import {
  mapGetters
} from "vuex";
import {
  fork
} from "child_process";
import {
  getScene,
  saveScene
} from "@/api/scene";
import {
  getCascadeInfo
} from "@/api/testData";
import { getUrlList} from "@/api/interface"
import moment from "moment";
import echarts from "echarts";
import { isNull } from 'util';

export default {
  components: {
    editor: require("vue2-ace-editor")
  },
  data() {
    return {
      rules: {},
      labelPosition: "left",
      url: "",
      row: {},
      tableData: [],
      response: null,
      topoText: "", //被测接口的description属性
      topoData: [], //单独接口信息和位置参数
      topoLinks: [], //接口依赖关系
      centerDialogVisible: false, //弹框状态
      addSceneDialogVisible: false, //添加场景弹框
      totalData: [], //响应数据
      sceneId: "",
      search_options: [],
      dataList: [],
      form: {
        url: '',
        requestData: "",
        testedObject: true,
        header: "",
        needInfo: "",
        requiredResponse: "",
        description: "",
        beforeUrl: "",
        afterUrl: "",
        needCondition: "",
        assertSample: ""
      },
      addList: [],
      restaurants: [],
      urlSearchArr: [],
    };
  },
  methods: {
    //编辑场景信息
    async handleEdit(index, row) {
      var tempUrl = row.url
      var tempSceneId = row.sceneId
      var response = await getScene("",tempSceneId);
      if(response !== null){
        this.addList = response.data
        this.addSceneDialogVisible = true;

      }
    },
    handleSelect(item) {
    },
    querySearch(queryString, cb) {
      var restaurants = this.restaurants;
      var results = queryString ? restaurants.filter(this.createFilter(queryString)) : restaurants;
      // 调用 callback 返回建议列表的数据
      cb(results);
    },
    createFilter(queryString) {
      return (restaurant) => {
        return (restaurant.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0);
      };
    },
    //动态添加表单
    addForm() {
      var addJsonData ={
        url: '',
        requestData: "",
        testedObject: false,
        header: "",
        needInfo: "",
        requiredResponse: "",
        description: "",
        beforeUrl: "",
        afterUrl: "",
        needCondition: "",
        assertSample: ""
      };
      this.addList.push(addJsonData);
    },
    async saveScene() {
      var saveResponse = await saveScene(this.addList);

      if (saveResponse.code === 10000) {
        this.$message({
          message: '保存成功',
          type: 'success'
        });
      } else {
        this.$message.error('保存失败:' + saveResponse.message);
      }
    },
    //动态删除表单
    deleteItem(index) {
      this.addList.splice(index, 1);
    },
    //添加场景信息
    addScene() {
      this.addSceneDialogVisible = true;
      this.addList = [];
      this.addList.push(this.form); //添加默认的form表单
    },
    async getUrlList(){
      var response = await getUrlList("","");
      if (response.code === 10000) {
        this.restaurants = response.data;
      }
    },
    handleChange(value){
      this.url = this.urlSearchArr[value.length-1];
    },
    //异步获取级联信息
    async getCascade() {
      var response = await getCascadeInfo();
      if (response.code === 10000) {
        this.search_options = response.data;
      }
    },
    dateFormat: function(row, column) {
      if (column != undefined) {
        var date = row[column.property];
        if (date == undefined) {
          return "";
        }
        return moment(date).format("YYYY-MM-DD HH:mm:ss");
      }
    },
    async onSubmit() {
      this.response = await getScene(this.url);
      if (this.response != null) {
        this.fetchData(this.response);
      }
    },
    fetchData(responseData) {
      var data = JSON.stringify(responseData);
      var json = JSON.parse(data);
      if (json != null) {
        var code = json.code;
        if (code === 10000) {
          this.tableData = [];
          if (json.data != null) {
            this.totalData = json.data;
            //只显示被测试接口
            json.data.forEach(element => {
              if (element.testedObject === true) {
                this.sceneId = element.sceneId;
                this.topoText = element.description;
                this.tableData.push(element);
              }
            });
          }
        }
      }
    },
    filters_by_scene_id(scene_id) {
      //判断避免为空
      if (scene_id !== 0) {
        this.sceneId = scene_id;
        //清空原有数据
        this.topoData.length = 0;
        this.topoLinks.length = 0;
        let x_value = 100; //x轴起始位置

        for (var j = 0, len = this.totalData.length; j < len; j++) {
          if (this.totalData[j].sceneId === this.sceneId) {
            //通过比较sceneId避免数据错误
            let y_value = 200;
            let category;
            if (this.totalData[j].testedObject) {
              this.topoText = this.totalData[j].description;
              category = 2;
            } else {
              category = 1;
            }
            var data_json = {
              name: this.totalData[j].url,
              x: x_value,
              y: y_value,
              draggable: true,
              category: category
            };
            this.topoData.push(data_json);
            x_value = x_value + 100;

            let target;
            let source;
            let link_value = "";
            //当数组长度=1或者当前元素为最后一个元素时直接获取url
            if (this.totalData.length === 1 || j === len - 1) {
              target = this.totalData[j].url;
              source = this.totalData[j].url;
            } else {
              source = this.totalData[j].url;
              target = this.totalData[j + 1].url;
            }
            //输入参数和触发条件
            // if(this.totalData[j].needInfo !== ''){
            //   link_value = link_value + this.parseNeedInfoToString(this.totalData[j].needInfo)
            // }
            // if(this.totalData[j].needCondition!== ''){
            //   link_value =link_value + this.parseConditionToString(this.totalData[j].needCondition)
            // }
            var links_json = {
              source: source,
              target: target,
              value: link_value
            };
            this.topoLinks.push(links_json);
          }
        }
      }
    },
    rowClick: function(row) {
      this.centerDialogVisible = true;
      this.row = row;
    },
    // 拓扑图
    drawTopoChar() {
      if (this.row !== undefined) {
        this.filters_by_scene_id(this.row.sceneId);
      }
      let topoOption = {
        title: {
          text: this.topoText
        },
        tooltip: {
          trigger: "item",
          formatter: this.char_format(this.row.sceneId)
        },
        animationDurationUpdate: 1500,
        animationEasingUpdate: "quinticInOut",
        toolbox: {
          feature: {
            restore: {},
            saveAsImage: {}
          }
        },
        series: [{
          type: "graph",
          layout: "none",
          symbolSize: 50, //关系图节点标记的大小
          roam: true,
          label: {
            show: true
          },
          edgeSymbol: ["circle", "arrow"], //指向箭头的方向
          edgeSymbolSize: [15, 25],
          edgeLabel: {
            normal: {
              show: true,
              textStyle: {
                fontSize: 11
              },
              formatter: "{c}" //箭头上的文字信息
            }
          },
          categories: [{
              name: "依赖接口",
              itemStyle: {
                normal: {
                  color: "#009800"
                }
              }
            },
            {
              name: "被测接口",
              itemStyle: {
                normal: {
                  color: "#4592FF"
                }
              }
            }
          ],
          data: this.topoData, //同一场景id的接口对象
          links: this.topoLinks, //关系:source -> target
          //线属性
          lineStyle: {
            opacity: 0.9,
            width: 2,
            curveness: 0
          }
        }]
      };
      var bar_dv = this.$refs.chart;
      if (bar_dv) {
        let drawTopoChar = this.$echarts.init(bar_dv);
        drawTopoChar.setOption(topoOption);
      }
    },

    parseNeedInfoToString(needInfo) {
      if (needInfo.length <= 0) return "";
      let str = "参数:";
      var infoList = JSON.parse(needInfo);
      for (var j = 0, len = infoList.length; j < len; j++) {
        str = str + infoList[j].key + "=" + infoList[j].value + ";";
      }
      return str;
    },
    parseConditionToString(needCondition) {
      if (needCondition.length <= 0) return "";
      let str = "触发条件:";
      var conditionList = JSON.parse(needCondition);
      for (var j = 0, len = conditionList.length; j < len; j++) {
        str =
          str +
          conditionList[j].key +
          conditionList[j].condition +
          conditionList[j].value +
          ";";
      }
      return str;
    },
    char_format(scene_id) {
      if (scene_id !== 0) {
        var needInfo = "";
        var needCondition = "";

        for (var j = 0, len = this.totalData.length; j < len; j++) {
          if (this.totalData[j].sceneId === scene_id) {
            // if(this.totalData[j].needInfo){
            //   needInfo = this.parseNeedInfoToString(this.totalData[j].needInfo)
            // }
            if (this.totalData[j].needCondition) {
              needCondition = this.parseConditionToString(
                this.totalData[j].needCondition
              );
            }
          }
          return needInfo + needCondition;
        }
      }
    },
    //运行测试case,跳转新页面
    runTestCase() {
      let routeData = this.$router.resolve({
        name: "runTestCase",
        query: {
          scene_id: this.sceneId
        }
      });
      window.open(routeData.href, "_blank");
    },
    editorInit: function() {
      require("brace/ext/language_tools"); //language extension prerequsite...
      require("brace/mode/json");
      require("brace/mode/javascript"); //language
      require("brace/mode/less");
      require("brace/theme/chrome");
      require("brace/snippets/javascript"); //snippet
    }
  },
  mounted() {
    this.getCascade();
    this.restaurants = this.getUrlList();
  }
};
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

