// 生成[1,...,n]内的随机数
export function random (n) {
  return Math.floor(Math.random() * n + 1)
}

// 由n生成数组[0,1,2,3,...,n-1]
export function range (n) {
  let range = []
  for (let i = 0; i < n; i++) {
    range.push(i)
  }
  return range
}

// 计算和弦图数据
export function chord (matrix) {
  let padAngle = 0.01// 圆弧之间的间隔（弧度）

  let n = matrix.length
  let matrixBackup = []// 备份matrix
  let groupSums = [] // 各IP的出流量
  let groupSumsBackup = []
  let k = 0 // groupSums为0的个数
  let groupIndex = range(n) // 绘制group的顺序[0,1,2,...n-1]
  let subgroupIndex = []// 绘制subgroup的顺序[[0,1,2,...n-1],...]
  let chords = [] // 内部弦数据
  let groups = chords.groups = new Array(n) // 外部弧数据
  let subgroups = new Array(n * n)// 用于构成内部弦（subgroup <-> subgroup）
  let all = 0// 总流量

  // 求matrix的最大值和最小值
  let max = 0
  let min = 10000
  for (let i = 0; i < n; i++) {
    let tmp = []
    for (let j = 0; j < n; j++) {
      if (matrix[i][j] > max) max = matrix[i][j]
      if (matrix[i][j] < min) min = matrix[i][j]
      tmp.push(matrix[i][j])
    }
    matrixBackup.push(tmp)
  }

  // [min,max]映射到[-5,5],再由函数y=arctan(x)+0.5*pi得到新的值并更新matrix中的数据
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      matrix[i][j] = matrix[i][j] ? Math.atan(10 * (matrix[i][j] - min) / (max - min) - 5) + 0.5 * Math.PI : 0
    }
  }

  // 计算IP的出流量和整个网络的总流量.
  for (let i = 0; i < n; i++) {
    let tmp = 0
    let tmpBackup = 0
    for (let j = 0; j < n; j++) {
      tmp += matrix[i][j]
      tmpBackup += matrixBackup[i][j]
    }

    if (tmp === 0) k++
    groupSums.push(tmp)
    groupSumsBackup.push(tmpBackup)
    subgroupIndex.push(range(n))
    all += tmp
  }

  // groups排序
  groupIndex.sort((a, b) => groupSums[a] - groupSums[b])

  // subgroups排序
  subgroupIndex.forEach((d, i) => {
    d.sort((a, b) => matrix[i][a] - matrix[i][b])
  })

  // 根据各个IP的出流量大小分割[0, 2*pi]，value为零的group占3*padAngle
  let perAngle = (Math.PI * 2 - padAngle * (n + 3 * k)) / all

  // 计算每个group和subgroup的起始和终止角度
  let angle = 0
  for (let i = 0; i < n; i++) {
    let tmpAngle = angle
    let di = groupIndex[i]
    let value = groupSums[di]
    angle += (value ? value * perAngle : 3 * padAngle)

    // 计算group角度
    groups[di] = {
      index: di,
      startAngle: tmpAngle,
      endAngle: angle,
      value: groupSumsBackup[di]
    }

    // 计算subgroup角度
    let tmpSubAngle = tmpAngle
    for (let j = 0; j < n; j++) {
      let dj = subgroupIndex[di][j]
      let value = matrix[di][dj]
      let a0 = tmpSubAngle
      tmpSubAngle += value * perAngle
      let a1 = tmpSubAngle
      if (groupSums[di]) {
        subgroups[dj * n + di] = {
          index: di,
          subindex: dj,
          startAngle: a0,
          endAngle: a1,
          value: matrixBackup[di][dj]
        }
      } else {
        // 出流量为0
        subgroups[dj * n + di] = {
          index: di,
          subindex: dj,
          startAngle: tmpAngle,
          endAngle: angle,
          value: matrixBackup[di][dj]
        }
      }
    }
    angle += padAngle// 添加空隙
  }

  // 计算chords（matrix[i][j]和matrix[j][i]不全为0）
  for (let i = 0; i < n; i++) {
    for (let j = i; j < n; j++) {
      let source = subgroups[j * n + i]
      let target = subgroups[i * n + j]
      if (source.value || target.value) {
        chords.push(source.value < target.value ? {source: target, target: source} : {source: source, target: target})
      }
    }
  }
  return chords
}

// 计算浏览器宽度/高度
export const viewport = {
  width: document.documentElement.clientWidth,
  height: document.documentElement.clientHeight
}
