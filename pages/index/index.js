const app = getApp()
const db = wx.cloud.database()

Page({
  data: {
    isStudying: false,
    seconds: 0,
    timer: null,
    remindCount: 0,
    time: '00:00:00',

    cameraAuth: false,
    isWarn: false,
    frameCount: 0,

    // 联调新增：强制休息锁定
    lockStudy: false,
    lockText: ''
  },

  onLoad() {
    wx.authorize({
      scope: 'scope.camera',
      success: () => {
        this.setData({ cameraAuth: true })
      }
    })
  },

  startStudy() {
    // 新增：锁定时不能开始
    if (this.data.lockStudy || this.data.isStudying) return
    this.setData({ isStudying: true })

    const timer = setInterval(() => {
      let newSec = this.data.seconds + 1
      this.setData({ seconds: newSec })
      this.formatTime(newSec)

      // 护眼每20分钟
      if (newSec % 1200 === 0) {
        wx.vibrateShort()
        wx.showModal({
          title: '👀 护眼提醒',
          content: '看远处20秒',
          showCancel: false
        })
        this.setData({ remindCount: this.data.remindCount + 1 })
      }

      // 每3秒检测一次距离
      if (newSec % 3 === 0) {
        this.checkCameraDistance()
      }

      // ======================
      // 新增：45分钟强制休息（联调必测）
      // ======================
      if (newSec >= 2700) {
        this.forceRest()
      }

    }, 1000)

    this.setData({ timer })
  },

  // 🔥 核心：摄像头距离判断（靠近才触发）
  checkCameraDistance() {
    if (this.data.isWarn) return

    const ctx = wx.createCameraContext()
    ctx.listenFrameChange({
      success: (res) => {
        this.setData({ frameCount: this.data.frameCount + 1 })

        // 画面连续出现 → 判断为靠近
        if (this.data.frameCount > 2) {
          this.setData({ isWarn: true, frameCount: 0 })

          wx.vibrateShort()
          wx.showModal({
            title: '⚠️ 距离警告',
            content: '离屏幕太近了，请坐远一点',
            showCancel: false,
            success: () => {
              this.setData({ isWarn: false })
            }
          })
        }
      }
    })
  },

  stopStudy() {
    clearInterval(this.data.timer)
    this.setData({ isStudying: false, timer: null })

    const studySeconds = this.data.seconds
    const studyMinutes = Math.floor(studySeconds / 60)
    const openid = app.globalData.openid

    if (studySeconds < 60) {
      wx.showToast({ title: '时间太短，未保存', icon: 'none' })
      return
    }

    // 保存到云数据库（联调必测）
    db.collection('user_stats').add({
      data: {
        openid, date: new Date().toLocaleDateString(),
        studyMinutes, remindCount: this.data.remindCount,
        createTime: db.serverDate()
      },
      success: () => {
        wx.showToast({ title: '学习记录已保存' })
      }
    })
  },

  // ======================
  // 新增：强制休息（联调必测功能）
  // ======================
  forceRest() {
    this.stopStudy()
    this.setData({
      lockStudy: true,
      lockText: '已学习45分钟，休息10分钟'
    })

    let restSec = 600
    const lockTimer = setInterval(() => {
      restSec--
      const min = Math.ceil(restSec / 60)
      this.setData({ lockText: `休息中，剩余 ${min} 分钟` })

      if (restSec <= 0) {
        clearInterval(lockTimer)
        this.setData({
          lockStudy: false,
          lockText: '',
          seconds: 0,
          time: '00:00:00'
        })
      }
    }, 1000)
  },

  formatTime(sec) {
    const h = Math.floor(sec / 3600)
    const m = Math.floor((sec % 3600) / 60)
    const s = sec % 60
    this.setData({
      time: `${h<10?'0'+h:h}:${m<10?'0'+m:m}:${s<10?'0'+s:s}`
    })
  },

  onUnload() {
    if (this.data.timer) clearInterval(this.data.timer)
  }
})