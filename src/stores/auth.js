import { defineStore } from 'pinia'
import AV from '../utils/leancloud'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    isAuthenticated: false,
    loading: false
  }),

  getters: {
    currentUser: (state) => state.user
  },

  actions: {
    // 初始化认证状态
    async initAuth() {
      try {
        const currentUser = AV.User.current()
        if (currentUser) {
          await currentUser.fetch()
          this.user = {
            id: currentUser.id,
            phone: currentUser.get('mobilePhoneNumber'),
            nickname: currentUser.get('nickname') || '用户',
            createdAt: currentUser.createdAt
          }
          this.isAuthenticated = true
        }
      } catch (error) {
        console.error('初始化认证状态失败:', error)
      }
    },

    // 发送短信验证码
    async sendSMSCode(phone) {
      try {
        await AV.User.requestMobilePhoneVerify(phone)
      } catch (error) {
        console.error('发送验证码失败:', error)
        throw error
      }
    },

    // 手机号登录
    async loginByPhone(phone, code) {
      try {
        this.loading = true
        const user = await AV.User.loginWithMobilePhone(phone, code)
        this.user = {
          id: user.id,
          phone: user.get('mobilePhoneNumber'),
          nickname: user.get('nickname') || '用户',
          createdAt: user.createdAt
        }
        this.isAuthenticated = true
        this.redirectToHome()
      } catch (error) {
        console.error('手机号登录失败:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // 手机号注册
    async registerByPhone(phone, code, nickname) {
      try {
        this.loading = true
        const user = new AV.User()
        user.setUsername(phone)
        user.setMobilePhoneNumber(phone)
        user.set('nickname', nickname)
        await user.signUpOrlogInWithMobilePhone(phone, code)
        this.user = {
          id: user.id,
          phone: user.get('mobilePhoneNumber'),
          nickname: user.get('nickname'),
          createdAt: user.createdAt
        }
        this.isAuthenticated = true
        this.redirectToHome()
      } catch (error) {
        console.error('手机号注册失败:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // 微信登录
    async loginByWechat() {
      try {
        this.loading = true
        // 这里需要根据实际的微信登录流程实现
        // 由于是模拟环境，我们创建一个测试用户
        const testUser = {
          id: Date.now().toString(),
          nickname: '微信用户',
          phone: '13800138000',
          createdAt: new Date()
        }
        this.user = testUser
        this.isAuthenticated = true
        this.redirectToHome()
      } catch (error) {
        console.error('微信登录失败:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // 登出
    async logout() {
      try {
        await AV.User.logOut()
        this.user = null
        this.isAuthenticated = false
        this.redirectToLogin()
      } catch (error) {
        console.error('登出失败:', error)
      }
    },

    // 跳转到首页
    redirectToHome() {
      window.location.href = '/'
    },

    // 跳转到登录页
    redirectToLogin() {
      window.location.href = '#/login'
    }
  }
})