// app.js
App({
  // 全局数据（存储小程序通用数据）
  globalData: {
    openid: '', // 存储用户openid
    cloudEnvId: 'cloud1-2gl4b6myfe79dca2', // 替换成你的云开发环境ID
    fontSize: 1, // 全局字体大小（默认1=标准）
    postureRemind: true, // 姿势提醒开关
    eyeRemind: true, // 护眼提醒开关
    vibrate: true // 震动提醒开关
  },

  /**
   * 小程序启动时执行（全局只触发一次）
   */
  onLaunch() {
    // 1. 初始化云开发环境
    if (!wx.cloud) {
      wx.showToast({
        title: '请升级微信版本以使用云开发',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    wx.cloud.init({
      env: this.globalData.cloudEnvId, // 使用全局配置的云环境ID
      traceUser: true, // 跟踪用户行为（便于云开发控制台查看）
    });

    // 2. 获取用户openid（核心代码）
    this.getWxOpenid();
  },

  /**
   * 封装获取openid的方法（便于复用）
   */
  getWxOpenid() {
    wx.cloud.callFunction({
      name: 'login', // 微信云开发自带的login云函数（无需自己创建）
      success: (res) => {
        // 成功获取openid，存入全局数据
        this.globalData.openid = res.result.openid;
        console.log('✅ 你的openid已获取：', res.result.openid); // 控制台打印，方便复制
        // 可选：把openid存到本地缓存，防止重复获取
        wx.setStorageSync('openid', res.result.openid);
      },
      fail: (err) => {
        // 失败提示（便于排查问题）
        console.error('❌ 获取openid失败：', err);
        wx.showToast({
          title: '获取用户信息失败',
          icon: 'none',
          duration: 2000
        });
      }
    });
  }
});