const Mock = require('mockjs')

const data = Mock.mock({
  'items|0-10': [
    {
      id: '@id',
      title: '@sentence(10, 20)',
      'status|1': ['published', 'draft', 'deleted'],
      author: 'name',
      display_time: '@datetime',
      pageviews: '@integer(300, 5000)',
    },
  ],
})

const info = {
  _token: 'keUs24wdEJx8Lgl9KbyHaW3Pyg8anglhvllGobP5iHXp9gG7BAVD+JyOIJftOPBm',
  id: 1,
  loginName: 'admin',
  email: 'admin@hzero.com',
  organizationId: 0,
  realName: '超级管理员',
  phone: '18666666666',
  internationalTelCode: '+86',
  language: 'zh_CN',
  languageName: '简体中文',
  timeZone: 'GMT+8',
  lastPasswordUpdatedAt: '2024-05-15 13:53:01',
  phoneCheckFlag: 0,
  emailCheckFlag: 0,
  passwordResetFlag: 1,
  tenantName: 'HZERO平台',
  tenantNum: 'HZERO',
  dateFormat: 'YYYY-MM-DD',
  timeFormat: 'HH:mm:ss',
  dateTimeFormat: 'YYYY-MM-DD HH:mm:ss',
  changePasswordFlag: 0,
  title: 'ALM-资产平台',
  logo: '',
  menuLayout: 'inline',
  menuLayoutTheme: 'default',
  roleMergeFlag: 1,
  tenantId: 0,
  currentRoleId: 1,
  currentRoleCode: 'role/site/default/administrator',
  currentRoleName: '平台级角色',
  currentRoleLevel: 'site',
  favicon: '',
  dataHierarchyFlag: 0,
  recentAccessTenantList: [
    {
      creationDate: null,
      createdBy: null,
      lastUpdateDate: null,
      lastUpdatedBy: null,
      objectVersionNumber: null,
      tenantId: 0,
      tenantName: 'HZERO平台',
      tenantNum: 'HZERO',
      enabledFlag: null,
      limitUserQty: null,
      group: null,
      sourceKey: null,
      sourceCode: null,
    },
    {
      creationDate: null,
      createdBy: null,
      lastUpdateDate: null,
      lastUpdatedBy: null,
      objectVersionNumber: null,
      tenantId: 2,
      tenantName: 'ALM租户',
      tenantNum: 'DQ',
      enabledFlag: null,
      limitUserQty: null,
      group: null,
      sourceKey: null,
      sourceCode: null,
    },
    {
      creationDate: null,
      createdBy: null,
      lastUpdateDate: null,
      lastUpdatedBy: null,
      objectVersionNumber: null,
      tenantId: 3,
      tenantName: 'WMS租户',
      tenantNum: 'DQ_WMS',
      enabledFlag: null,
      limitUserQty: null,
      group: null,
      sourceKey: null,
      sourceCode: null,
    },
  ],
}

// 添加
Mock.mock('/api/add/news', 'post', (options) => {
  let body = JSON.parse(options.body)

  data.list.push(
    Mock.mock({
      id: '@increment(1)',
      title: body.title,
      content: body.content,
      add_time: '@date(yyyy-MM-dd hh:mm:ss)',
    })
  )

  return {
    status: 200,
    message: '添加成功',
    list: data.list,
  }
})

module.exports = { info, data }
