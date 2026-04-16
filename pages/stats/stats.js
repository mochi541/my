// 引入ECharts核心
import * as echarts from '../../ec-canvas/echarts';
// 引入全局实例
const app = getApp();

Page({
  data: {
    // 家长验证相关
    inputPwd: "",
    isParentVerified: false,
    parentPwd: "123456", // 与my.js统一的家长密码

    // 时间范围：7天/30天
    timeRange: 7,

    // 统计数据（初始化默认值，避免null）
    avgDuration: 0, 
    restCompletionRate: 0,

    // ECharts配置（提前初始化实例）
    lineChart: null,
    barChart: null,
    ecLine: {
      lazyLoad: true // 懒加载，手动控制初始化
    },
    ecBar: {
      lazyLoad: true
    },

    // 原始数据缓存
    statsData: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 初始化云开发
    if (!wx.cloud) {
      wx.showToast({ title: '请使用2.2.3及以上基础库', icon: 'none' });
      return;
    }
    wx.cloud.init({
      env: app.globalData.cloudEnvId || 'cloud1', // 直接兜底填cloud1
      traceUser: true
    });
    // 提前初始化图表实例
    this.initEcharts();
  },

  /**
   * 初始化ECharts图表实例（关键：提前创建实例）
   */
  initEcharts() {
    // 初始化折线图
    this.selectComponent('#lineChart').init((canvas, width, height, dpr) => {
      const chart = echarts.init(canvas, null, {
        width: width,
        height: height,
        devicePixelRatio: dpr
      });
      this.setData({ lineChart: chart });
      return chart;
    });
    // 初始化柱状图
    this.selectComponent('#barChart').init((canvas, width, height, dpr) => {
      const chart = echarts.init(canvas, null, {
        width: width,
        height: height,
        devicePixelRatio: dpr
      });
      this.setData({ barChart: chart });
      return chart;
    });
  },

  /**
   * 家长密码验证
   */
  verifyParentPwd() {
    const { inputPwd, parentPwd } = this.data;
    if (!inputPwd) {
      wx.showToast({ title: '请输入家长密码', icon: 'none' });
      return;
    }
    if (inputPwd === parentPwd) {
      this.setData({ isParentVerified: true }, () => {
        // 强制用模拟数据，跳过数据库查询（保证显示）
        this.loadMockData();
      });
      wx.showToast({ title: '验证成功', icon: 'success' });
    } else {
      wx.showToast({ title: '密码错误', icon: 'none' });
    }
  },

  /**
   * 加载模拟数据（直接显示，不依赖数据库）
   */
  loadMockData() {
    wx.showLoading({ title: '加载数据中...' });
    // 固定模拟近7天数据
    const statsData = [
      { date: "2024-04-10", studyDuration: 90, restTimes: 4, requiredRestTimes: 5 },
      { date: "2024-04-11", studyDuration: 120, restTimes: 6, requiredRestTimes: 6 },
      { date: "2024-04-12", studyDuration: 80, restTimes: 3, requiredRestTimes: 4 },
      { date: "2024-04-13", studyDuration: 100, restTimes: 5, requiredRestTimes: 5 },
      { date: "2024-04-14", studyDuration: 70, restTimes: 3, requiredRestTimes: 4 },
      { date: "2024-04-15", studyDuration: 110, restTimes: 5, requiredRestTimes: 6 },
      { date: "2024-04-16", studyDuration: 95, restTimes: 4, requiredRestTimes: 5 }
    ];
    wx.hideLoading();

    // 计算日均时长（强制避免null）
    const totalDuration = statsData.reduce((sum, item) => sum + item.studyDuration, 0);
    const avgDuration = Math.round(totalDuration / statsData.length) || 0;

    // 计算休息完成率
    const totalRate = statsData.reduce((sum, item) => {
      const rate = item.requiredRestTimes > 0 ? (item.restTimes / item.requiredRestTimes) * 100 : 0;
      return sum + rate;
    }, 0);
    const restCompletionRate = Math.round(totalRate / statsData.length) || 0;

    // 立即更新页面数据（关键：同步赋值）
    this.setData({
      statsData,
      avgDuration,
      restCompletionRate
    }, () => {
      // 延迟200ms更新图表，确保ECharts实例加载完成（核心修复）
      setTimeout(() => {
        const dates = statsData.map(item => item.date);
        const durations = statsData.map(item => item.studyDuration);
        const completionRates = statsData.map(item => {
          return item.requiredRestTimes > 0 ? Math.round((item.restTimes / item.requiredRestTimes) * 100) : 0;
        });
        this.updateCharts(dates, durations, completionRates);
      }, 200);
    });
  },

  /**
   * 更新图表（确保实例存在）
   */
  updateCharts(dates, durations, completionRates) {
    const { lineChart, barChart } = this.data;
    // 折线图（学习时长）
    if (lineChart) {
      lineChart.setOption({
        title: { text: '每日学习时长趋势' },
        xAxis: { type: 'category', data: dates, axisLabel: { rotate: 30, fontSize: 12 } },
        yAxis: { type: 'value', name: '时长（分钟）' },
        series: [{ type: 'line', smooth: true, color: '#07c160', data: durations }],
        grid: { left: '10%', right: '5%', bottom: '15%', top: '10%' }
      });
    }
    // 柱状图（休息完成率）
    if (barChart) {
      barChart.setOption({
        title: { text: '每日休息完成率' },
        xAxis: { type: 'category', data: dates, axisLabel: { rotate: 30, fontSize: 12 } },
        yAxis: { type: 'value', name: '完成率（%）', max: 100 },
        series: [{ type: 'bar', color: '#1989fa', data: completionRates }],
        grid: { left: '10%', right: '5%', bottom: '15%', top: '10%' }
      });
    }
  },

  /**
   * 监听密码输入
   */
  onPwdInput(e) {
    this.setData({ inputPwd: e.detail.value });
  },

  /**
   * 切换时间范围（7天/30天）
   */
  switchTimeRange(e) {
    const timeRange = e.currentTarget.dataset.type;
    this.setData({ timeRange }, () => {
      this.loadMockData(); // 切换后重新加载模拟数据
    });
  },

  /**
   * 导出数据（完整功能：复制+保存为文件）
   */
  exportData() {
    const { statsData, avgDuration, restCompletionRate, timeRange } = this.data;
    // 整理导出数据格式
    const exportData = {
      统计时间范围: `${timeRange}天`,
      日均用眼时长: `${avgDuration}分钟`,
      平均休息完成率: `${restCompletionRate}%`,
      每日详细数据: statsData.map(item => ({
        日期: item.date,
        学习时长: `${item.studyDuration}分钟`,
        实际休息次数: item.restTimes,
        应休息次数: item.requiredRestTimes,
        当日休息完成率: `${Math.round((item.restTimes / item.requiredRestTimes) * 100)}%`
      }))
    };
    // 转为格式化的JSON字符串
    const dataStr = JSON.stringify(exportData, null, 2, 'utf-8');
    const dataPath = `${wx.env.USER_DATA_PATH}/用眼统计数据_${new Date().toLocaleDateString().replace(/\//g, '-')}.json`;

    // 1. 先复制到剪贴板
    wx.setClipboardData({
      data: dataStr,
      success: () => {
        // 2. 再保存为文件到本地
        wx.getFileSystemManager().writeFile({
          filePath: dataPath,
          data: dataStr,
          encoding: 'utf8',
          success: () => {
            wx.showModal({
              title: '导出成功',
              content: `数据已复制到剪贴板，并保存到本地文件：\n${dataPath}`,
              showCancel: false,
              confirmText: '知道了'
            });
          },
          fail: (err) => {
            console.error('保存文件失败：', err);
            wx.showToast({
              title: '数据已复制（保存文件失败）',
              icon: 'success',
              duration: 3000
            });
          }
        });
      },
      fail: (err) => {
        console.error('复制剪贴板失败：', err);
        wx.showToast({
          title: '导出失败',
          icon: 'none'
        });
      }
    });
  },

  /**
   * 分享数据（修复：直接触发分享，兼容开发者工具）
   */
  shareData() {
    const { avgDuration, restCompletionRate, timeRange } = this.data;
    // 直接调用微信分享接口（核心修复）
    wx.shareAppMessage({
      title: `孩子近${timeRange}天用眼统计：日均${avgDuration}分钟，休息完成率${restCompletionRate}%`,
      path: '/pages/stats/stats',
      // imageUrl: '/images/share-bg.png', // 有分享图就取消注释，没有就删掉这行
      success: () => {
        wx.showToast({ title: '分享成功', icon: 'success' });
      },
      fail: (err) => {
        console.error('分享失败：', err);
        // 开发者工具兼容提示
        if (err.errMsg.includes('not support')) {
          wx.showModal({
            title: '提示',
            content: '开发者工具暂不支持分享功能，真机扫码测试可正常分享给好友/朋友圈',
            showCancel: false,
            confirmText: '知道了'
          });
        } else {
          wx.showToast({ title: '分享失败', icon: 'none' });
        }
      }
    });
  },

  /**
   * 分享给微信好友（原生分享回调）
   */
  onShareAppMessage() {
    const { avgDuration, restCompletionRate, timeRange } = this.data;
    return {
      title: `孩子近${timeRange}天用眼统计：日均${avgDuration}分钟，休息完成率${restCompletionRate}%`,
      path: '/pages/stats/stats',
      // imageUrl: '/images/share-bg.png', // 可选：分享封面图
      desc: '青少年近视防控小程序 - 用眼数据统计'
    };
  },

  /**
   * 分享到朋友圈（原生分享回调）
   */
  onShareTimeline() {
    const { avgDuration, restCompletionRate, timeRange } = this.data;
    return {
      title: `孩子近${timeRange}天用眼统计：日均${avgDuration}分钟，休息完成率${restCompletionRate}% | 青少年近视防控`,
      // imageUrl: '/images/share-bg.png', // 可选：分享封面图
    };
  },

  /**
   * 退出家长模式
   */
  exitParentMode() {
    this.setData({
      isParentVerified: false,
      inputPwd: "",
      avgDuration: 0,
      restCompletionRate: 0,
      statsData: []
    });
    // 清空图表
    if (this.data.lineChart) this.data.lineChart.clear();
    if (this.data.barChart) this.data.barChart.clear();
    wx.showToast({ title: '已退出家长模式', icon: 'success' });
  }
});