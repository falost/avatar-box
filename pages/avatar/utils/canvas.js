const BTNSIZE = 17
class Canvas {
  constructor(id, bg) {
    this.id = id
    this.list = []
    this.ctx = uni.createCanvasContext(id)
    this.selectedItem = null
    this.touchItem = false
    this.bg = bg
    this.initbg()
    this.ctx.draw()
  }
  initbg() {
    const {
      url,
      width,
      height,
      x,
      y
    } = this.bg
    this.ctx.beginPath()
    this.ctx.drawImage(url, x, y, width, height)
    this.ctx.closePath()
  }
	clear() {
		const {
		  width,
		  height
		} = this.bg
		this.ctx.clearRect(0, 0, width, height)
		this.ctx.draw()
	}
  cancelSelected() {
    this.initbg()
    this.list.forEach((item, idx) => {
      item.draw(this.ctx, false)
    })
    this.ctx.draw(false)
  }
  saveCanvas(dpi = 1080) {
    this.cancelSelected()
    return new Promise((reslove, reject) => {
      uni.canvasToTempFilePath({
        x: 0,
        y: 0,
        destWidth: dpi,
        destHeight: dpi,
        canvasId: this.id,
        quality: 1,
        success(res) {
					reslove(res)
        },
        fail() {
          reject()
        }
      })
    })
  }
  addList(item) {
    this.list.push(item)
  }
	getList() {
		return this.list
	}
  isTouchItem(item, x, y) {
    let n = BTNSIZE / 2 + 5
    let count = (Math.sqrt(Math.pow(item.touch.countWid, 2) + Math.pow(item.touch.countWid, 2)) - item.width) / 2;
    let sx = item.x - n - count
    let sy = item.y - n - count
    let ex = item.x + item.width + n + count
    let ey = item.y + item.width + n + count

    return x > sx && x < ex && y > sy && y < ey
  }
  hasClickItem(x, y) {
    let list = []
    this.list.forEach((item, idx) => {
      if (this.isTouchItem(item, x, y)) {
        list.unshift({
          item,
          idx
        })
      }
    })

    return list.length > 0 ? list[0] : false
  }
  isClickClose(item, x, y) {
    let btnx = item.touch.clsx
    let btny = item.touch.clsy
    let sx = btnx - BTNSIZE / 3
    let ex = btnx + BTNSIZE + BTNSIZE / 3
    let sy = btny - BTNSIZE / 3
    let ey = btny + BTNSIZE + BTNSIZE / 3
    console.log(sx, sy, ex, ey, BTNSIZE)
    return x > sx && x < ex && y > sy && y < ey
  }
  draw() {
		return new Promise(resolve => {
			this.initbg()
			this.list.forEach((item, idx) => {
				let selected = false

				if (idx == this.list.length - 1) {
					this.selectedItem = item
					selected = true
				}
				item.draw(this.ctx, selected)
			})
			this.ctx.draw(false)
			setTimeout(resolve(), 500)
		})
  }
  touchStart(x, y) {
    if (this.list.length == 0) return
    let selectItem = this.hasClickItem(x, y)
    let isFalse = typeof selectItem != 'boolean'
    this.touchItem = isFalse

    console.log(isFalse, '是否点中了元素')
    if (isFalse) {
      let deletIdx = null
      this.initbg()
      this.list.forEach((item, idx) => {
        let selected = false
        //如果点击了关闭
        if (!this.isClickClose(item, x, y)) {
          if (idx == selectItem.idx) {
            selected = true
            item.touchStart(x, y)
            this.selectedItem = item
          }
          item.draw(this.ctx, selected)
        } else {
          deletIdx = idx
        }
      })
      this.ctx.draw(false)

      //如果是删除逻辑
      if (deletIdx != null) {
        this.list.splice(deletIdx, 1)
        this.draw()
      }
    } else {
      this.cancelSelected()
      this.selectedItem == null
    }
  }
  touchScale(x, y) {
    if (this.selectedItem == null || !this.touchItem || this.list.length == 0) return

    this.initbg()
    this.selectedItem.change(x, y)
    this.list.forEach((item, idx) => {
      let selected = false
      if (this.selectedItem == item) selected = true

      item.draw(this.ctx, selected)
    })
    this.ctx.draw(false)
  }
  touchEnd() {
    if (this.selectedItem == null || this.list.length == 0) return
    this.selectedItem.scaleEnd()
  }
}

