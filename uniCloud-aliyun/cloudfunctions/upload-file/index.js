'use strict';
exports.main = async (event, context) => {
	//event为客户端上传的参数
	console.log('event : ', event)
	const index = event.index
	const file = await uniCloud.uploadFile({
		cloudPath: 'static/images/tools/touming_bg.png',
		fileContent: '../data/images/tools/touming_bg.png'
	});
	console.log('file', file)
	//返回数据给客户端
	return event
};