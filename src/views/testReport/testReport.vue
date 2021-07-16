<template>
  <div class="dashboard-container">
    <div id="statistics" style="width:100%;hight:auto">
      <h1 align="center" font-size:smaller>Statistics</h1>
      <el-table :data="statistics" style="width: 95%" max-height="250">
        <el-table-column label="Request" width="auto" type="flex" align="center">
          <el-table-column prop="sampleLabel" label="label" width="auto" type="flex" align="center"></el-table-column>
        </el-table-column>
        <el-table-column label="executions" type="flex" align="center">
          <el-table-column
            prop="numSamples"
            label="Samples"
            width="auto"
            type="flex"
            align="center"
          ></el-table-column>
          <el-table-column prop="kOCount" label="KO" width="auto" type="flex" align="center"></el-table-column>
          <el-table-column
            prop="errorPercentage"
            label="Error%"
            width="auto"
            type="flex"
            align="center"
          ></el-table-column>
        </el-table-column>
        <el-table-column label="Response Time(ms)" type="flex" align="center">
          <el-table-column prop="average" label="Average" width="auto" type="flex" align="center"></el-table-column>
          <el-table-column prop="min" label="Min" width="auto" type="flex" align="center"></el-table-column>
          <el-table-column prop="max" label="Max" width="auto" type="flex" align="center"></el-table-column>
          <el-table-column
            prop="ninthPercentage"
            label="90th pct"
            width="auto"
            type="flex"
            align="center"
          ></el-table-column>
          <el-table-column
            prop="ninthFivePercentage"
            label="95th pct"
            width="120"
            type="flex"
            align="center"
          ></el-table-column>
          <el-table-column
            prop="ninthNinePercentage"
            label="99th pct"
            width="auto"
            type="flex"
            align="center"
          ></el-table-column>
          <el-table-column
            prop="throughput"
            label="Throughput"
            width="auto"
            type="flex"
            align="center"
          ></el-table-column>
        </el-table-column>
        <el-table-column label="Network(KB/sec)" type="flex" align="center">
          <el-table-column prop="received" label="Received" width="auto" type="flex" align="center"></el-table-column>
          <el-table-column prop="sent" label="Sent" width="auto" type="flex" align="center"></el-table-column>
        </el-table-column>
      </el-table>
      <h1 align="center" font-size:smaller>Charts</h1>
    </div>
    <div id="timeVsThreadsLineChart" style="width: 50%;height:300%;"></div>
    <div id="responseTimeOverviewChart" style="width: 50%;height:300%;"></div>
    <div id="responseTimePercentilesChart" style="width:50%;height:300%"></div>
    <div id="transactionsPerSecond" style="width:50%;height:300%"></div>
    <div id="KBThroughputOverTime" style="width:50%;height:300%"></div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import { fork } from "child_process";
// import echarts from 'echarts'

var responseTimeOverviewArray = new Array(0, 0, 0, 0);
var maxResponseTimeArray = new Array(); //最大响应时间
var minResponseTimeArray = new Array(); //最小响应时间
var ninetyPercentilesArray = new Array(); //90线
var ninety_fivePercentilesArray = new Array(); //95线
var ninety_ninePercentilesArray = new Array(); //99线

