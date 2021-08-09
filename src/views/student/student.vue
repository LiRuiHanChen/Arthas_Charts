<template>
  <div class="dashboard-container" style="width:100%">
    <div class="teacher_info" style="margin-top:10px">
      <el-form ref="ruleFrom" :inline="true" :model="teacherFromData" style="width:100%;">
        <el-form-item
          prop="teacher_id"
          :rules="[
            { required: true, message: '请输入老师Id', trigger: 'blur' },
            { type: 'number', message: '必须为数字值'}
          ]"
        >
          <el-input v-model.number="teacherFromData.teacher_id" placeholder="请输入老师Id" style="margin-left:10px">
            <template slot="prepend">TeacherId</template>
          </el-input>
        </el-form-item>
        <el-button id="connect" type="primary" style="margin-left:1%" @click="searchTeacher('ruleFrom')">查询</el-button>
        <el-select v-model="teacherFromData.clazz_id" clearable placeholder="请选择" style="margin-left:10px">
          <el-option
            v-for="item in clazz_list"
            :key="item.clazz_id"
            :label="item.clazz_name"
            :value="item.clazz_id"
          />
        </el-select>
      </el-form>
      <el-form ref="ruleFromData" :inline="true" :model="teacherFromData" style="width:100%;">
        <!-- 学生姓名 -->
        <el-form-item
          prop="real_name"
          :rules="[
            { required: true, message: '请输入姓名', trigger: 'blur' },
            { min: 1, max: 10, message: '长度在 1 到 10 个字符', trigger: 'blur' }
          ]"
        >
          <el-input v-model="teacherFromData.real_name" placeholder="请输入姓名" style="margin-left:10px">
            <template slot="prepend">realName</template>
          </el-input>
        </el-form-item>
        <!-- 注册用户数 -->
        <el-form-item
          prop="count"
          :rules="[
            { required: true, message: '请输入需要注册的学生数量', trigger: 'blur' },
            { type: 'number', message: '必须为数字值'}
          ]"
        >
          <el-input v-model.number="teacherFromData.count" placeholder="需要注册的学生数量">
            <template slot="prepend">Count</template>
          </el-input>
        </el-form-item>
        <el-button id="connect" type="primary" style="margin-left:1%" @click="registerAndJoinClazz('ruleFromData')">创建并加入班级</el-button>
      </el-form>
      <!-- 生成的账号列表 -->
      <el-table
        v-loading="loading"
        element-loading-text="拼命加载中"
        element-loading-spinner="el-icon-loading"
        element-loading-background="rgba(0, 0, 0, 0.8)"
        :data="studentList"
        style="width: 100%; margin-top:30px"
      >
        <el-table-column
          prop="realName"
          label="realName"
        />
        <el-table-column
          prop="mobile"
          label="mobile"
        />
        <el-table-column
          prop="password"
          label="password"
        />
        <el-table-column
          prop="userId"
          label="userId"
        />
      </el-table>
    </div>
  </div>
</template>
<script>
import { getTeacherInfo, joinsystemclazz } from '@/api/student'

export default {
  name: 'App',
  data() {
    return {
      teacherFromData: {
        teacher_id: '',
        clazz_id: '',
        real_name: '',
        app_key: '17JuniorStu',
        count: ''
      },
      clazz_list: [],
      studentList: [],
      loading: false
    }
  },
  mounted() {
  },

  methods: {
    // 查询老师信息（提取班级）
    async searchTeacher(ruleFrom) {
      // 表单检查
      var checkValue = false
      this.$refs[ruleFrom].validate((valid) => {
        if (!valid) {
          this.$message.error('id异常,请检查!')
          return false
        } else {
          checkValue = true
        }
      })
      if (checkValue === true) {
        var response = await getTeacherInfo(this.teacherFromData.teacher_id)
        if (response !== null || response !== undefined) {
          if (response.code === 200) {
            this.clazz_list = response.data.clazz_list
            if (this.clazz_list !== null) {
              this.$message({
                message: '查询成功，请求选择班级信息',
                type: 'success'
              })
            }
          } else {
            this.$message.error('查询失败:' + response.message)
          }
        } else {
          this.$message({
            message: '响应数据为空',
            type: 'warning'
          })
        }
      }
    },
    // 注册并加入班级
    async registerAndJoinClazz(ruleFromData) {
      var checkValue = false
      this.$refs[ruleFromData].validate((valid) => {
        if (!valid) {
          this.$message.error('表单异常,请检查!')
          return false
        } else {
          checkValue = true
        }
      })
      if (checkValue === true) {
        if (this.teacherFromData.count > 10) {
          this.$message.error('count数量异常,请检查!')
          return
        }
        if (this.teacherFromData.real_name === '') {
          this.$message.error('请输入realName!')
          return
        }
        this.loading = true
        var response = await joinsystemclazz(this.teacherFromData)
        if (response !== null || response !== undefined) {
          if (response.code === 200) {
            this.studentList = response.data
          } else {
            this.$message.error(response.message)
          }
          this.loading = false
        }
      }
    }
  }
}
</script>
<style>
</style>
