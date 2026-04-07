Page({
  data: {
    totalTime: "0小时0分",
    list: [
      { date: "4月1日", time: "25分钟" },
      { date: "4月2日", time: "35分钟" },
      { date: "4月3日", time: "45分钟" },
      { date: "4月4日", time: "20分钟" },
      { date: "4月5日", time: "50分钟" },
      { date: "4月6日", time: "30分钟" },
      { date: "今天", time: "15分钟" },
    ]
  },

  onLoad() {
    this.setData({
      totalTime: "3小时15分钟"
    })
  }
})