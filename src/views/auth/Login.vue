<template>
  <div class="auth-page">
    <!-- 背景装饰 -->
    <div class="background-decoration">
      <div class="blob blob-1"></div>
      <div class="blob blob-2"></div>
      <div class="blob blob-3"></div>
    </div>

    <!-- 主容器 -->
    <div class="container">
      <!-- 头部Logo -->
      <div class="auth-header">
        <div class="auth-logo">
          <canvas id="authLogo" width="64" height="64"></canvas>
          <div class="auth-title">蓝境</div>
        </div>
        <div class="auth-subtitle">让每一段关系都被看见</div>
      </div>

      <!-- 登录表单 -->
      <div class="auth-form">
        <h2 class="form-title">欢迎回来</h2>
        <p class="form-subtitle">登录后继续使用蓝境</p>

        <!-- 手机号登录 -->
        <div class="form-section">
          <div class="form-group">
            <label class="form-label">手机号</label>
            <div class="input-group">
              <input 
                type="tel" 
                class="form-input" 
                v-model="phone" 
                placeholder="请输入手机号"
                maxlength="11"
              >
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">验证码</label>
            <div class="input-group">
              <input 
                type="text" 
                class="form-input" 
                v-model="code" 
                placeholder="请输入验证码"
                maxlength="6"
              >
              <button 
                class="code-btn" 
                @click="sendCode" 
                :disabled="countdown > 0"
              >
                {{ countdown > 0 ? `${countdown}秒后重试` : '获取验证码' }}
              </button>
            </div>
          </div>

          <button 
            class="btn-primary" 
            @click="loginByPhone" 
            :disabled="!phone || !code || loading"
          >
            {{ loading ? '登录中...' : '登录' }}
          </button>
        </div>

        <!-- 分隔线 -->
        <div class="divider">
          <span class="divider-text">其他登录方式</span>
        </div>

        <!-- 微信登录 -->
        <div class="form-section">
          <button class="btn-wechat" @click="loginByWechat">
            <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=wechat%20chat%20icon%20minimal%20flat%20design%20green%20color%20scheme&image_size=square" alt="微信" class="wechat-icon">
            微信登录
          </button>
        </div>

        <!-- 注册链接 -->
        <div class="auth-footer">
          <span>还没有账号？</span>
          <button class="link-btn" @click="goToRegister">立即注册</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../../stores/auth'

const authStore = useAuthStore()
const phone = ref('')
const code = ref('')
const countdown = ref(0)
const loading = ref(false)

// 发送验证码
const sendCode = async () => {
  if (!phone.value) {
    alert('请输入手机号')
    return
  }
  
  if (!/^1[3-9]\d{9}$/.test(phone.value)) {
    alert('请输入正确的手机号')
    return
  }

  try {
    await authStore.sendSMSCode(phone.value)
    startCountdown()
    alert('验证码已发送')
  } catch (error) {
    alert('发送验证码失败，请重试')
    console.error('发送验证码失败:', error)
  }
}

// 开始倒计时
const startCountdown = () => {
  countdown.value = 60
  const timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)
}

// 手机号登录
const loginByPhone = async () => {
  if (!phone.value || !code.value) {
    alert('请输入手机号和验证码')
    return
  }

  loading.value = true
  try {
    await authStore.loginByPhone(phone.value, code.value)
    // 登录成功后会自动跳转到首页
  } catch (error) {
    alert('登录失败，请检查验证码是否正确')
    console.error('登录失败:', error)
  } finally {
    loading.value = false
  }
}

// 微信登录
const loginByWechat = async () => {
  try {
    await authStore.loginByWechat()
    // 登录成功后会自动跳转到首页
  } catch (error) {
    alert('微信登录失败，请重试')
    console.error('微信登录失败:', error)
  }
}

// 跳转到注册页面
const goToRegister = () => {
  // 这里需要实现页面跳转逻辑
  window.location.href = '#/register'
}

