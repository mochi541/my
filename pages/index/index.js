Page({
  data: {
    studyTime: 0, // 秒数
    studyTimeText: '',
    isRunning: false,
    timer: null
  },

  // 开始计时
  startTimer() {
    this.setData({ isRunning: true });
    
    const timer = setInterval(() => {
      this.setData({
        studyTime: this.data.studyTime + 1
      });
      this.updateTimeText();
    }, 1000);
    
    this.setData({ timer });
  },

  // 结束计时
  stopTimer() {
    clearInterval(this.data.timer);
    this.setData({
      isRunning: false,
      timer: null
    });
    wx.showToast({ title: '学习已保存', icon: 'success' });
  },

  // 格式化时间 分:秒
  formatTime(s) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  },

  // 更新时长文本
  updateTimeText() {
    const t = this.data.studyTime;
    const h = Math.floor(t / 3600);
    const m = Math.floor((t % 3600) / 60);
    this.setData({
      studyTimeText: `${h}小时${m}分钟`
    });
  },

  // 显示护眼规则
  showEyeRule() {
    wx.showModal({
      title: '20-20-20 护眼法则',
      content: '每用眼20分钟，看20英尺（约6米）外的物体20秒，可有效缓解视疲劳，预防近视。',
      showCancel: false
    });
  }
})