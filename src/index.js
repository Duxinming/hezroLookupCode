// 引入 node-xlsx 模块
const xlsx = require('node-xlsx')
// 引入 axios 模块
const Axios = require('axios')
// 引入 express 模块
const express = require('express')
// 引入 body-parser 模块
const bodyParser = require('body-parser')
// 引入 cors 模块
const cors = require('cors')
const multer = require('multer')
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

const { data, info } = require('./mock')

const app = express()
app.use(express.static('public'))
app.use(bodyParser.json())
//跨域问题解决方面
app.use(
  cors({
    origin: ['http://43.142.69.36:80'], //可设置多个跨域域名
    credentials: true, //允许客户端携带验证信息
  })
)

let API_HOST = '192.168.84.17:30018'
let TOKEN = '2fa9a3a0-ed24-4536-9ef6-77c59b3d566e'
let TENANTID = 3

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
  Axios.get(
    `http://${API_HOST}/hpfm/v1/lov-headers/${lovId}/values?size=200`,
    config
  )

const login = () =>
  Axios.get(`http://${API_HOST}/iam/hzero/v1/users/self`, config)

const createLookupCode = (lovInfo) =>
  Axios.post(
    `http://${API_HOST}/hpfm/v1${TENANTID ? `/${TENANTID}` : ''}/lov-headers`,
    {
      ...lovInfo,
      tenantId: TENANTID,
    },
    config
  )
const createLookupCodeItem = (obj) =>
  Axios.post(
    `http://${API_HOST}/hpfm/v1${TENANTID ? `/${TENANTID}` : ''}/lov-values`,
    obj,
    config
  )
    .then((res) => {
      console.log('res', res.data)
      return res ? true : false
    })
    .catch((err) => {
      console.log('err', err)
      return false
    })

const updateLookupCodeItem = (obj) =>
  Axios.put(
    `http://${API_HOST}/hpfm/v1${TENANTID ? `/${TENANTID}` : ''}/lov-values`,
    obj,
    config
  )
    .then((res) => {
      console.log('res', res.data)
      return res ? true : false
    })
    .catch((err) => {
      console.log('err', err)
      return false
    })

app.post('/login', async (req, res) => {
  const { ip, token, tenantId } = req.body
  API_HOST = ip
  TOKEN = token
  TENANTID = Number(tenantId)
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

  const [[lovCode, lovName], _, ...info] = sheet.data
  if (!lovCode || !lovName) {
    return res.json({
      code: 0,
      msg: '没有正确的编码或名称,请检查！',
    })
  }
  const data = []
  const {
    data: { content },
  } = await getLovInfo(lovCode)
  let isCreate = true
  let lovValueData = []
  let lovId = null
  if (content.filter(({ enabledFlag }) => enabledFlag).length === 1) {
    isCreate = false
    const { lovId: currentLovId } = content.filter(
      ({ enabledFlag }) => enabledFlag
    )[0]
    lovId = currentLovId
    const lovDteailRes = await getLovDteail(lovId)
    const {
      data: { content: lovDetailContent },
    } = lovDteailRes
    if (lovDetailContent.length) {
      lovValueData = lovDetailContent
    }
  }
  info.forEach(([value, meaning, orderSeq, tag, description]) => {
    if (value) {
      // 0 待创建 1 待更新
      let status = 0
      let obj = {}
      if (
        lovValueData.length > 0 &&
        lovValueData.filter((e) => e.value === value.toString()).length === 1
      ) {
        obj = lovValueData.filter((e) => e.value === value.toString())[0]
        status = 1
      }
      data.push({
        ...obj,
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
    lovName: lovName.replace('\n', ''),
    data,
  })
})

app.post('/import', async (req, res) => {
  const {
    isCreate,
    lovInfo: { lovCode, lovName, data },
  } = req.body
  if (isCreate) {
    createLookupCode({
      lovCode,
      lovName,
      lovTypeCode: 'IDP',
      enabledFlag: 1,
      mustPageFlag: 1,
    }).then((r) => {
      if (r) {
        Promise.all(
          data.map(async (item) => {
            // 数组格式, 根据不同的索引取数据
            return await createLookupCodeItem(item)
          })
        ).then((r) => {
          return res.json({ success: r.every((e) => e) })
        })
      } else {
        return res.json({ success: false })
      }
    })
  } else {
    Promise.all(
      data.map(async (item) => {
        // 数组格式, 根据不同的索引取数据
        if (item.status === 0) {
          return await createLookupCodeItem(item)
        } else {
          return await updateLookupCodeItem(item)
        }
      })
    ).then((r) => {
      return res.json({ success: r.every((e) => e) })
    })
  }
})

app.get('/list', (req, res) => {
  console.log(process.env.NODE_ENV)
  res.json(mock)
})

app.listen(3000, () => {
  console.log('server is running')
})