// 绘制Logo
const drawAuthLogo = () => {
  const canvas = document.getElementById('authLogo')
  if (!canvas) return
  
  const ctx = canvas.getContext('2d')
  const centerX = 32
  const centerY = 32
  const radius = 28
  
  // 清除画布
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  
  // 绘制主圆形
  const gradientCircle = ctx.createLinearGradient(centerX - radius, centerY - radius, centerX + radius, centerY + radius)
  gradientCircle.addColorStop(0, '#58A6FF')
  gradientCircle.addColorStop(1, '#79B8FF')
  
  ctx.beginPath()
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
  ctx.fillStyle = gradientCircle
  ctx.fill()
  
  // 绘制内部波浪线
  ctx.beginPath()
  ctx.moveTo(centerX - 20, centerY)
  
  for (let i = -20; i <= 20; i += 6) {
    const y = centerY + Math.sin(i * 0.25) * 4
    ctx.lineTo(centerX + i, y)
  }
  
  ctx.strokeStyle = '#0D1117'
  ctx.lineWidth = 2
  ctx.stroke()
  
  // 绘制连接点
  const points = [
    { x: centerX - 12, y: centerY - 6 },
    { x: centerX, y: centerY + 8 },
    { x: centerX + 12, y: centerY - 4 }
  ]
  
  points.forEach(point => {
    ctx.beginPath()
    ctx.arc(point.x, point.y, 2, 0, Math.PI * 2)
    ctx.fillStyle = '#0D1117'
    ctx.fill()
  })
}

onMounted(() => {
  drawAuthLogo()
})
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.auth-header {
  text-align: center;
  margin-bottom: 48px;
}

.auth-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
}

.auth-title {
  font-size: 40px;
  font-weight: 700;
  letter-spacing: 6px;
  background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 0 30px rgba(88, 166, 255, 0.4);
  margin-left: 16px;
}

#authLogo {
  vertical-align: middle;
}

.auth-subtitle {
  font-size: 16px;
  color: var(--text-secondary);
  font-weight: 400;
  letter-spacing: 2px;
}

.auth-form {
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-xl);
  padding: 40px;
  width: 100%;
  max-width: 420px;
  box-shadow: var(--shadow-soft), 0 0 40px rgba(88, 166, 255, 0.1);
}

.form-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
  text-align: center;
}

.form-subtitle {
  font-size: 14px;
  color: var(--text-secondary);
  text-align: center;
  margin-bottom: 32px;
}

.form-section {
  margin-bottom: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.input-group {
  display: flex;
  gap: 12px;
}

.form-input {
  flex: 1;
  padding: 14px 16px;
  font-size: 15px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-sm);
  background: rgba(255, 255, 255, 0.05);
  font-family: inherit;
  color: var(--text-primary);
  transition: all 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary);
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-1px);
  box-shadow: 0 0 15px rgba(88, 166, 255, 0.3);
}

.form-input::placeholder {
  color: var(--text-tertiary);
}

.code-btn {
  padding: 0 20px;
  background: rgba(88, 166, 255, 0.2);
  border: 1px solid var(--primary);
  border-radius: var(--radius-sm);
  color: var(--primary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.code-btn:hover:not(:disabled) {
  background: rgba(88, 166, 255, 0.3);
  transform: translateY(-1px);
}

.code-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: var(--shadow-soft);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-soft), 0 0 20px rgba(88, 166, 255, 0.4);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.divider {
  position: relative;
  margin: 32px 0;
  text-align: center;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-50%);
}

.divider-text {
  position: relative;
  display: inline-block;
  padding: 0 20px;
  background: var(--bg-primary);
  font-size: 14px;
  color: var(--text-tertiary);
}

.btn-wechat {
  width: 100%;
  padding: 16px;
  background: rgba(0, 195, 0, 0.1);
  border: 1px solid #07C160;
  border-radius: var(--radius-sm);
  color: #07C160;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.btn-wechat:hover {
  background: rgba(0, 195, 0, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(7, 193, 96, 0.3);
}

.wechat-icon {
  width: 20px;
  height: 20px;
  object-fit: contain;
}

.auth-footer {
  text-align: center;
  margin-top: 24px;
  font-size: 14px;
  color: var(--text-secondary);
}

.link-btn {
  background: none;
  border: none;
  color: var(--primary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  padding: 0 8px;
  transition: color 0.2s ease;
}

.link-btn:hover {
  color: var(--secondary);
  text-decoration: underline;
}
</style>