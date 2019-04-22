<template>
  <div></div>
</template>

<script>
import echarts from 'echarts'
import {Category5} from '@/config/colors'

export default {
  name: 'ScatterChart',
  props: {
    scatter: {
      type: [Array],
      default: undefined
    }
  },
  watch: {
    scatter (val) {
      this.scatter = val
      this.drawChart()
    }
  },
  data () {
    return {
    }
  },
  methods: {
    drawChart () {
      let chart = this.$el
      chart.style.height = '230px'
      chart.style.width = '100%'
      // 数据变化时更新折线图
      echarts.init(chart).setOption({
        grid: {
          left: 0,
          right: 0,
          top: 0,
          bottom: 0
        },
        xAxis: [
          {
            type: 'value',
            scale: true,
            axisLabel: {
              show: false
            },
            splitLine: {
              show: false
            },
            // 坐标轴上的刻度线
            axisTick: {
              show: false
            },
            // x轴的颜色和宽度
            axisLine: {
              show: false
            }
          }
        ],
        yAxis: [
          {
            type: 'value',
            scale: true,
            axisLabel: {
              show: false
            },
            splitLine: {
              show: false
            },
            // 坐标轴上的刻度线
            axisTick: {
              show: false
            },
            // y轴的颜色和宽度
            axisLine: {
              show: false
            }
          }
        ],
        series: [
          {
            name: '',
            type: 'scatter',
            symbolSize: function (data) { // 散点的大小
              return Math.max(3, Math.ceil(data[4] * 10))
            },
            label: {
              emphasis: {// 散点的标签
                position: 'top',
                distance: 10,
                show: true,
                formatter: function (param) {
                  return param.data[2]
                },
                backgroundColor: '#eeeeee',
                borderColor: '#555555',
                borderWidth: 1,
                padding: 3,
                fontSize: 13,
                color: '#000000'
              }
            },
            itemStyle: { // 散点的颜色
              normal: {
                color: function (param) {
                  return Category5[param.data[3]]
                }
              }
            },
            data: this.scatter
          }
        ]
      })
    }
  }
}
</script>
