<template>
  <div>
    <!-- 和弦图模态框 -->
    <chord-modal/>
    <!-- 时间线参数 -->
    <div id="timeLineParam">
      <img @click="drawLine()" class="mouse" src="../assets/image/apply.svg">
      <label>From <input class="w130" v-model="lineParam.startTime"></label>
      <label>to <input class="w130" v-model="lineParam.endTime"></label>
      <label>Pattern:</label>
      <span @click="setPattern('regular')" :class="selectedPattern === 'regular' ? 'active' : ''">Regular</span>
      <span @click="setPattern('ddos')" :class="selectedPattern === 'ddos' ? 'active' : ''">DDoS</span>
      <span @click="setPattern('portscan')" :class="selectedPattern === 'portscan' ? 'active' : ''">Port Scans</span>
      <label>Reference:</label>
      <span class="refer" @click="setRefer('srcIp')" :class="selectedRefer === 'srcIp' ? 'active' : ''">srcIp</span>
      <span class="refer" @click="setRefer('destIp')"
            :class="selectedRefer === 'destIp' ? 'active' : ''">destIp</span>
      <span class="refer" @click="setRefer('srcPort')"
            :class="selectedRefer === 'srcPort' ? 'active' : ''">srcPort</span>
      <span class="refer" @click="setRefer('destPort')"
            :class="selectedRefer === 'destPort' ? 'active' : ''">destPort</span>
      <span class="refer" @click="setRefer('duration')"
            :class="selectedRefer === 'duration' ? 'active' : ''">duration</span>
      <span class="refer" @click="setRefer('inToOut')"
            :class="selectedRefer === 'inToOut' ? 'active' : ''">inToOut</span>
    </div>
    <!-- 时间线 -->
    <div id="timeLine" class="box">
      <div id="chart" class="loadBg"></div>
    </div>
    <div id="container" class="box toTopBox">
      <div id="legend" class="toLeft marginB-20">
        <span class="mouse" :style="{'background': color(0)}">inner</span>
        <span class="mouse" :style="{'background': color(1)}">outer</span>
        <span class="mouse" :style="{'background': color(2)}">other</span>
      </div>
      <div class="toCenter marginB-20">{{startTime}} to {{endTime}}</div>
      <span @click="setBrush(false)" :class="!brushing ? 'active btn' : 'btn'">drag</span>
      <span @click="setBrush(true)" :class="brushing ? 'active btn' : 'btn'">brush</span>
      <!-- IPs -->
      <div id="ips"></div>
      <div class="loadBgH300" v-if="IPLoading"></div>
    </div>
    <!-- IP散点图的详细信息 -->
    <div id="detail" class="box toBottomBox">
      <div class="loadBgH100" v-if="detailLoading"></div>
      <!-- brush所需区域IP的详细信息 -->
      <div v-if="detail.length">
        <div class="floatToLeft">Total:{{detail.length}}</div>
        <div class="tag" v-for="item in detail" v-bind:key="item.id">
          <span :style="{'background': color(item.group)}">{{item.name}}</span>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import * as d3 from 'd3'
import '@/assets/less/analysis.less'
import ChordModal from '@/components/ChordModal'
import pattern from '@/config/pattern'
import {Category10} from '@/config/colors'
import {chord, viewport} from '@/utils/util'
import {getEntropy, getIps, getChord, getScatter} from '@/api/analysis'

