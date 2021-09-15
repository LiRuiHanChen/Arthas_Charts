<template>
  <div id="app" style="width:100%">
    <el-form ref="ruleForm" :model="ruleForm" :rules="rules" label-width="100px" style="margin:10px" class="demo-ruleForm">
      <el-form-item label="省份" prop="provincesValue">
        <el-select v-model="ruleForm.provincesValue" filterable placeholder="请选择省份" @change="provincesChane">
          <el-option
            v-for="item in provincesList"
            :key="item.id"
            :label="item.text"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="市区" prop="cityValue">
        <el-select v-model="ruleForm.cityValue" filterable placeholder="请选择城市" @change="cityChane">
          <el-option
            v-for="item in cityList"
            :key="item.id"
            :label="item.text"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="学校" prop="schoolValue">
        <el-select v-model="ruleForm.schoolValue" filterable placeholder="请选择学校">
          <el-option
            v-for="item in schoolList"
            :key="item.region"
            :label="item.name"
            :value="item.region"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="学科类型" prop="subjectType">
        <el-checkbox v-model="checkAll" :indeterminate="isIndeterminate" @change="handleCheckAllChange">全选</el-checkbox>
        <div style="margin: 15px 0;" />
        <el-checkbox-group v-model="ruleForm.subjectType">
          <el-checkbox v-for="temp in subjectTypeList" :key="temp.id" :label="temp.name" />
        </el-checkbox-group>
      </el-form-item>
      <el-form-item label="老师名称" prop="teacherName">
        <el-input v-model="ruleForm.teacherName" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submitForm('ruleForm')">立即创建</el-button>
        <el-button @click="resetForm('ruleForm')">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { getCityInfo, getSchoolInfo } from '@/api/teacher'