class CanvasItem {
  constructor(item, dpi = 1) {
		let {
			url,
			width,
			height,
			x,
			y
		} = item
    this.url = url
    this.width = width * dpi || 0
    this.height = height * dpi || 0
    this.x =  (item.x || x) * dpi
    this.y =  (item.y || y) * dpi
    this.scalenum = item.scalenum || 0
    this.cenx = (item.cenx && item.cenx * dpi) || (x * dpi + width * dpi / 2)
    this.ceny = (item.ceny && item.ceny * dpi) || (y * dpi + height * dpi / 2)
    this.rotate = item.rotate || 0
    this.touchx = (item.touchx && item.touchx * dpi) || (x * dpi + width * dpi)
    this.touchy = (item.touchy &&  item.touchy * dpi) || (y * dpi + height * dpi)
    this.cache = {
      route: item.cache && item.cache.route || 0,
      scalenum: item.cache && item.cache.scalenum || 0,
      x: (item.cache && item.cache.x || x) * dpi,
      y: (item.cache && item.cache.y || y) * dpi
    }
    this.touch = {
      countWid: (item.touch && item.touch.countWid || width) * dpi,
      countHei: (item.touch && item.touch.countHei || height) * dpi,
      btnx: (item.touch && item.touch.btnx * dpi) || (x * dpi + width * dpi - BTNSIZE / 2),
      btny: (item.touch && item.touch.btny * dpi) || (y * dpi + height * dpi - BTNSIZE/ 2),
      clsx: (item.touch && item.touch.clsx * dpi) || (x * dpi - BTNSIZE / 2),
      clsy: (item.touch && item.touch.clsy * dpi) || (y * dpi - BTNSIZE / 2)
    }
    this.routeline = item.routeline
    this.isTouchBtn = item.routeline
  }
  draw(ctx, selected = false) {
    let countWid = this.width + this.scalenum * 2
    let countHei = this.height + this.scalenum * 2
    let x = this.x - this.scalenum
    let y = this.y - this.scalenum
    this.touch.countWid = countWid
    this.touch.countHei = countHei

    ctx.beginPath()
    ctx.save()
    ctx.translate(this.cenx, this.ceny);
    ctx.rotate(-(this.rotate + this.cache.route) * Math.PI / 180);
    ctx.translate(-this.cenx, -this.ceny);
    if (selected) this.selected(ctx, x, y, countWid, countHei)
    ctx.drawImage(this.url, x, y, countWid, countHei)
    ctx.restore()
    ctx.closePath()
  }
  selected(ctx, x, y, countWid, countHei) {
    ctx.setStrokeStyle('#ffd3d6')
    ctx.setLineWidth(2)
    ctx.setLineDash([10, 10], 12);
    ctx.strokeRect(x, y, countWid, countHei)
    ctx.drawImage('/static/images/change.png', x + countWid - BTNSIZE / 2, y + countHei - BTNSIZE / 2, BTNSIZE, BTNSIZE)
    ctx.drawImage('/static/images/close.png', x - BTNSIZE / 2, y - BTNSIZE / 2, BTNSIZE, BTNSIZE)
    //ctx.arc(x + countWid, y + countHei, BTNSIZE / 2, 0, 2 * Math.PI)
    //ctx.arc(x, y, BTNSIZE / 2, 0, 2 * Math.PI)
    ctx.fill()
  }
  touchStart(x, y) {
    this.touchx = x
    this.touchy = y
    this.isTouchBtn = this.isBtn(x, y)

    console.log(this.isTouchBtn, '是否点中了按钮')
  }
  change(x, y) {
    this.touch.lastMovex = x
    this.touch.lastMovey = y
    this.touch.distx = this.touch.lastMovex - this.touchx
    this.touch.disty = this.touch.lastMovey - this.touchy

    if (this.isTouchBtn) {
      this.rotateScale(x, y)
      return
    }
    this.move(x, y)
  }

  isBtn(x, y) {
    let n = 0
    let btnx = this.touch.btnx
    let btny = this.touch.btny
    let sx = btnx - BTNSIZE / 2 - n
    let sy = btny - BTNSIZE / 2 - n
    let ex = btnx + BTNSIZE * 1.5 + n
    let ey = btny + BTNSIZE * 1.5 + n

    return x > sx && x < ex && y > sy && y < ey
  }
  move(x, y) {
    this.x = this.cache.x + this.touch.distx
    this.y = this.cache.y + this.touch.disty
    this.cenx = this.x + this.width / 2
    this.ceny = this.y + this.height / 2
  }
  rotateScale(x, y) {
    //旋转
    const start = Math.atan2(this.touchx - this.cenx, this.touchy - this.ceny) / Math.PI * 180
    const move = Math.atan2(x - this.cenx, y - this.ceny) / Math.PI * 180
    // const startLine = Math.sqrt(Math.pow((this.touchx - this.cenx), 2) + Math.pow((this.touchy - this.ceny), 2));
    const endLine = Math.sqrt(Math.pow((x - this.cenx), 2) + Math.pow((y - this.ceny), 2));
    const width = Math.sqrt(Math.pow(endLine, 2) + Math.pow(endLine, 2))
    //放大缩小
    const scalex = x - this.cenx - (this.width / 2)
    const scaley = y - this.ceny - (this.height / 2)
    //const scalenum = scalex > scaley ? scalex : scaley

    this.cache.route = move - start

    if (width >= 60) {
      this.scalenum = (width - this.width) / 2
      this.cache.scalenum = (width - this.width) / 2
    }
  }
  scaleEnd() {
    //判断是否是旋转行为
    if (this.isTouchBtn) {
      this.touch.clsx -= this.touch.distx || 0
      this.touch.clsy -= this.touch.disty || 0
    } else {
      this.cache.x = this.x
      this.cache.y = this.y
      this.touch.clsx += this.touch.distx || 0
      this.touch.clsy += this.touch.disty || 0
    }
    this.touch.btnx += this.touch.distx || 0
    this.touch.btny += this.touch.disty || 0
    this.touch.distx = 0
    this.touch.disty = 0
    this.rotate = this.rotate + this.cache.route
    this.cache.route = 0
  }
}

module.exports = {
  Canvas,
  CanvasItem
}