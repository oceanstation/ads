<template>
  <div>
    <div class="situation">
      <div class="refresh">
        <span>{{startTime | dateFormat}}</span>
        <span>Last 24 hours</span>
      </div>

      <div class="bfc">
        <!-- DNS and SMTP Services -->
        <div class="left w30">
          <div id="dns" class="box">
            <p>DNS AND SMTP SERVICES</p>
            <div>dc01.bigmkt1.com</div>
            <div>mail01.bigmkt1.com</div>
            <div>dc02.bigmkt2.com</div>
            <div>mail02.bigmkt2.com</div>
            <div>dc03.bigmkt3.com</div>
            <div>mail03.bigmkt3.com</div>
          </div>
        </div>
        <!-- All Web Services -->
        <div class="left w30 padL5 padR5">
          <div id="web" class="box">
            <p>ALL WEB SERVICES</p>
            <div>web01</div>
            <div>web02</div>
            <div>web03</div>
            <div>web01a</div>
            <div>web02a</div>
            <div>web03a</div>
            <div>web01b</div>
            <div>web02b</div>
            <div>web03b</div>
            <div>web01c</div>
            <div>web02c</div>
            <div>web03c</div>
            <div>web01d</div>
            <div>web02d</div>
            <div>web03d</div>
            <div style="border: none; background: none"></div>
            <div>web02l</div>
          </div>
        </div>
        <!-- IPs -->
        <div class="right w39">
          <div id="ips" class="box toRelative">
            <ScatterChart :scatter="scatter"></ScatterChart>
            <p class="pLeft">IPs<span>{{scatterTime}}</span></p>
            <p class="mouse pRight">+</p>
          </div>
        </div>
      </div>

      <div class="box">
        <!-- Anomaly Score -->
        <p>Anomaly Score</p>
        <LineChart :xAxis="times" :yAxis="score" />
      </div>

      <div class="bfc">
        <!-- Connect -->
        <div class="left49">
          <div class="box">
            <p>Connect</p>
            <LineChart :xAxis="times" :yAxis="connect" />
          </div>
        </div>
        <!-- Packet -->
        <div class="right49">
          <div class="box">
            <p>Packet</p>
            <LineChart :xAxis="times" :yAxis="packet" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import moment from 'moment'
import '@/assets/less/situation.less'
import LineChart from '@/components/LineChart'
import ScatterChart from '@/components/ScatterChart'
import axios from 'axios'

export default {
  name: 'Situation',
  components: {
    LineChart,
    ScatterChart
  },
  data () {
    return {
      times: [],
      score: [],
      connect: [],
      packet: [],
      scatter: [],
      startTime: 1364781900000, // 2013-04-01 10:05:00
      scatterTime: ' from ' + moment(1364781600000).format('HH:mm') + ' to ' + moment(1364781900000).format('HH:mm') // 记录散点图IP所属时间
    }
  },
  filters: {
    dateFormat: function (data) {
      return moment(data).format('YYYY-MM-DD HH:mm:ss')
    }
  },
  methods: {
    fetchChartData () {
      axios.get('/static/situation.json').then(response => {
        this.times = response.data.times // X轴数据
        this.score = response.data.score.data // 异常值
        this.connect = response.data.connect // 会话数量
        this.packet = response.data.packet // 包数量
        this.scatter = response.data.scatter // 散点图数据
      })
    }
  },
  mounted () {
    this.fetchChartData()
  }
}
</script>
