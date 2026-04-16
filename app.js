// 完整可直接复制的 app.js
App({
  onLaunch() {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 及以上基础库')
      return
    }
    wx.cloud.init({
      env: 'cloud1-2gl4b6myfe79dca2',
      traceUser: true
    })

    // 异步获取openid，不阻塞启动
    setTimeout(() => {
      this.getOpenId()
    }, 500)

    // 读取本地保存的字体大小
    try {
      let size = wx.getStorageSync('fontSize') || 1
      this.globalData.fontSize = size
    } catch (e) {}
  },

  globalData: {
    openid: null,
    openidReady: false,
    fontSize: 1 // 0标准 1偏大 2超大
  },

  async getOpenId() {
    try {
      const res = await wx.cloud.callFunction({ name: 'login' })
      this.globalData.openid = res.result.openid
      this.globalData.openidReady = true
      console.log('✅ openid获取成功:', res.result.openid)
    } catch (err) {
      console.error('❌ 获取openid失败', err)
    }
  },

  // 工具方法
  toast(msg) {
    wx.showToast({ title: msg, icon: 'none' })
  }
})