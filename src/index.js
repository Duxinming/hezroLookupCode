// 引入 node-xlsx 模块
const xlsx = require('node-xlsx')
// 引入 axios 模块
const Axios = require('axios')
// 引入 express 模块
const express = require('express')
// 引入 body-parser 模块
const bodyParser = require('body-parser')
const multer = require('multer')
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

const { data, info } = require('./mock')

const app = express()
app.use(express.static('public'))
app.use(bodyParser.json())

let API_HOST = '192.168.84.17:30018'
let TOKEN = '2fa9a3a0-ed24-4536-9ef6-77c59b3d566e'
let TENANTID = 3

// excel文件类径
// const excelFilePath = './excel/lookUpCode.xlsx'

//解析excel, 获取到所有sheets
// const sheets = xlsx.parse(excelFilePath)

// 查看页面数
// console.log(sheets.length)

// 打印页面信息..
// const sheet = sheets[0]

// const lovCode = sheet.data[0][0]

let config = {
  headers: {
    Authorization: `bearer ${TOKEN}`,
  },
}

const getLovInfo = (lovCode) =>
  Axios.get(
    `http://${API_HOST}/hpfm/v1/${TENANTID}/lov-headers?lovCode=${lovCode}&page=0&size=10&tenantId=3`,
    config
  )

const getLovDteail = (lovId) =>
  Axios.get(`http://${API_HOST}/hpfm/v1/lov-headers/${lovId}?size=200`, config)

const login = () =>
  Axios.get(`http://${API_HOST}/iam/hzero/v1/users/self`, config)

const dataArr = []
// 输出每行内容
// console.log(sheet.data)

// !(async function () {
//   const { data } = await getLovInfo()
//   if (data.content.length === 1) {
//     const { lovId } = data.content[0]
//     sheet.data.forEach((row, index) => {
//       // 数组格式, 根据不同的索引取数据
//       if (index > 1 && row[0] && row[1]) {
//         const [value, meaning, orderSeq, tag, description] = row
//         const obj = {
//           value,
//           meaning,
//           orderSeq,
//           startDateActive: '',
//           endDateActive: '',
//           enabledFlag: 1,
//           description,
//           tag,
//           lovId,
//           lovCode,
//           tenantId: 3,
//         }
//         Axios.post(`http://${API_HOST}/hpfm/v1/${TENANTID}/lov-values`, obj, config)
//           .then((res) => {
//             console.log(res.data)
//           })
//           .catch((err) => {
//             console.log(err)
//           })
//       }
//     })
//   }
// })()

app.post('/login', async (req, res) => {
  const { ip, token } = req.body
  API_HOST = ip
  TOKEN = token
  config = {
    headers: {
      Authorization: `bearer ${token}`,
    },
  }
  const { data: info } = await login()
  if (info) {
    return res.json({
      code: 1,
      msg: 'success',
      info,
    })
  } else {
    return res.json({
      code: 0,
      msg: '登录失败',
    })
  }
})

app.post('/upload', upload.single('file'), async (req, res) => {
  //解析excel, 获取到所有sheets
  const sheets = xlsx.parse(req.file.buffer)
  // 打印页面信息..
  const sheet = sheets[0]

  const [[lovCode], _, ...info] = sheet.data
  if (!lovCode) {
    return res.json({
      code: 0,
      msg: '没有正确的code,请检查！',
    })
  }
  const data = []
  const {
    data: { content },
  } = await getLovInfo(lovCode)
  let isCreate = true
  let lovValueData = []
  if (content.filter(({ enabledFlag }) => enabledFlag).length === 1) {
    isCreate = false
    const { lovId, tenantId } = content.filter(
      ({ enabledFlag }) => enabledFlag
    )[0]
    // 当前值集租户赋值
    TENANTID = tenantId
    const lovDteailRes = await getLovDteail(lovId)
    const {
      data: { content: lovDetailContent },
    } = lovDteailRes
    if (lovDetailContent.length) {
      lovValueData = lovDetailContent.map(({ value }) => value)
    }
  }
  info.forEach(([value, meaning, orderSeq, tag, description]) => {
    if (value) {
      // 0 待创建 1 待更新
      let status = 0
      if (lovValueData.length > 0 && lovValueData.includes(value)) {
        status = 1
      }
      data.push({
        value,
        meaning,
        orderSeq,
        startDateActive: '',
        endDateActive: '',
        enabledFlag: 1,
        description,
        tag,
        lovId: null,
        lovCode,
        tenantId: TENANTID,
        status,
      })
    }
  })
  return res.json({
    code: 1,
    msg: 'success',
    isCreate,
    lovCode: lovCode.replace('\n', ''),
    data,
  })
})

app.get('/list', (req, res) => {
  console.log(process.env.NODE_ENV)
  res.json(mock)
})

app.listen(3000, () => {
  console.log('server is running')
})
