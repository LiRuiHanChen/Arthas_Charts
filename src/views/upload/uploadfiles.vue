<template>
<div class="dashboard-container" style="text-align:center;padding:20%">
  <div class="dashboard-text"></div>
  <el-upload
    class="upload-demo"
    ref="upload"
    action="/api/upload/files"
    :multiple="true" :limit="1"
  >
  <el-button slot="trigger" size="small" type="primary">选取文件</el-button>
  </el-upload>
  <!-- <el-upload class="upload-demo"
    ref="upload"
    action="/api/upload/files"
    :on-preview="handlePreview" :on-remove="handleRemove" :before-remove="beforeRemove" :on-error="onError" :auto-upload= false
    multiple :limit="1" :on-exceed="handleExceed" accept="MIME_TYPE/jmx"> -->
    <!-- <el-button size="small" type="primary">点击上传</el-button> -->
    <!-- <el-button slot="trigger" size="small" type="primary">选取文件</el-button> -->
    <!-- <el-button style="margin-left: 10px;" size="small" type="success" @click="submitUpload">上传到服务器</el-button>
    <div slot="tip" class="el-upload__tip">只能上传 jmx 格式文件</div> -->
  <!-- </el-upload> -->
</div>
</template>

<script>
import { uploadFiles } from '@/api/upload'

export default {
  data() {
    return {
        fileList: [{}]
      };
    },
    methods: {
      async submitUpload() {
        const files = this.$refs.upload;
        const res = await uploadFiles(files);
        console.log(res);
        // if (res.success) {

        // }
        // this.$refs.upload.submit();
      },
      handleRemove(file, fileList) {
      },
      handlePreview(file) {
      },
      handleExceed(files, fileList) {
        this.$message.warning(`当前限制选择 1 个文件，本次选择了 ${files.length} 个文件，共选择了 ${files.length + fileList.length} 个文件`);
      },
      beforeRemove(file, fileList) {
        return this.$confirm(`确定移除 ${ file.name }？`);
      },
      onError(err, file, fileList){
        this.$message.error(`不支持的文件类型  ${ file.name }`);
      },
    }
  }

</script>

<style lang="scss" scoped>
.upload {
  &-container {
    margin: 30px;
  }
  &-text {
    font-size: 30px;
    line-height: 46px;
  }
}
</style>

