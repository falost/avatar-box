
const db = uniCloud.database();

function getVersion() {
  return '0.0.1'
}
const getConfigKey = async (key, label = '', filds = 'val') => {
	if (!key) return null
	const res = await db.collection('wz_config').where({ key, label, status: 1 }).get()
	if (res.data && res.data.length > 0) {
		return res.data[0][filds]
	}
	return null
}
const isEmpty = (val) => {
	return val === '' || val === undefined || val === null
}
const success = (data = null, msg, code = 0) => {
	return {
		code,
		success: true,
		msg,
		data
	}
}
const fail = (msg, code = 1) => {
	return {
		code,
		success: false,
		msg,
		data: null
	}
}

module.exports = {
  getVersion,
	getConfigKey,
	isEmpty,
	success,
	fail
}