export default {
  data() {
    return {
      checkAll: false,
      isIndeterminate: true,
      ruleForm: {
        teacherName: '',
        subjectType: [],
        provincesValue: '',
        cityValue: '',
        schoolValue: ''
      },
      rules: {
        teacherName: [
          { required: true, message: '请输入老师姓名', trigger: 'blur' },
          { min: 1, max: 5, message: '长度在 1 到 5 个字符', trigger: 'blur' }
        ],
        provincesValue: [
          { required: true, message: '请选择省份', trigger: 'change' }
        ],
        cityValue: [
          { required: true, message: '请选择城市', trigger: 'change' }
        ],
        schoolValue: [
          { required: true, message: '请选择学校', trigger: 'change' }
        ],
        subjectType: [
          { type: 'array', required: true, message: '请至少选择一个活动性质', trigger: 'change' }
        ]
      },
      subjectTypeList: [
        {
          'name': '英语',
          'id': 103
        },
        {
          'name': '数学',
          'id': 102
        },
        {
          'name': '语文',
          'id': 101
        },
        {
          'name': '物理',
          'id': 104
        },
        {
          'name': '化学',
          'id': 105
        },
        {
          'name': '生物',
          'id': 106
        },
        {
          'name': '政治',
          'id': 107
        },
        {
          'name': '地理',
          'id': 108
        },
        {
          'name': '历史',
          'id': 109
        }
      ],
      provincesList: [
        {
          'id': 110000,
          'text': '北京市',
          'state': 'closed',
          'checked': false
        },
        {
          'id': 120000,
          'text': '天津市',
          'state': 'closed',
          'checked': false
        },
        {
          'id': 130000,
          'text': '河北省',
          'state': 'closed',
          'checked': false
        },
        {
          'id': 140000,
          'text': '山西省',
          'state': 'closed',
          'checked': false
        },
        {
          'id': 150000,
          'text': '内蒙古自治区',
          'state': 'closed',
          'checked': false
        },
        {
          'id': 210000,
          'text': '辽宁省',
          'state': 'closed',
          'checked': false
        },
        {
          'id': 220000,
          'text': '吉林省',
          'state': 'closed',
          'checked': false
        },
        {
          'id': 230000,
          'text': '黑龙江省',
          'state': 'closed',
          'checked': false
        },
        {
          'id': 310000,
          'text': '上海市',
          'state': 'closed',
          'checked': false
        },
        {
          'id': 320000,
          'text': '江苏省',
          'state': 'closed',
          'checked': false
        },
        {
          'id': 330000,
          'text': '浙江省',
          'state': 'closed',
          'checked': false
        },
        {
          'id': 340000,
          'text': '安徽省',
          'state': 'closed',
          'checked': false
        },
        {
          'id': 350000,
          'text': '福建省',
          'state': 'closed',
          'checked': false
        },
        {
          'id': 360000,
          'text': '江西省',
          'state': 'closed',
          'checked': false
        },
        {
          'id': 370000,
          'text': '山东省',
          'state': 'closed',
          'checked': false
        },
        {
          'id': 410000,
          'text': '河南省',
          'state': 'closed',
          'checked': false
        },
        {
          'id': 420000,
          'text': '湖北省',
          'state': 'closed',
          'checked': false
        },
        {
          'id': 430000,
          'text': '湖南省',
          'state': 'closed',
          'checked': false
        },
        {
          'id': 440000,
          'text': '广东省',
          'state': 'closed',
          'checked': false
        },
        {
          'id': 450000,
          'text': '广西壮族自治区',
          'state': 'closed',
          'checked': false
        },
        {
          'id': 460000,
          'text': '海南省',
          'state': 'closed',
          'checked': false
        },
        {
          'id': 500000,
          'text': '重庆市',
          'state': 'closed',
          'checked': false
        },
        {
          'id': 510000,
          'text': '四川省',
          'state': 'closed',
          'checked': false
        },
        {
          'id': 520000,
          'text': '贵州省',
          'state': 'closed',
          'checked': false
        },
        {
          'id': 530000,
          'text': '云南省',
          'state': 'closed',
          'checked': false
        },
        {
          'id': 540000,
          'text': '西藏自治区',
          'state': 'closed',
          'checked': false
        },
        {
          'id': 610000,
          'text': '陕西省',
          'state': 'closed',
          'checked': false
        },
        {
          'id': 620000,
          'text': '甘肃省',
          'state': 'closed',
          'checked': false
        },
        {
          'id': 630000,
          'text': '青海省',
          'state': 'closed',
          'checked': false
        },
        {
          'id': 640000,
          'text': '宁夏回族自治区',
          'state': 'closed',
          'checked': false
        },
        {
          'id': 650000,
          'text': '新疆维吾尔自治区',
          'state': 'closed',
          'checked': false
        },
        {
          'id': 710000,
          'text': '台湾省',
          'state': 'closed',
          'checked': false
        },
        {
          'id': 810000,
          'text': '香港特别行政区',
          'state': 'closed',
          'checked': false
        },
        {
          'id': 820000,
          'text': '澳门特别行政区',
          'state': 'closed',
          'checked': false
        }
      ],
      cityList: [],
      cityIdList: [],
      schoolList: []
    }
  },

  methods: {
    handleCheckAllChange(val) {
      console.log(val ? this.subjectTypeList : [])

      this.ruleForm.subjectType = val ? this.subjectTypeList : []
      this.isIndeterminate = false
    },
    handleCheckedCitiesChange(value) {
      const checkedCount = value.length
      console.log(checkedCount)
      this.checkAll = checkedCount === this.subjectTypeList.length
      this.isIndeterminate = checkedCount > 0 && checkedCount < this.subjectTypeList.length
    },
    // 省份发生改变的时候
    async provincesChane() {
      // 重新根据省份查询
      var response = await getCityInfo(this.ruleForm.provincesValue)
      if (response !== null || response !== undefined) {
        if (response.code === 200) {
          // 同时清空市区和学校
          this.cityList = []
          this.schoolList = []
          this.ruleForm.cityValue = ''
          this.ruleForm.schoolValue = ''
          this.cityList = response.data
          if (this.cityList !== null) {
            this.cityList.unshift({ id: 999999, text: '全部' })
            this.cityList.forEach(element => {
              this.cityIdList.push(element.id)
            })
            this.$message({
              message: '查询成功',
              type: 'success'
            })
          }
        } else {
          this.$message.error('查询失败:' + response.message)
        }
      } else {
        // 同时清空市区和学校
        this.cityList = []
        this.schoolList = []
        this.ruleForm.cityValue = ''
        this.ruleForm.schoolValue = ''
        this.$message({
          message: '响应数据为空',
          type: 'warning'
        })
      }
    },
    // 城市发生改变的时候
    async cityChane() {
      // 重新根据城市查询
      var response
      if (this.ruleForm.cityValue === '' || this.ruleForm.cityValue === 999999) {
        var res = this.cityIdList.join(',')
        console.log('res =' + res)
        response = await getSchoolInfo(res)
      } else {
        response = await getSchoolInfo(this.ruleForm.cityValue)
      }
      console.log('cityChane')
      console.log(response)
      // 清空学校
      this.schoolList = []
      this.ruleForm.schoolValue = ''
      if (response !== null || response !== undefined) {
        if (response.code === 200) {
          this.schoolList = response.data
          if (this.schoolList !== null) {
            this.$message({
              message: '查询成功',
              type: 'success'
            })
          }
        } else {
          this.$message.error('查询失败:' + response.message)
        }
      } else {
        // 同时清空学校
        this.schoolList = []
        this.$message({
          message: '响应数据为空',
          type: 'warning'
        })
      }
    },
    // 重置表单
    resetForm(formName) {
      this.$refs[formName].resetFields()
    },
    // 提交
    submitForm() {
      // 如果没有选择城市，默认为[全选]
      if (this.ruleForm.cityValue === '') {
        this.resetForm.cityValue = this.cityIdList.toString
        return
      }
    }
  }
}
</script>
<style>
  .text {
    font-size: 14px;
  }

  .item {
    margin-bottom: 18px;
  }

  .clearfix:before,
  .clearfix:after {
    display: table;
    content: "";
  }
  .clearfix:after {
    clear: both
  }

  .box-card {
    width: 480px;
  }
</style>
