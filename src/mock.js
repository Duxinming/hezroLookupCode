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

module.exports = { data }
