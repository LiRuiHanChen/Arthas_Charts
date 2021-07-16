<template>
  <div class="app-container">
    <div id= "statistics" style="width:100%;hight:auto">
      <div class= "block">
        <el-label>接口名</el-label>
        <el-cascader
          v-if= "search_options"
          v-model= "search"
          :options= "search_options"
          :props= "{ expandTrigger: 'hover'}"
          @change= "handleChange"
          style= "width:25%; margin-left:5px"
        ></el-cascader>
        <el-button type= "primary" icon= "el-icon-search" @click= "searchData()">搜索</el-button>
        <el-button type= "primary" icon= "el-icon-circle-plus" @click= "addTestData()">添加</el-button>
      </div>
    </div>
    <!-- 列表 -->
    <div>
      <el-table :data="tableData" border style="width: 100%; margin-top:10px">
        <el-table-column type="index" label="id" width="40" align="center"></el-table-column>
        <el-table-column
          label="请求头"
          width="100"
          align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.header }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="请求数据"
          align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.requestData }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="断言"
          align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.assertSample }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="描述"
          align="center">
          <template slot-scope="scope">
            <span>{{scope.row.remark}}</span>
          </template>
        </el-table-column>
        <el-table-column prop="update" label="操作" width="180" align="center">
          <template slot-scope="scope">
            <div class="operation">
              <el-button icon="el-icon-edit" size="mini" @click="edit(scope.$index, scope.row)">编辑</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog :visible.sync= "dialogFormVisible">
      <el-form :model= "form" :label-position= "labelPosition" label-width="80px" :rules="rules" ref="form">
        <el-form-item label="接口名">
          <el-cascader
            v-if= "search_options"
            v-model= "addSearch"
            :options= "search_options"
            :props= "{ expandTrigger: 'hover'}"
            @change= "urlHandleChange"
            style= "width:60%; margin-left:5px"
          ></el-cascader>
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            style="width:60%"
            type="text"
            placeholder="请输入描述信息"
            v-model= "form.remark"
            maxlength="50"
            show-word-limit=true
          >
          </el-input>
        </el-form-item>
        <el-form-item label="请求头">
          <el-input
          type="textarea"
          :rows="3"
          placeholder="请输入请求头"
          v-model="form.header"
          style="width:60%">
        </el-input>
        </el-form-item>
        <el-form-item label="请求数据">
          <editor v-model= "form.requestData" @init= "editorInit" lang= "json" theme= "chrome" width= "400" height= "200"></editor>
        </el-form-item>
        <el-form-item label= "断言">
          <el-input
          type="textarea"
          :rows="2"
          placeholder="请输入断言"
          v-model="form.assertSample"
          style="width:60%">
        </el-input>
        </el-form-item>
      </el-form>
      <div slot= "footer" class= "dialog-footer">
        <el-button @click= "dialogFormVisible = false">取 消</el-button>
        <el-button type= "primary" @click="save()">保存</el-button>
      </div>
    </el-dialog>

    <el-button-group align= "right">
      <el-button type="primary" icon="el-icon-arrow-left">上一页</el-button>
      <el-button type="primary">
        下一页
        <i class="el-icon-arrow-right el-icon--right"></i>
      </el-button>
    </el-button-group>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import { fork } from "child_process";
import { getTestData } from "@/api/testData";
import { saveTestData } from "@/api/testData";
import { getCascadeInfo } from "@/api/testData";
import { moment } from "moment";

