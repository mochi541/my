// app.js 完整代码（直接复制覆盖）
App({
  onLaunch() {
    // 初始化云开发
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库')
    } else {
      wx.cloud.init({
        env: 'cloud1-2gl4b6myfe79dca2', 
        traceUser: true
      })
    }

    // 全局数据
    this.globalData = {
      userInfo: null,
      studyTime: 0,
      hasRemind: false
    }
  }
})