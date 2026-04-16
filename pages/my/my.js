const app = getApp()

Page({
  data: {
    postureRemind: true,
    eyeRemind: true,
    vibrate: true,
    fontSize: 1,
    fontList: ['标准', '偏大', '超大'],

    parentPwd: "123456",
    inputPwd: "",
    isParentVerified: false
  },

  onLoad() {
    this.setData({
      fontSize: app.globalData.fontSize
    })
  },

  // 字体大小切换
  changeFontSize(e) {
    const size = parseInt(e.detail.value)
    this.setData({ fontSize: size })
    app.globalData.fontSize = size
    wx.setStorageSync('fontSize', size)
    wx.showToast({ title: '字体已切换：' + this.data.fontList[size], icon: 'none' })
  },

  onPostureChange(e) { this.setData({ postureRemind: e.detail.value }) },
  onEyeChange(e) { this.setData({ eyeRemind: e.detail.value }) },
  onVibrateChange(e) { this.setData({ vibrate: e.detail.value }) },

  onInputPwd(e) { this.setData({ inputPwd: e.detail.value }) },
  checkParentPwd() {
    if (this.data.inputPwd === this.data.parentPwd) {
      this.setData({ isParentVerified: true })
      wx.showToast({ title: '验证成功', icon: 'success' })
    } else {
      wx.showToast({ title: '密码错误', icon: 'error' })
    }
  }
})