export default {
  components: {
    editor: require('vue2-ace-editor'),
  },
  data() {
    return {
      labelPosition: 'left',
      tableData: [{
        "id":2,
	      "header": "header",
      	"requestData": '{"loginName":"aaa20200317@huobi.com","password":"123fsl123lll3_@","way":"WEB","afs": {"platform": 3,"session": "test","sig": "test","token": "test","scene": "test"}}',
        "assertSample":"asert info",
        "remark":"remark info",
        "createTime":"2020-04-12 17:18:30",
        "updateTime":"2020-04-12 17:18:30"
      }],
      dialogFormVisible: false,
      formLabelWidth: '50px',
      form: {
        id: '',
        remark: '',
        url: '',
        urlId: '',
        basic: '',
        requestData: '',
        assertSample: '',
        header: '',
        createTime: '',
        updateTime: ''
      },
      search: [],
      addSearch: [],
      search_name: '',
      search_options: [],
      rules: {
          remark: [
            {max: 50, message: '长度50个字符', trigger: 'blur' }
          ],
      },
    };
  },
  watch: {
    'form.requestData': {
      handler(newName, oldName) {
        this.form.requestData = this.formatJson(this.form.requestData)
      },
    },
    deep: true,
    immediate: true
  },
  methods: {
    editorInit: function () {
      require('brace/ext/language_tools') //language extension prerequsite...
      require('brace/mode/json')
      require('brace/mode/javascript')    //language
      require('brace/mode/less')
      require('brace/theme/chrome')
      require('brace/snippets/javascript') //snippet
    },
  //转json
    formatJson(json, options) {
        var reg = null,
            formatted = '',
            pad = 0,
            PADDING = '    ';
        options = options || {};
        options.newlineAfterColonIfBeforeBraceOrBracket = (options.newlineAfterColonIfBeforeBraceOrBracket === true) ? true : false;
        options.spaceAfterColon = (options.spaceAfterColon === false) ? false : true;
        if (typeof json !== 'string') {
            json = JSON.stringify(json);
        } else {
            json = JSON.parse(json);
            json = JSON.stringify(json);
        }
        reg = /([\{\}])/g;
        json = json.replace(reg, '\r\n$1\r\n');
        reg = /([\[\]])/g;
        json = json.replace(reg, '\r\n$1\r\n');
        reg = /(\,)/g;
        json = json.replace(reg, '$1\r\n');
        reg = /(\r\n\r\n)/g;
        json = json.replace(reg, '\r\n');
        reg = /\r\n\,/g;
        json = json.replace(reg, ',');
        if (!options.newlineAfterColonIfBeforeBraceOrBracket) {
            reg = /\:\r\n\{/g;
            json = json.replace(reg, ':{');
            reg = /\:\r\n\[/g;
            json = json.replace(reg, ':[');
        }
        if (options.spaceAfterColon) {
            reg = /\:/g;
            json = json.replace(reg, ':');
        }
        (json.split('\r\n')).forEach(function (node, index) {
            var i = 0,
                indent = 0,
                padding = '';

            if (node.match(/\{$/) || node.match(/\[$/)) {
                indent = 1;
            } else if (node.match(/\}/) || node.match(/\]/)) {
                if (pad !== 0) {
                    pad -= 1;
                }
            } else {
                indent = 0;
            }

            for (i = 0; i < pad; i++) {
                padding += PADDING;
            }

            formatted += padding + node + '\r\n';
            pad += indent;
        });
      return formatted;
    },
    //搜索级联选择器
    handleChange(value){
      this.search_name = this.search[value.length-1];
    },
    //添加级联选择器
    urlHandleChange(value){
      this.form.url = this.addSearch[value.length-1];
    },
    //添加数据
    addTestData(){
      this.form = {}
      this.dialogFormVisible = true;
    },
    //编辑测试数据，自动填充表单
    edit(index,row) {
      var checkData = row
      this.form.id = checkData.id
      this.form.urlId = checkData.urlId
      this.form.basic = checkData.basic
      this.form.remark = checkData.remark.trim()
      this.form.requestData = checkData.requestData.trim()
      this.form.assertSample = checkData.assertSample.trim()
      this.form.header = checkData.header.trim()
      this.form.createTime = checkData.createTime
      this.form.updateTime = checkData.updateTime
      this.dialogFormVisible = true;
    },
    async save(){
      var saveResponse = await saveTestData(this.form)
      if(saveResponse !== null){
        if(saveResponse.code ===10000){
          this.$message({
          message: '保存成功',
          type: 'success'
        });
        }else{
          this.$message.error('保存失败:' + saveResponse.message);
        }
      }else{
        this.$message({
          message: '响应数据为空',
          type: 'warning'
        });
      }
    },
    //搜索测试数据
    async searchData() {
      if(this.search_name !== null || this.search_name !== ''){
        var response = await getTestData(this.search_name);
        if(response.code === 10000){
          this.tableData = response.data
        }
      }
    },
    //异步获取级联信息
    async getCascade(){
      var response = await getCascadeInfo();
      if(response.code === 10000){
        this.search_options = response.data;
      }
    }
  },
  mounted() {
    this.getCascade();
  }
};
</script>

<style scoped lang="scss">
.line {
  text-align: center;
}
</style>