export default {
  data () {
    return {
      startTime: '--:--:--',
      endTime: '--:--:--',
      lineParam: {
        startTime: '2013-04-01 08:00:00',
        endTime: '2013-04-02 08:00:00'
      },
      selectedPattern: 'regular',
      selectedRefer: 'destIp',
      brushing: false, // 散点图是否支持brush
      color: d3.scaleOrdinal(Category10), // 颜色比例尺（散点视图和详细视图均需要）
      IPLoading: false, // 加载散点图数据时的Loading动画
      scatterDate: null, // 散点图数据
      detailLoading: false, // 加载detail数据时的Loading动画
      detail: []
    }
  },
  components: {
    ChordModal
  },
  created () {
    this.drawLine() // 初始化时间线
  },
  methods: {
    setPattern (p) {
      this.selectedPattern = p
      Object.assign(this.lineParam, pattern[p])
      d3.select('#chart').html('') // 清除画布
      this.drawLine(this.lineParam)
    },
    setRefer (r) {
      this.selectedRefer = r
    },
    // 绘制时间线
    drawLine (param = this.lineParam, refer = this.selectedRefer) {
      getEntropy(param).then(
        (response) => {
          let data = response.data.score
          data.map((item) => {
            item.score = item.score / response.data.max
          })

          const w = Math.max(viewport.width, 1280)
          const margin = {left: 30, top: 10, right: 40, bottom: 20}
          const width = w - margin.left - margin.right
          const height = 120
          const parseTime = d3.utcParse('%Y-%m-%dT%H:%M:%S.%LZ')

          d3.select('#chart').html('') // 清除画布
          let svg = d3.select('#chart')
            .append('svg')
            .attr('width', w - 30)
            .attr('height', 155)

          // 计算比例尺
          let x = d3.scaleTime()
            .domain(d3.extent(data, (d) => parseTime(d.time)))
            .range([0, width])
          let x2 = d3.scaleTime()
            .domain(x.domain())
            .range([0, width])

          let y = d3.scaleLinear()
            .domain([0, 1])
            .range([height, 0])

          // 绘制刻度
          let xAxis = d3.axisBottom(x).tickFormat(d3.timeFormat('%H:%M/%d')).ticks(15)
          let yAxis = d3.axisLeft(y)

          let zoomed = () => {
            let t = d3.event.transform
            x.domain(t.rescaleX(x2).domain())
            focus.select('.area').attr('d', area)
            focus.select('.line').attr('d', line)
            focus.select('.axis--x').call(xAxis)
            // points.attr('cx', (d) => x(parseTime(d.time)))
          }
          let zoom = d3.zoom()
            .scaleExtent([1, Infinity])
            .translateExtent([[0, 0], [width, height]])
            .extent([[0, 0], [width, height]])
            .on('zoom', zoomed)

          // 绘制面积图
          let area = d3.area()
            .curve(d3.curveMonotoneX)
            .x((d) => x(parseTime(d.time)))
            .y0(height)
            .y1((d) => y(d.score))

          // 绘制折线图
          let line = d3.line()
            .x((d) => x(parseTime(d.time)))
            .y((d) => y(0.5 + d.entropy[refer] / 2)) // 保持折线在时间线的上半区域

          // 定义矩形剪裁路径
          svg.append('clipPath')
            .attr('id', 'clip')
            .append('rect')
            .attr('width', width)
            .attr('height', height)

          // 创建画布
          let focus = svg.append('g')
            .attr('class', 'focus')
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

          focus.append('path')
            .datum(data)
            .attr('class', 'area')
            .attr('clip-path', 'url(#clip)') // 指向剪裁路径
            .attr('d', area)

          let lineTemp = focus.append('path')
            .datum(data)
            .attr('class', 'line')
            .attr('clip-path', 'url(#clip)') // 指向剪裁路径
            .attr('d', line)

          focus.append('g')
            .attr('class', 'axis axis--x')
            .attr('transform', 'translate(0,' + height + ')')
            .call(xAxis)

          focus.append('g')
            .attr('class', 'axis axis--y')
            .call(yAxis)

            // 折线图添加圆点（用于点击）
            // let points = focus.selectAll('circle')
            //   .data(data)
            //   .enter()
            //   .append('circle')
            //   .attr('cx', (d) => x(parseTime(d.time)))
            //   .attr('cy', (d) => y(d.score))
            //   .attr('r', '3px')
            //   .attr('fill', '#fff')
            //   .on('click', function (d) {
            //     console.log(d.time + ' ' + d.score)
            //   })

          // 绑定zoom
          svg.call(zoom)

          // 建立brush对象
          let brush = d3.brushX()
            .on('end', () => {
              if (d3.event.selection) {
                this.IPLoading = true // 显示loading动画
                this.detail = [] // 清除详细视图数据
                this.detailLoading = false
                d3.select('#ips').html('') // 清除画布

                let start = x.invert(d3.event.selection[0] - margin.left)
                let end = x.invert(d3.event.selection[1] - margin.left)
                let startTime = d3.timeFormat('%Y-%m-%d %H:%M:00')(start)
                let endTime = d3.timeFormat('%Y-%m-%d %H:%M:00')(end)
                if (startTime !== endTime) {
                  // 绘制散点图
                  this.startTime = startTime
                  this.endTime = endTime
                  this.scatterDate = null // 清空数据
                  this.IPLoading = true // 显示Loading动画
                  let _this = this
                  getScatter({'startTime': this.startTime, 'endTime': this.endTime}).then(
                    (response) => {
                      _this.IPLoading = false // 隐藏Loading动画
                      _this.scatterDate = {} // IP散点图数据
                      _this.scatterDate.startTime = startTime
                      _this.scatterDate.endTime = endTime
                      _this.scatterDate.data = response.data
                      _this.drawScatter(_this.scatterDate.data, _this.brushing)
                    },
                    (error) => {
                      console.log(error)
                    }
                  )
                }
              }
            })

          svg.append('g')
            .attr('class', 'brush')
            .call(brush)
            .selectAll('rect')
            .attr('y', 0)
            .attr('height', 10)

          // 切换参考线
          d3.selectAll('.refer')
            .on('click', function () {
              let line = d3.line()
                .x((d) => x(parseTime(d.time)))
                .y((d) => y(0.5 + d.entropy[d3.select(this).text()] / 2)) // 保持折线在时间线的上半区域

              lineTemp.transition()
                .duration(500)
                .ease(d3.easePolyInOut).attr('d', line)

              let zoomed = () => {
                let t = d3.event.transform
                x.domain(t.rescaleX(x2).domain())
                focus.select('.area').attr('d', area)
                focus.select('.line').attr('d', line)
                focus.select('.axis--x').call(xAxis)
              }

              let zoom = d3.zoom()
                .scaleExtent([1, Infinity])
                .translateExtent([[0, 0], [width, height]])
                .extent([[0, 0], [width, height]])
                .on('zoom', zoomed)

              svg.call(zoom)
            })
        },
        (error) => {
          console.log(error)
        }
      )
    },
    setBrush (d) {
      this.brushing = d
      this.detail = [] // 详细窗口信息
      this.drawScatter(this.scatterDate.data, this.brushing)
    },
    // 绘制散点图
    drawScatter (data, brushing) {
      let _this = this
      d3.select('#ips').html('') // 清除画布

      const w = viewport.width - 12 // 12为父div的margin和border
      const h = 360 // drag时不使用详细视图

      // 创建比例尺(-10+10用来避免节点超出画布)
      let xScale = d3.scaleLinear()
        .domain([d3.min(data, (d) => d[0]), d3.max(data, (d) => d[0])])
        .range([10, w - 10])

      let yScale = d3.scaleLinear()
        .domain([d3.min(data, (d) => d[1]), d3.max(data, (d) => d[1])])
        .range([10, h - 10])

      // 检测散点被拖出画布的方向（left,bottom,right）
      let checkOut = (x, y) => {
        if (x < 10) {
          return 'left'
        } else if (y > h - 10) {
          return 'bottom'
        } else if (x > w - 10) return 'right'
      }

      let pos = {} // 记录拖拽前的坐标
      let ips = null // 记录所关联的IP
      let drag = d3.drag()
        .subject(function () { // 定义了元素拖拽行为的原点
          let t = d3.select(this)
          return {
            x: t.attr('cx'),
            y: t.attr('cy')
          }
        })
        .on('drag', function (d) { // 拖拽事件
          d3.select(this)
            .attr('cx', d.cx = d3.event.x)
            .attr('cy', d.cy = d3.event.y)
        })
        .on('start', function () { // 拖拽开始时
          // 全部设置为灰色
          d3.selectAll('circle').style('fill', '#6a6a6a')

          // 存储原位置
          pos.ip = d3.select(this).attr('name')
          pos.x = d3.select(this).attr('cx')
          pos.y = d3.select(this).attr('cy')

          // 清除关联的IP
          ips = null

          // 获取相关联IP
          getIps({'startTime': _this.startTime, 'endTime': _this.endTime, 'ip': d3.select(this).attr('name')}).then(
            (response) => {
              ips = response.data
              // 突出显示相关联的节点
              for (let key of Object.keys(ips)) {
                let node = d3.select('#ip' + key.split('.').join(''))
                node.style('fill', (d) => _this.color(d[3])).attr('r', (d) => Math.max(3, Math.floor(d[4] * 15)) + 3)
              }
            },
            (error) => {
              console.log(error)
            }
          )

          // 为选中的节点添加颜色
          let node = d3.select(this)
          node.style('fill', (d) => _this.color(d[3]))
            .attr('r', (d) => Math.max(3, Math.floor(d[4] * 15)) + 3)
            .style('stroke-opacity', 1)
        })
        .on('end', function () { // 拖拽结束后
          // 恢复颜色和大小
          d3.selectAll('circle')
            .style('fill', (d) => _this.color(d[3]))
            .attr('r', (d) => Math.max(3, Math.floor(d[4] * 15)))

          let x = parseFloat(d3.select(this).attr('cx'))
          let y = parseFloat(d3.select(this).attr('cy'))

          if (checkOut(x, y) === 'left' || checkOut(x, y) === 'bottom' || checkOut(x, y) === 'right') { // 触发该IP的和弦视图和平行坐标视图
            // 踢回散点
            d3.select('#ip' + pos.ip.split('.').join(''))
              .transition()
              .duration(500)
              .ease(d3.easePolyInOut)
              .attr('cx', pos.x)
              .attr('cy', pos.y)
              // 绘制和弦图
            _this.drawChord(_this.scatterDate.startTime, _this.scatterDate.endTime, d3.select(this).attr('name'))
          } else {
            // 重新排列所有相关联的散点
            if (ips) {
              // 计算新坐标
              let n = Object.keys(ips).length
              let a = 2 * Math.PI / n

              // 权重
              let weight = []
              for (let value of Object.values(ips)) {
                weight.push(value)
              }
              // 设置半径比例尺（权重大的半径小）
              let scale = d3.scaleLinear()
                .domain([d3.min(weight), d3.max(weight)])
                .range([150, 30])

              // 重新排列
              let i = 0
              // 清除所有直线
              svg.selectAll('line').remove()

              for (let key of Object.keys(ips)) {
                // 移动散点
                let node = d3.select('#ip' + key.split('.').join(''))
                let xNew = x + scale(ips[key]) * Math.sin(a * i)
                let yNew = y + scale(ips[key]) * Math.cos(a * i)

                node.transition()
                  .duration(300)
                  .ease(d3.easePolyInOut)
                  .attr('cx', xNew)
                  .attr('cy', yNew)
                  .transition()
                  .duration(300)
                  .ease(d3.easePolyInOut)
                  .attr('cx', (d) => {
                    // 防止超出画布检测
                    if (xNew < Math.max(3, Math.floor(d[4] * 15))) {
                      xNew = Math.max(3, Math.floor(d[4] * 15))
                    } else if (xNew > w - Math.max(3, Math.floor(d[4] * 15))) {
                      xNew = w - Math.max(3, Math.floor(d[4] * 15))
                    }
                    return xNew
                  })
                  .attr('cy', (d) => {
                    // 防止超出画布检测
                    if (yNew < Math.max(3, Math.floor(d[4] * 15))) {
                      yNew = Math.max(3, Math.floor(d[4] * 15))
                    } else if (yNew > h - Math.max(3, Math.floor(d[4] * 15))) {
                      yNew = h - Math.max(3, Math.floor(d[4] * 15))
                    }
                    return yNew
                  })

                // 绘制连接线
                svg.append('line')
                  .transition()
                  .duration(300)
                  .attr('x1', x)
                  .attr('y1', y)
                  .attr('x2', xNew)
                  .attr('y2', yNew)
                  .attr('stroke', '#afafaf')
                  .attr('stroke-width', 0.1)
                  .style('pointer-events', 'none') // 设置连接线永远不会成为鼠标事件的target

                i++
              }
            }
          }
        })

      // 创建SVG
      let svg = d3.select('#ips')
        .append('svg')
        .attr('width', w)
        .attr('height', h)

      // 绘制散点
      svg.selectAll('circle')
        .data(data)
        .enter()
        .append('circle')
        .attr('id', (d) => 'ip' + d[2].split('.').join(''))
        .attr('name', (d) => d[2])
        .attr('cx', (d) => xScale(d[0])) // 避免落入矩形区域
        .attr('cy', (d) => yScale(d[1]))
        .attr('r', (d) => Math.max(3, Math.floor(d[4] * 15)))
        .attr('class', (d) => {
          if (d[3] === 0) {
            return 'in'
          } else if (d[3] === 1) {
            return 'out'
          } else {
            return 'other'
          }
        })
        .style('fill', (d) => _this.color(d[3]))
        .style('stroke', '#fff')
        .style('stroke-opacity', 0.3)
        .style('cursor', 'pointer')
        .on('mouseover', function () {
          // 为选中的节点添加颜色
          let node = d3.select(this)
          node.style('fill', (d) => _this.color(d[3]))
            .attr('r', (d) => Math.max(3, Math.floor(d[4] * 15)) + 3)
            .style('stroke-opacity', 1)

          // 为选中节点添加文本标签
          d3.select('#ips')
            .select('svg')
            .append('text')
            .attr('x', node.attr('cx'))
            .attr('y', node.attr('cy') - 10)
            .text(node.attr('name'))
            .attr('font-size', '11px')
            .style('text-anchor', 'middle')
            .style('fill', '#fff')
        })
        .on('mouseout', function () {
          d3.select(this)
            .attr('r', (d) => Math.max(3, Math.floor(d[4] * 15)))
            .style('stroke-opacity', 0.3)

          // 去掉文字标签
          d3.select('#ips').selectAll('text').remove()
        })
        .call(drag)

      // 添加IP散点筛选事件
      d3.select('#legend')
        .selectAll('span')
        .on('click', function () {
          let type = d3.select(this)._groups[0][0].innerText
          if (type === 'outer') {
            // 清除所有直线
            svg.selectAll('line').remove()
            // 移动散点
            d3.selectAll('.out')
              .transition()
              .duration(500)
              .ease(d3.easePolyInOut)
              .attr('cx', 30)
          } else if (type === 'other') {
            // 清除所有直线
            svg.selectAll('line').remove()
            // 移动散点
            d3.selectAll('.other')
              .transition()
              .duration(500)
              .ease(d3.easePolyInOut)
              .attr('cx', 50)
          }
        })

      // 是否设置brush
      if (brushing) {
        // 建立brush对象
        let brush = d3.brush()
          .on('start', () => {
            // 恢复颜色和大小
            d3.selectAll('circle').style('fill', (d) => _this.color(d[3]))
            // 清空detail数据
            this.detail = []
          })
          .on('end', () => {
            if (d3.event.selection) {
              let area = d3.event.selection
              d3.selectAll('circle')
                .style('fill', (d) => {
                  // 区域外的散点设置为灰色
                  if (xScale(d[0]) >= area[0][0] && xScale(d[0]) <= area[1][0] && yScale(d[1]) >= area[0][1] && yScale(d[1]) <= area[1][1]) {
                    let tmp = {}
                    tmp.name = d[2]
                    tmp.group = d[3]
                    this.detail.push(tmp)
                    return _this.color(d[3])
                  } else {
                    return '#6a6a6a'
                  }
                })
            }
          })

        svg.append('g')
          .attr('class', 'brush')
          .call(brush)
      }
    },
    // 绘制和弦图
    drawChord: function (start, end, ip) {
      this.$modal.show('chord-modal', {}, {draggable: true}) // 启动模态框
      getChord({startTime: start, endTime: end, ip: ip}).then(
        (response) => {
          d3.select('.modal-title').html('') // 清除标题
          d3.select('#chordChart').html('') // 清除画布

          d3.select('.modal-title').append('p').text(ip + ' From ' + start + ' to ' + end) // 创建标题

          const width = 550
          const height = 550 // 画布宽和高
          const outerRadius = Math.min(width, height) / 2 - 10
          const innerRadius = outerRadius - 15 // 和弦图半径

          let svg = d3.select('#chordChart')
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .append('g')
            .attr('id', 'chordChart') // 用于限定样式
            .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')') // 坐标原点移到画布中间

          svg.append('circle')
            .attr('r', outerRadius) // +10是为了使鼠标移动出时触发事件

          // 和弦图包含两部分（外部圆弧Arc和内部弦Ribbon）
          let g = svg.datum(chord(response.data.matrix))

          // Ribbon 绘制外部的圆弧: arr格式为[innerRadius, outerRadius, startAngle, endAngle]
          let myArc = (arr) => {
            // 极坐标(r,a)转直角坐标(x,y)
            let polar = (r, a) => [r * Math.cos(a), r * Math.sin(a)]

            // 圆弧的四个关键点
            let ss = polar(arr[0], arr[2])
            let se = polar(arr[0], arr[3])
            let es = polar(arr[1], arr[2])
            let ee = polar(arr[1], arr[3])

            // 返回路径
            return ['M', ss, 'A', arr[0], arr[0], '0', (arr[3] - arr[2] > Math.PI ? 1 : 0), '1', se, 'L', ee,
              'A', arr[1], arr[1], '0', (arr[3] - arr[2] > Math.PI ? 1 : 0), '0', es, 'Z'].join(' ')
          }

          let groups = g.append('g')
            .attr('class', 'groups')
            .selectAll('g')
            .data((d) => d.groups)
            .enter()
            .append('g')
            .style('cursor', 'pointer')
            .on('mouseover', (d, i) => {
              // 更改内部弦的样式（隐藏不相关的弦）
              chords.classed('fade', (p) => p.source.index !== i && p.target.index !== i)
            })

          // 鼠标停留显示的提示
          groups.append('title')
            .text((d, i) => response.data.ips[i] + '(' + d.value + ')')

          let groupPath = groups.append('path')
            .attr('id', (d, i) => 'group' + i)
            .attr('d', (d) => myArc([innerRadius, outerRadius, d.startAngle, d.endAngle]))
            .style('fill', (d, i) => this.color(i))

          // 添加文本标注
          let groupText = groups.append('text')
            .attr('x', 3) // x坐标
            .attr('dy', -3) // 相对于当前位置在y方向上平移的距离(正则往下，负则往上)
            .append('textPath')
            .attr('xlink:href', (d, i) => '#group' + i)
            .text((d, i) => response.data.ips[i] + '(' + d.value + ')')

          // 移除过长的文本标注
          groupText.filter(function (d, i) {
            return groupPath._groups[0][i].getTotalLength() / 2 - 16 < this.getComputedTextLength()
          }).remove()

          // Arc 绘制内部的弦（圆弧+二次贝塞尔曲线+圆弧+二次贝塞尔曲线）
          let myRibbon = (r, ss, se, es, ee) => {
            // 极坐标(r,a)转直角坐标(x,y)
            let polar = (r, a) => [r * Math.cos(a), r * Math.sin(a)]

            // 绘制圆弧：A rx ry x-axis-rotation large-arc-flag sweep-flag x y
            let arc = (r, p, a) => ['A', r, r, 0, (a > Math.PI ? 1 : 0), 1, p].join(' ')

            // 绘制二次贝塞尔曲线：Q x1 x2 x y
            let curve = (p, a0, a1, r) => {
              a1 = a1 + (a1 < a0 ? 2 * Math.PI : 0)
              let a = a1 - a0
              let t = 1 - (a > Math.PI ? 2 * Math.PI - a : a) / Math.PI
              t = Math.pow(t, 6)
              let a2 = (a1 + a0) / 2 - (a1 - a0 > Math.PI ? Math.PI : 0)
              return ['Q', (t * r * Math.cos(a2)), (t * r * Math.sin(a2)), p].join(' ')
            }

            let pss = polar(r, ss)
            let pse = polar(r, se)
            let pes = polar(r, es)
            let pee = polar(r, ee)

            return ['M', pss, arc(r, pse, se - ss), curve(pes, se, es, r), arc(r, pee, ee - es), curve(pss, ss, ee, r), 'Z'].join(' ')
          }

          // 绘制内部弦
          let chords = g.append('g')
            .attr('class', 'ribbons')
            .selectAll('path')
            .data((d) => d)
            .enter()
            .append('path')
            .attr('d', (d) => myRibbon(innerRadius, d.source.startAngle, d.source.endAngle, d.target.startAngle, d.target.endAngle))
            .style('fill', (d) => this.color(d.target.index))

          // 鼠标停留显示的提示
          chords.append('title')
            .text((d) => response.data.ips[d.source.index] + ' → ' + response.data.ips[d.target.index] + ': ' + d.source.value +
                '\n' + response.data.ips[d.target.index] + ' → ' + response.data.ips[d.source.index] + ': ' + d.target.value)
        },
        (error) => {
          console.log(error)
        })
    }
  }
}
</script>
