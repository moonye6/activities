// app.js
App({
  globalData: {
    userInfo: null,
    // 云开发环境ID，开通云开发后填写
    cloudEnvId: 'YOUR_CLOUD_ENV_ID'
  },

  onLaunch() {
    // MVP 阶段使用 mock 用户登录
    // 生产环境替换为 wx.login + 云函数获取 openid
    this.globalData.userInfo = {
      _id: 'user_001',
      nickName: '活动达人',
      avatarUrl: '',
      phone: '',
      tags: ['同事', '吃货', '运动爱好者'],
      createdAt: 1740000000000
    }

    // 生产环境云开发初始化（取消注释后使用）
    // if (!wx.cloud) {
    //   console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    // } else {
    //   wx.cloud.init({
    //     env: this.globalData.cloudEnvId,
    //     traceUser: true,
    //   })
    // }
  }
})
