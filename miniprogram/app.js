// app.js
App({
  globalData: {
    userInfo: null,
    cloudEnvId: 'cloud1-2grqmoxcf951a5eb'
  },

  onLaunch() {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
      return
    }
    wx.cloud.init({
      env: this.globalData.cloudEnvId,
      traceUser: true
    })
    this._initUser()
  },

  _initUser() {
    const db = wx.cloud.database()
    const users = db.collection('juwu_users')
    // 权限为"仅创建者可读写"时，直接 get() 只会返回当前用户自己的记录
    users.limit(1).get()
      .then(({ data }) => {
        if (data.length > 0) {
          this.globalData.userInfo = data[0]
        } else {
          const newUser = {
            nickName: '新用户',
            avatarUrl: '',
            gender: '',
            company: '',
            school: '',
            tags: [],
            createdAt: Date.now()
          }
          users.add({ data: newUser }).then(({ _id }) => {
            this.globalData.userInfo = { _id, ...newUser }
          })
        }
      })
      .catch(err => {
        console.error('initUser fail', err)
      })
  }
})
