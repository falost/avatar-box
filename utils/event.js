/**
 * 多页面间数据通信传输
 */
var events = {};

const on = (name, self, callback) => {             //接收
	var tuple = [self, callback],
		callbacks = events[name]
	if (Array.isArray(callbacks)) {
		callbacks.push(tuple);
	}
	else {
		events[name] = [tuple];
	}
}

const remove = (name, self) => {                  // 移除
	var callbacks = events[name]
	if (Array.isArray(callbacks)) {
		events[name] = callbacks.filter((tuple) => {
			return tuple[0] != self
		})
	}
}

const emit = (name, data) => {                    // 发送
	var callbacks = events[name]
	if (Array.isArray(callbacks)) {
		callbacks.map((tuple) => {
			var self = tuple[0],
				callback = tuple[1]

			callback.call(self, data);

		})
	}
}

module.exports = {
	on : on,
	remove : remove,
	emit: emit
}