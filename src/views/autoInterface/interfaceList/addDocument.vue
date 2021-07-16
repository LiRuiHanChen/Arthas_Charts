<template>
  <div class="markdown-body">
    <mavon-editor
      ref="md"
      @imgAdd="$imgAdd"
      @change="change"
      @save= "showMavonDialog"
      style="height: 100%;width: 100%;"
      v-model="content"
    ></mavon-editor>
    <div class="dialog">
      <el-dialog :visible.sync="dialogVisible" width="30%">
        <el-input
          type="text"
          placeholder="请输入名称"
          v-model="modelName"
          maxlength="10"
          show-word-limit
        ></el-input>
        <el-button style="margin-top:10px" type="primary" @click= "saveMavon">保存</el-button>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import marked from "marked";
import { mavonEditor } from "mavon-editor";
import "mavon-editor/dist/css/index.css";
import hljs from "highlight.js";
import javascript from "highlight.js/lib/languages/javascript";
import "highlight.js/styles/monokai-sublime.css";
import { saveDocument } from "@/api/document";

export default {
  name: "markdown",
  components: {
    mavonEditor
  },
  data() {
    return {
      content: "",
      html: "",
      modelName: "",
      dialogVisible: false
    };
  },
  mounted() {},
  methods: {
    async saveMavon(value, render) {
      var response = await saveDocument(this.modelName, this.content);
      if (response.code === 10000) {
        this.$message({
          message: "保存成功",
          type: "success"
        });
      } else {
        this.$message.error("保存失败:" + response.message);
      }
      this.dialogVisible = false
    },
    showMavonDialog(){
      this.dialogVisible = true
      this.modelName =''
    },
    // 绑定@imgAdd event
    $imgAdd(pos, $file) {
      console.log("触发图片上传");
      console.log(pos);
      console.log($file);
      // 第一步.将图片上传到服务器.
      var formdata = new FormData();
      formdata.append("file", $file);
      console.log(formdata);
      imgeApi(formdata).then(res => {
        // 第二步.将返回的url替换到文本原位置![...](0) -> ![...](url)
        /**
         * $vm 指为mavonEditor实例，可以通过如下两种方式获取
         * 1. 通过引入对象获取: `import {mavonEditor} from ...` 等方式引入后，`$vm`为`mavonEditor`
         * 2. 通过$refs获取: html声明ref : `<mavon-editor ref=md ></mavon-editor>，`$vm`为 `this.$refs.md`
         */
        console.log(res.data);
        let url = "/server/" + res.data.data;
        this.$refs.md.$img2Url(pos, url); //相应的md格式的文件内容就是它绑定的变量
        //得到相应的html/文件
        console.log(this.$refs.md.d_render);
      });
    },
    // 所有操作都会被解析重新渲染
    change(value, render) {
      this.content = value
      // this.html = render;
    }
  }
};
</script>
<style lang="scss" scoped>
.markdown-body {
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  justify-content: flex-start;
  flex-grow: 1;
  flex-basis: auto;
  flex-shrink: 1;
}
</style>
