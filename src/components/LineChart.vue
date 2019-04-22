<template>
  <div></div>
</template>

<script>
import echarts from 'echarts'
import {random} from '@/utils/util'
import {Category5} from '@/config/colors'

export default {
  name: 'LineChart',
  props: {
    xAxis: {
      type: [Array],
      default: undefined
    },
    yAxis: {
      type: [Array],
      default: undefined
    }
  },
  watch: {
    xAxis (val) {
      this.xAxis = val
    },
    yAxis (val) {
      this.yAxis = val
      this.drawChart()
    }
  },
  data () {
    return {
    }
  },
  methods: {
    drawChart () {
      const color = Category5[random(5)]
      let chart = this.$el
      chart.style.height = '230px'
      chart.style.width = '100%'

      // 数据变化时更新折线图
      echarts.init(chart).setOption({
        grid: {
          left: 65,
          right: 10,
          top: 20,
          bottom: 30
        },
        tooltip: {
          axisPointer: {
            type: 'cross'
          }
        },
        dataZoom: [{
          type: 'inside',
          start: 0,
          end: 100
        }],
        xAxis: {
          type: 'category',
          // x轴的字体样式
          axisLabel: {
            show: true,
            textStyle: {
              color: '#8e8e8e',
              fontSize: '11'
            }
          },
          // 坐标轴上的刻度线
          axisTick: {
            show: false,
            alignWithLabel: false
          },
          // x轴的颜色和宽度
          axisLine: {
            onZero: false,
            lineStyle: {
              color: '#292929'
            }
          },
          axisPointer: {
            label: {
              formatter: function (params) {
                return params.value
              }
            }
          },
          data: this.xAxis
        },
        yAxis: {
          type: 'value',
          // y轴的字体样式
          axisLabel: {
            show: true,
            textStyle: {
              color: '#8e8e8e',
              fontSize: '11'
            }
          },
          // 坐标轴上的刻度线
          axisTick: {
            show: false,
            alignWithLabel: false
          },
          // 控制网格线是否显示
          splitLine: {
            show: false
          },
          axisLine: {
            lineStyle: {
              color: '#292929'
            }
          }
        },
        series: [
          {
            name: '',
            type: 'line',
            symbol: 'none',
            lineStyle: {
              normal: {
                width: 1,
                color: color
              }
            },
            itemStyle: {
              normal: {
                color: color
              }
            },
            smooth: true,
            data: this.yAxis
          }
        ]
      })
    }
  }
}
</script>