export default {
  //websocket
  data() {
    return {
      path: "ws://localhost:9527/send/jmeter_result",
      socket: "",
      vsThreadsLegend: [],
      vsThreadsSeries: [],
      queryList: [], //查询的时间点
      tpsLegend: [],
      tpsSuccessSeries: [],
      tpsErrorSeries: [],
      sentKBPerSecondSeries: [],
      KBPerSecondSeries: [],
      KBLegengd: [],
      statistics: []
    };
  },
  name: "app",
  methods: {
    init: function() {
      if (typeof WebSocket === "undefined") {
        alert("您的浏览器不支持socket");
      } else {
        this.socket = new WebSocket(this.path);
        this.socket.onopen = this.open;
        this.socket.onerror = this.error;
        this.socket.onmessage = this.getMessage;
        this.socket.colse = this.colse;
      }
    },
    open: function() {
      console.log("socket连接成功");
      this.send("1@responseTimeIndicators*1578989863304"); //前端传递时间戳(执行测试的时间)
    },
    error: function() {
      console.log("连接错误");
    },
    getMessage: function(msg) {
      const data = JSON.parse(msg.data);
      this.parsSocketMessage(data);
    },
    send(params) {
      this.socket.send(params);
    },
    close: function() {
      console.log("socket已经关闭");
    },
    destroyed() {
      this.socket.onclose = this.close;
    },
    //response time vs Threads (时间和线程-折线图)
    drawTimeVsThreadsLineChart() {
      let timeVsThreadsLineChart = this.$echarts.init(
        document.getElementById("timeVsThreadsLineChart")
      );
      let baseLineChartoption = {
        title: {
          text: "TimeVsThreads"
        },
        legend: {
          data: this.vsThreadsLegend
        },
        //缩放
        dataZoom: [
          {
            show: true,
            realtime: true,
            start: 0
          },
          {
            type: "inside",
            realtime: true,
            start: 0
          }
        ],
        xAxis: {},
        yAxis: {},
        toolbox: {
          feature: {
            dataZoom: {
              yAxisIndex: "none"
            },
            restore: {},
            saveAsImage: {}
          }
        },
        series: this.vsThreadsSeries
      };
      timeVsThreadsLineChart.setOption(baseLineChartoption);
    },
    //response time overview (响应时间概述-柱状图)
    drawResponseTimeOverviewChart() {
      let responseTimeOverviewChart = this.$echarts.init(
        document.getElementById("responseTimeOverviewChart")
      );
      let bar_option = {
        title: {
          text: "TimeOverview"
        },
        color: ["#dbcd33"],
        tooltip: {
          trigger: "axis",
          axisPointer: {
            // 坐标轴指示器，坐标轴触发有效
            type: "shadow" // 默认为直线，可选为：'line' | 'shadow'
          }
        },
        toolbox: {
          feature: {
            saveAsImage: {}
          }
        },
        grid: {
          left: "3%",
          right: "4%",
          bottom: "3%",
          containLabel: true
        },
        xAxis: [
          {
            type: "category",
            // data : ['<=500ms','<=1500ms','>1500ms','error'],
            data: ["小于500", "500-1500", "大于1500", "error"],
            axisTick: {
              alignWithLabel: true
            }
          }
        ],
        yAxis: [
          {
            type: "value"
          }
        ],
        series: [
          {
            // name:'直接访问',
            type: "bar",
            barWidth: "30%",
            // data:[20, 12, 3, 4]
            data: responseTimeOverviewArray
          }
        ]
      };
      responseTimeOverviewChart.setOption(bar_option);
    },
    //Response Time Percentiles Over Time (successful responses,成功响应时间百分比）
    drawResponseTimePercentilesChart() {
      let responseTimePercentilesChar = this.$echarts.init(
        document.getElementById("responseTimePercentilesChart")
      );
      let percenttilesOption = {
        title: {
          text: "TimePercentiles"
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "cross",
            label: {
              backgroundColor: "#6a7985"
            }
          }
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "cross",
            animation: false,
            label: {
              backgroundColor: "#505765"
            }
          }
        },
        //缩放
        dataZoom: [
          {
            show: true,
            realtime: true,
            start: 0
          },
          {
            type: "inside",
            realtime: true,
            start: 0
          }
        ],
        legend: {
          data: ["90th", "95th", "99th", "max", "min"]
        },
        toolbox: {
          feature: {
            dataZoom: {
              yAxisIndex: "none"
            },
            restore: {},
            saveAsImage: {}
          }
        },
        grid: {
          left: "3%",
          right: "4%",
          bottom: "3%",
          containLabel: true
        },
        //存放时间列表
        xAxis: [
          {
            type: "category",
            boundaryGap: false,
            // data : ['14:37:00','14:37:30','14:38:00','14:38:30','14:39:00','14:39:30','14:40:00']//每30s颗粒度显示数据
            data: this.queryList
          }
        ],
        yAxis: [
          {
            type: "value"
          }
        ],
        series: [
          {
            name: "90th",
            type: "line",
            stack: "总量",
            areaStyle: {},
            // data:[120, 132, 101, 134, 90, 230, 210]
            data: ninetyPercentilesArray
          },
          {
            name: "95th",
            type: "line",
            stack: "总量",
            areaStyle: { normal: {} },
            data: ninety_fivePercentilesArray
          },
          {
            name: "99th",
            type: "line",
            stack: "总量",
            areaStyle: {},
            data: ninety_ninePercentilesArray
          },
          {
            name: "max",
            type: "line",
            stack: "总量",
            areaStyle: { normal: {} },
            data: maxResponseTimeArray
          },
          {
            name: "min",
            type: "line",
            stack: "总量",
            label: {
              normal: {
                show: true,
                position: "top"
              }
            },
            areaStyle: { normal: {} },
            data: minResponseTimeArray
          }
        ]
      };
      responseTimePercentilesChar.setOption(percenttilesOption);
    },
    //TPS
    drawTransactionsPerSecondChart() {
      let transactionsPerSecondChar = this.$echarts.init(
        document.getElementById("transactionsPerSecond")
      );
      let tpsChartoption = {
        title: {
          text: "TPS",
          left: 0
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "cross"
          }
        },
        legend: {
          data: this.tpsLegend
        },
        grid: {
          left: "10%",
          right: "10%",
          bottom: "15%"
        },
        xAxis: {
          type: "category",
          // data: data0.categoryData,
          scale: true,
          boundaryGap: false,
          axisLine: { onZero: false },
          splitLine: { show: false },
          splitNumber: 20
          // min: 'dataMin',
          // max: 'dataMax'
        },
        yAxis: {
          scale: true,
          splitArea: {
            show: true
          }
        },
        toolbox: {
          feature: {
            dataZoom: {
              yAxisIndex: "none"
            },
            restore: {},
            saveAsImage: {}
          }
        },
        dataZoom: [
          {
            type: "inside",
            start: 0
          },
          {
            show: true,
            type: "slider",
            y: "90%",
            start: 0
          }
        ],
        series: [
          {
            name: "successThroughput",
            type: "line",
            data: this.tpsSuccessSeries,
            smooth: true,
            lineStyle: {
              normal: { opacity: 0.5 }
            }
          },
          {
            name: "errorThroughput",
            type: "line",
            data: this.tpsErrorSeries,
            smooth: true,
            lineStyle: {
              normal: { opacity: 0.5 }
            }
          }
        ]
      };
      transactionsPerSecondChar.setOption(tpsChartoption);
    },
    //KB Throughput Over Time（发送接收数据吞吐量时间变化曲线图,单位:kb/sec）
    drawKBThroughputOverTimeChart() {
      let KBThroughputOverTimeChar = this.$echarts.init(
        document.getElementById("KBThroughputOverTime")
      );
      let KBThroughputChartoption = {
        title: {
          text: "KBThroughput",
          left: 0
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "cross"
          }
        },
        legend: {
          data: this.KBLegengd
        },
        grid: {
          left: "10%",
          right: "10%",
          bottom: "15%"
        },
        xAxis: {
          type: "category",
          scale: true,
          boundaryGap: false,
          axisLine: { onZero: false },
          splitLine: { show: false },
          splitNumber: 20
        },
        yAxis: {
          scale: true,
          splitArea: {
            show: true
          }
        },
        toolbox: {
          feature: {
            dataZoom: {
              yAxisIndex: "none"
            },
            restore: {},
            saveAsImage: {}
          }
        },
        dataZoom: [
          {
            type: "inside",
            start: 0
          },
          {
            show: true,
            type: "slider",
            y: "90%",
            start: 0
          }
        ],
        series: [
          {
            name: "KBPerSecond",
            type: "line",
            data: this.KBPerSecondSeries,
            smooth: true,
            lineStyle: {
              normal: { opacity: 0.5 }
            }
          },
          {
            name: "sentKBPerSecond",
            type: "line",
            data: this.sentKBPerSecondSeries,
            smooth: true,
            lineStyle: {
              normal: { opacity: 0.5 }
            }
          }
        ]
      };
      KBThroughputOverTimeChar.setOption(KBThroughputChartoption);
    },
    /**
     * 毫秒时间转换为HH:MM:SS
     */
    timeTransformation(timeSample) {
      var date = new Date(timeSample);
      var time =
        date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
      return time;
    },
    /**
     * 响应时间合并
     */
    responseTimeConversion(value, dataArray) {
      var tempArray = [];
      tempArray.push(value);
      dataArray = dataArray.concat(tempArray);
      return dataArray;
    },
    //解析socket接收数据
    parsSocketMessage(data) {
      console.log(data)
      for (const key in data) {
        if (key === "responseTimeOverview") {
          var tempOverView = new Array(4);
          tempOverView = data[key];
          responseTimeOverviewArray = tempOverView.map(function(item, index) {
            return item + responseTimeOverviewArray[index];
          });
          this.drawResponseTimeOverviewChart();
        }
        if (key === "responseTimePercentiles") {
          const temp = data[key];
          maxResponseTimeArray = this.responseTimeConversion(
            temp.max,
            maxResponseTimeArray
          );
          minResponseTimeArray = this.responseTimeConversion(
            temp.min,
            minResponseTimeArray
          );
          ninetyPercentilesArray = this.responseTimeConversion(
            temp["90th"],
            ninetyPercentilesArray
          );
          ninety_fivePercentilesArray = this.responseTimeConversion(
            temp["95th"],
            ninety_fivePercentilesArray
          );
          ninety_ninePercentilesArray = this.responseTimeConversion(
            temp["99th"],
            ninety_ninePercentilesArray
          );
          this.queryList.push(this.timeTransformation(temp.endTime));
          this.drawResponseTimePercentilesChart();
        }
        if (key === "responseTimeVsThreads") {
          this.sampleLabelArray = data[key];
          if (this.sampleLabelArray) {
            Object.keys(this.sampleLabelArray).forEach(item => {
              if (
                !this.vsThreadsLegend.includes(
                  this.sampleLabelArray[item].sampleLabel
                )
              ) {
                //只有samplelabel没有被存储过才执行添加
                this.vsThreadsLegend.push(
                  this.sampleLabelArray[item].sampleLabel
                );
                this.vsThreadsSeries.push({
                  name: this.sampleLabelArray[item].sampleLabel,
                  type: "line",
                  data: this.sampleLabelArray[item].elapsedTimes
                });
              } else {
                //添加到对应name的数组中
                this.vsThreadsSeries[item].data = this.vsThreadsSeries[
                  item
                ].data.concat(this.sampleLabelArray[item].elapsedTimes);
              }
            });
          }
          this.drawTimeVsThreadsLineChart();
        }
        if (key === "TPS") {
          var tpsJsonData = data[key];
          for (name in tpsJsonData) {
            if (name === "successThroughput") {
              this.tpsLegend.push(name);
              this.tpsSuccessSeries.push(
                new Array(
                  this.timeTransformation(tpsJsonData.endTime),
                  tpsJsonData[name]
                )
              );
            }
            if (name === "errorThroughput") {
              this.tpsLegend.push(name);
              this.tpsErrorSeries.push(
                new Array(
                  this.timeTransformation(tpsJsonData.endTime),
                  tpsJsonData[name]
                )
              );
            }
          }
          this.drawTransactionsPerSecondChart();
        }
        if (key === "kbThroughput") {
          var tpsJsonData = data[key];
          for (name in tpsJsonData) {
            if (name === "KBPerSecond") {
              this.KBLegengd.push(name);
              this.KBPerSecondSeries.push(
                new Array(
                  this.timeTransformation(tpsJsonData.endTime),
                  tpsJsonData[name]
                )
              );
            }
            if (name === "sentKBPerSecond") {
              this.KBLegengd.push(name);
              this.sentKBPerSecondSeries.push(
                new Array(
                  this.timeTransformation(tpsJsonData.endTime),
                  tpsJsonData[name]
                )
              );
            }
          }
          this.drawKBThroughputOverTimeChart();
        }
        if (key === "statistics") {
          var tempData = data[key];
          Object.keys(tempData).forEach(item => {
            this.statistics.push(tempData[item]);
          });
        }
      }
    }
  },

  mounted() {
    this.init();
  }
};
</script>

<style lang="scss" scoped>
.dashboard {
  &-container {
    margin: 30px;
  }
  &-text {
    font-size: 30px;
    line-height: 46px;
  }
}
.dashboard-container {
  display: flex;
  flex-direction: row; //由左向右排列
  flex-wrap: wrap; //换行,且第一行在上方
  justify-content: flex-start; //左对齐
  flex-grow: 1; //平均分配项目控件(默认为0)
  flex-basis: auto; //分配多余控件
  // flex-shrink: 1;//等比缩小
}
</style>
