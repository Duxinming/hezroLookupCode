// 引入 node-xlsx 模块
const xlsx = require('node-xlsx')
const Axios = require('axios')

const API_HOST = '192.168.84.17:30038'
const TOKEN = 'bd8cabb6-8431-42e1-8e77-96fc0ef2fb62'

// excel文件类径
const excelFilePath = '../public/lookUpCode.xlsx'

//解析excel, 获取到所有sheets
const sheets = xlsx.parse(excelFilePath)

// 查看页面数
console.log(sheets.length)

// 打印页面信息..
const sheet = sheets[0]

const lovCode = sheet.data[0][0]

const config = {
  headers: {
    Authorization: `bearer ${TOKEN}`,
  },
}

const getLovInfo = () =>
  Axios.get(
    `http://${API_HOST}/hpfm/v1/3/lov-headers?lovCode=${lovCode}&page=0&size=10&tenantId=3`,
    config
  )

const dataArr = []
// 输出每行内容
console.log(sheet.data)

!(async function () {
  const { data } = await getLovInfo()
  if (data.content.length === 1) {
    const { lovId } = data.content[0]
    sheet.data.forEach((row, index) => {
      // 数组格式, 根据不同的索引取数据
      if (index > 1 && row[0] && row[1]) {
        const [value, meaning, orderSeq, tag, description] = row
        const obj = {
          value,
          meaning,
          orderSeq,
          startDateActive: '',
          endDateActive: '',
          enabledFlag: 1,
          description,
          tag,
          lovId,
          lovCode,
          tenantId: 3,
        }
        Axios.post(`http://${API_HOST}/hpfm/v1/3/lov-values`, obj, config)
          .then((res) => {
            console.log(res.data)
          })
          .catch((err) => {
            console.log(err)
          })
      }
    })
  }
})()
