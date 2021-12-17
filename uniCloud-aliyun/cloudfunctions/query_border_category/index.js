'use strict';
exports.main = async (event, context) => {
	//event为客户端上传的参数
	console.log('event : ', event)
	const { pageSize, pageIndex = 1 } = event
	const data = [
		{
			type: 0,
			name: '热门',
			sort:  0
		},
		{
			type: 1,
			name: '国庆',
			sort: 1
		},
		{
			type: 2,
			name: '渐变',
			sort: 2
		},
		{
			type: 3,
			name: '中秋',
			sort: 3
		},
		{
			type: 4,
			name: '其他',
			sort: 4
		},
	]
	const total = data.length //得到总记录数
	const totalPage = Math.ceil(total / pageSize) //计算页数
	//返回数据给客户端
	return {
		code: 0,
		success: true,
		data: {
			list: data || [],
			hasMore: false,
			page: {
				total,
				pageSize,
				pageIndex
			}
		},
		msg: '获取成功'
	}
};
