<template>
  <div class="app-container">
    <div class="block">
      <el-form>
        <!--label-width="10%"-->
        <el-form-item label="模块名">
          <el-autocomplete
            class="inline-input"
            v-model="search_name"
            :fetch-suggestions="querySearch"
            placeholder="请输入模块名"
            @select="handleSelect"
            style="width:25%"
          ></el-autocomplete>
          <el-button type="primary" icon="el-icon-search" @click= "searchData">搜索</el-button>
          <!-- <el-button type="primary" icon="el-icon-circle-plus">添加</el-button> -->
        </el-form-item>
      </el-form>

      <div>
        <el-table
          v-loading="loading"
          element-loading-text="数据生成中"
          element-loading-spinner="el-icon-loading"
          element-loading-background="rgba(0, 0, 0, 0.8)"
          :data="documentList"
          border
          style="width: 100%; margin-top:10px">
          <el-table-column type="index" label="id" width="80" align="center"></el-table-column>
          <el-table-column label="模块名" align="center">
            <template slot-scope="scope">
              <span>{{ scope.row.modelName }}</span>
            </template>
          </el-table-column>
          <el-table-column width="120" label="创建时间" align="center">
            <template slot-scope="scope">
              <span>{{ formatDate(scope.row.createTime) }}</span>
            </template>
          </el-table-column>
          <el-table-column width="120" label="更新时间" align="center">
            <template slot-scope="scope">
              <span>{{ formatDate(scope.row.updateTime) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="update" label="操作" width="150%" align="center">
            <template slot-scope="scope">
              <div class="operation">
                <el-button icon="el-icon-edit" size="mini" @click="edit(scope.$index, scope.row)">查看</el-button>
                <el-button icon="el-icon-edit" size="mini" @click="generatedInterface(scope.$index, scope.row)">生成接口</el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <el-button-group align="right">
        <el-button type="primary" icon="el-icon-arrow-left">上一页</el-button>
        <el-button type="primary">
          下一页
          <i class="el-icon-arrow-right el-icon--right"></i>
        </el-button>
      </el-button-group>
    </div>
  </div>
</template>

<script>
import { getModelNameToList, modelList} from "@/api/document";

export default {
  data() {
    return {
      loading: false,
      restaurants: [],
      search_name: "",
      documentList:[],
      offset:1,
      limit:20,
    };
  },
  methods: {
    formatDate(timeSimple) {
      var now=new Date(timeSimple);
      var year=now.getFullYear();  //取得4位数的年份
      var month=now.getMonth()+1;  //取得日期中的月份，其中0表示1月，11表示12月
      var date=now.getDate();      //返回日期月份中的天数（1到31）
      var hour=now.getHours();     //返回日期中的小时数（0到23）
      var minute=now.getMinutes(); //返回日期中的分钟数（0到59）
      var second=now.getSeconds(); //返回日期中的秒数（0到59）
      return year+"-"+month+"-"+date+" "+hour+":"+minute+":"+second;
    },
    querySearch(queryString, cb) {
      var restaurants = this.restaurants;
      var results = queryString
        ? restaurants.filter(this.createFilter(queryString))
        : restaurants;
      // 调用 callback 返回建议列表的数据
      cb(results);
    },
    createFilter(queryString) {
      return restaurant => {
        return (
          restaurant.value.toLowerCase().indexOf(queryString.toLowerCase()) ===
          0
        );
      };
    },
    handleSelect(item) {
    },
    async searchData() {
      var searchResponse = await getModelNameToList(this.search_name, this.offset, this.limit)
      if(searchResponse !==null || searchResponse !== 'undefined'){
         if(searchResponse.code === 10000){
           this.documentList = searchResponse.data
         }
      }
    },
    async getModelList() {
      var response = await modelList();
      if (response.code === 10000) {
        this.restaurants = response.data;
      }
    },
    edit(index,row){
      var documentId = row.id
      let routerData = this.$router.resolve({
        name: "editDocument",
        query: {
          documentId: documentId
        }
      });
      window.open(routerData.href, "_blank");
    },
    generatedInterface(index,row){
      //调用后端接口时通过response code状态处理loding状态
      var document_id = row.id

    }
  },
  mounted() {
    this.getModelList();
  }
};
</script>
