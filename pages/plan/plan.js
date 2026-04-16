Page({
  data: {
    isPlaying: false
  },

  onLoad() {
    this.audio = wx.createInnerAudioContext()
    // 你可以自己替换成真实音频地址
    this.audio.src = "https://www.soundjay.com/button/sounds/button-14.mp3"
  },

  // 播放/暂停
  playAudio() {
    if (this.data.isPlaying) {
      this.audio.pause()
      this.setData({ isPlaying: false })
    } else {
      this.audio.play()
      this.setData({ isPlaying: true })
    }
  },

  onUnload() {
    if (this.audio) this.audio.destroy()
  }
})