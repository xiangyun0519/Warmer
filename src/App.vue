<template>
  <div class="app" style="min-height: 100vh; position: relative;">
    <!-- 背景装饰 -->
    <div class="background-decoration">
      <div class="blob blob-1"></div>
      <div class="blob blob-2"></div>
      <div class="blob blob-3"></div>
    </div>

    <!-- 根据路由显示不同页面 -->
    <div v-if="currentPage === 'login'">
      <LoginPage />
    </div>
    <div v-else-if="currentPage === 'register'">
      <RegisterPage />
    </div>
    <div v-else-if="isAuthenticated">
      <!-- 主容器 -->
      <div class="container">
        <!-- 头部 -->
        <header class="header">
          <div class="header-logo">
            <canvas id="headerLogo" width="48" height="48"></canvas>
            <span class="ml-3">蓝境</span>
          </div>
          <div class="header-subtitle">让每一段关系都被看见</div>
          <div class="header-user" v-if="user">
            <span class="user-nickname">{{ user.nickname }}</span>
            <button class="logout-btn" @click="logout">退出</button>
          </div>
        </header>

        <!-- 内容区域 -->
        <main>
          <!-- 建议卡片 -->
          <div class="mb-8">
            <!-- 生日提醒 -->
            <div v-if="upcomingBirthdays.length > 0">
              <div v-for="birthday in upcomingBirthdays" :key="birthday.id" class="suggestion-card">
                <div class="suggestion-icon">{{ birthday.type === 'today' ? '🎂' : '📅' }}</div>
                <div class="suggestion-text">
                  {{ birthday.type === 'today' ? `今天是${birthday.name}的生日，送个祝福吧！` : `${birthday.name}的生日还有${birthday.days}天，提前准备一下吧！` }}
                </div>
              </div>
            </div>
          </div>

          <!-- 关系列表 -->
          <div>
            <!-- 需要关心 -->
            <div v-if="groupedRelationships.red.length > 0" class="section">
              <div class="section-header">
                <div class="section-title">
                  🔴 需要关心
                  <span class="section-count">{{ groupedRelationships.red.length }}</span>
                </div>
              </div>
              <div class="card-list">
                <div v-for="r in groupedRelationships.red" :key="r.id" class="relationship-card red">
                  <div class="card-content">
                    <div class="card-avatar">{{ r.avatar }}</div>
                    <div class="card-info">
                      <div class="card-name">{{ r.name }}</div>
                      <div class="card-meta">
                        <span class="card-tag">{{ RELATIONSHIP_TYPES[r.type].icon }} {{ RELATIONSHIP_TYPES[r.type].label }}</span>
                        <span class="card-tag">{{ getDaysSince(r.lastContact) }}天前</span>
                        <span class="card-score red">🌡️ {{ getCurrentScore(r) }}分</span>
                      </div>
                    </div>
                    <div class="card-actions">
                      <button class="quick-btn">✏️</button>
                      <button class="quick-btn">📊</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 保持联系 -->
            <div v-if="groupedRelationships.yellow.length > 0" class="section">
              <div class="section-header">
                <div class="section-title">
                  🟡 保持联系
                  <span class="section-count">{{ groupedRelationships.yellow.length }}</span>
                </div>
              </div>
              <div class="card-list">
                <div v-for="r in groupedRelationships.yellow" :key="r.id" class="relationship-card yellow">
                  <div class="card-content">
                    <div class="card-avatar">{{ r.avatar }}</div>
                    <div class="card-info">
                      <div class="card-name">{{ r.name }}</div>
                      <div class="card-meta">
                        <span class="card-tag">{{ RELATIONSHIP_TYPES[r.type].icon }} {{ RELATIONSHIP_TYPES[r.type].label }}</span>
                        <span class="card-tag">{{ getDaysSince(r.lastContact) }}天前</span>
                        <span class="card-score yellow">🌡️ {{ getCurrentScore(r) }}分</span>
                      </div>
                    </div>
                    <div class="card-actions">
                      <button class="quick-btn">✏️</button>
                      <button class="quick-btn">📊</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 关系健康 -->
            <div v-if="groupedRelationships.green.length > 0" class="section">
              <div class="section-header">
                <div class="section-title">
                  🟢 关系健康
                  <span class="section-count">{{ groupedRelationships.green.length }}</span>
                </div>
              </div>
              <div class="card-list">
                <div v-for="r in groupedRelationships.green" :key="r.id" class="relationship-card green">
                  <div class="card-content">
                    <div class="card-avatar">{{ r.avatar }}</div>
                    <div class="card-info">
                      <div class="card-name">{{ r.name }}</div>
                      <div class="card-meta">
                        <span class="card-tag">{{ RELATIONSHIP_TYPES[r.type].icon }} {{ RELATIONSHIP_TYPES[r.type].label }}</span>
                        <span class="card-tag">{{ getDaysSince(r.lastContact) }}天前</span>
                        <span class="card-score green">🌡️ {{ getCurrentScore(r) }}分</span>
                      </div>
                    </div>
                    <div class="card-actions">
                      <button class="quick-btn">✏️</button>
                      <button class="quick-btn">📊</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 空状态 -->
            <div v-if="groupedRelationships.red.length === 0 && groupedRelationships.yellow.length === 0 && groupedRelationships.green.length === 0" class="empty-state">
              <div class="empty-icon">🌊</div>
              <div class="empty-title">欢迎来到蓝境</div>
              <div class="empty-text">开始添加你重要的关系，让每一段关系都被看见</div>
              <button class="empty-btn" @click="openAddModal">添加重要的人</button>
            </div>
          </div>
        </main>

        <!-- 浮动添加按钮 -->
        <button class="floating-btn" @click="openAddModal">
          <span class="floating-btn-icon">+</span>
          添加重要的人
        </button>
      </div>

      <!-- 添加关系模态框 -->
      <div class="modal-overlay" id="add-modal" ref="addModal">
        <div class="modal">
          <div class="modal-handle"></div>
          <div class="modal-header">
            <div class="modal-title">添加重要的人</div>
            <button class="modal-close" @click="closeAddModal">×</button>
          </div>
          <div class="modal-content">
            <div class="form-group">
              <label class="form-label">选择头像</label>
              <div class="avatar-grid" id="avatar-grid"></div>
            </div>

            <div class="form-group">
              <label class="form-label">昵称</label>
              <input type="text" class="form-input" id="name-input" placeholder="给Ta起个名字">
            </div>

            <div class="form-group">
              <label class="form-label">关系类型</label>
              <div class="type-row" id="type-row"></div>
            </div>

            <div class="form-group">
              <label class="form-label">关系等级</label>
              <div class="level-list" id="level-list"></div>
            </div>

            <div class="form-group">
              <label class="form-label">生日（可选）</label>
              <input type="text" class="form-input" id="birthday-input" placeholder="格式：05-20">
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-primary" @click="addRelationship">添加</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useMainStore, RELATIONSHIP_TYPES, RELATIONSHIP_LEVELS, AVATAR_OPTIONS } from './stores'
import { useAuthStore } from './stores/auth'
import LoginPage from './views/auth/Login.vue'
import RegisterPage from './views/auth/Register.vue'

const addModal = ref(null)
const mainStore = useMainStore()
const authStore = useAuthStore()

// 状态管理
let selectedAvatar = '😊'
let selectedType = 'friend'
let selectedLevel = 'friend'

// 计算属性
const groupedRelationships = computed(() => mainStore.groupedRelationships)
const upcomingBirthdays = computed(() => mainStore.checkBirthdays())
const isAuthenticated = computed(() => authStore.isAuthenticated)
const user = computed(() => authStore.user)

// 获取当前页面
const currentPage = computed(() => {
  const hash = window.location.hash
  if (hash === '#/login') return 'login'
  if (hash === '#/register') return 'register'
  return 'home'
})

// 监听路由变化
watch(currentPage, (newPage) => {
  // 路由变化时的处理
})

// 打开添加模态框
const openAddModal = () => {
  selectedAvatar = '😊'
  selectedType = 'friend'
  selectedLevel = 'friend'
  renderAddModalContent()
  if (addModal.value) {
    addModal.value.classList.add('active')
  }
}

// 关闭添加模态框
const closeAddModal = () => {
  if (addModal.value) {
    addModal.value.classList.remove('active')
  }
  document.getElementById('name-input').value = ''
  document.getElementById('birthday-input').value = ''
}

// 渲染添加模态框内容
const renderAddModalContent = () => {
  const avatarGrid = document.getElementById('avatar-grid')
  const typeRow = document.getElementById('type-row')
  const levelList = document.getElementById('level-list')

  if (avatarGrid) {
    avatarGrid.innerHTML = AVATAR_OPTIONS.map(a => `
      <div class="avatar-option ${a === selectedAvatar ? 'selected' : ''}" 
           @click="selectAddAvatar('${a}')">${a}</div>
    `).join('')
  }

  if (typeRow) {
    typeRow.innerHTML = Object.entries(RELATIONSHIP_TYPES).map(([key, val]) => `
      <div class="type-option ${key === selectedType ? 'selected' : ''}"
           @click="selectAddType('${key}')">
        <span class="type-icon">${val.icon}</span>
        <span class="type-label">${val.label}</span>
      </div>
    `).join('')
  }

  if (levelList) {
    levelList.innerHTML = Object.entries(RELATIONSHIP_LEVELS).map(([key, val]) => `
      <div class="level-option ${key === selectedLevel ? 'selected' : ''}"
           @click="selectAddLevel('${key}')">
        <span class="level-name">${val.label}</span>
        <span class="level-stars">${'★'.repeat(val.value + 1)}</span>
      </div>
    `).join('')
  }
}

// 选择头像
const selectAddAvatar = (avatar) => {
  selectedAvatar = avatar
  renderAddModalContent()
}

// 选择关系类型
const selectAddType = (type) => {
  selectedType = type
  renderAddModalContent()
}

// 选择关系等级
const selectAddLevel = (level) => {
  selectedLevel = level
  renderAddModalContent()
}

// 添加关系
const addRelationship = () => {
  const name = document.getElementById('name-input').value.trim()
  const birthday = document.getElementById('birthday-input').value.trim() || null

  if (!name) {
    alert('请输入昵称')
    return
  }

  const newRelationship = {
    name,
    avatar: selectedAvatar,
    type: selectedType,
    level: selectedLevel,
    birthday
  }

  mainStore.addRelationship(newRelationship)
  closeAddModal()
}

// 获取距离上次联系的天数
const getDaysSince = (dateStr) => {
  const date = new Date(dateStr)
  const now = new Date()
  const diffTime = Math.abs(now - date)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

// 获取当前温度分数
const getCurrentScore = (relationship) => {
  if (relationship.temperatureHistory.length === 0) return 60
  return relationship.temperatureHistory[relationship.temperatureHistory.length - 1].score
}

// 登出
const logout = async () => {
  await authStore.logout()
}

// 绘制头部Logo
const drawHeaderLogo = () => {
  const canvas = document.getElementById('headerLogo')
  if (!canvas) return
  
  const ctx = canvas.getContext('2d')
  const centerX = 24
  const centerY = 24
  const radius = 20
  
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
  ctx.moveTo(centerX - 14, centerY)
  
  for (let i = -14; i <= 14; i += 4) {
    const y = centerY + Math.sin(i * 0.3) * 3
    ctx.lineTo(centerX + i, y)
  }
  
  ctx.strokeStyle = '#0D1117'
  ctx.lineWidth = 1.5
  ctx.stroke()
  
  // 绘制连接点
  const points = [
    { x: centerX - 8, y: centerY - 4 },
    { x: centerX, y: centerY + 6 },
    { x: centerX + 8, y: centerY - 2 }
  ]
  
  points.forEach(point => {
    ctx.beginPath()
    ctx.arc(point.x, point.y, 1.5, 0, Math.PI * 2)
    ctx.fillStyle = '#0D1117'
    ctx.fill()
  })
}

// 生命周期钩子
onMounted(async () => {
  // 初始化认证状态
  await authStore.initAuth()
  
  // 如果未登录且不是登录/注册页面，跳转到登录页
  if (!isAuthenticated.value && currentPage.value === 'home') {
    window.location.href = '#/login'
  } else if (isAuthenticated.value) {
    // 已登录则初始化数据
    mainStore.initData()
    drawHeaderLogo()
  }
})
</script>

<style scoped>
.header {
  padding: 60px 24px 32px;
  text-align: center;
  position: relative;
}

.header-user {
  position: absolute;
  top: 24px;
  right: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-nickname {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
}

.logout-btn {
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid var(--primary);
  border-radius: var(--radius-sm);
  color: var(--primary);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.logout-btn:hover {
  background: rgba(88, 166, 255, 0.2);
  transform: translateY(-1px);
}

.header-logo {
  font-size: 32px;
  font-weight: 700;
  letter-spacing: 4px;
  margin-bottom: 8px;
  background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 0 20px rgba(88, 166, 255, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
}

#headerLogo {
  vertical-align: middle;
}

.header-subtitle {
  font-size: 14px;
  color: var(--text-secondary);
  font-weight: 400;
  letter-spacing: 1px;
}

.floating-btn {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
  color: white;
  border: none;
  border-radius: 50px;
  padding: 16px 32px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: var(--shadow-soft), 0 0 20px rgba(88, 166, 255, 0.4);
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 100;
}

.floating-btn:hover {
  transform: translateX(-50%) scale(1.05);
  box-shadow: 0 8px 24px rgba(88, 166, 255, 0.45);
}

.floating-btn:active {
  transform: translateX(-50%) scale(0.98);
}

.floating-btn-icon {
  font-size: 22px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  z-index: 1000;
  display: none;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.modal-overlay.active {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  opacity: 1;
}

.modal {
  background: var(--bg-secondary);
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
  display: flex;
  flex-direction: column;
  transform: translateY(100%);
  opacity: 0;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease;
  position: relative;
  border-top: 1px solid var(--glass-border);
}

.modal-overlay.active .modal {
  transform: translateY(0);
  opacity: 1;
}

.modal-handle {
  width: 40px;
  height: 4px;
  background: var(--text-tertiary);
  border-radius: 2px;
  margin: 12px auto;
}

.modal-header {
  padding: 20px 24px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.modal-close {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid var(--primary);
  cursor: pointer;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background: rgba(100, 181, 246, 0.2);
}

.modal-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  -webkit-overflow-scrolling: touch;
}

.form-group {
  margin-bottom: 24px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 10px;
}

.form-input {
  width: 100%;
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
  transform: translateY(-2px);
  box-shadow: 0 0 15px rgba(88, 166, 255, 0.3);
}

.form-input::placeholder {
  color: var(--text-tertiary);
}

.avatar-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
}

.avatar-option {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid transparent;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.2s ease;
}

.avatar-option:hover {
  background: rgba(100, 181, 246, 0.1);
  transform: scale(1.05);
}

.avatar-option.selected {
  border-color: var(--primary);
  background: rgba(100, 181, 246, 0.2);
}

.type-row {
  display: flex;
  gap: 10px;
}

.type-option {
  flex: 1;
  padding: 16px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid transparent;
  border-radius: var(--radius-sm);
  cursor: pointer;
  text-align: center;
  transition: all 0.2s ease;
}

.type-option:hover {
  background: rgba(100, 181, 246, 0.1);
}

.type-option.selected {
  border-color: var(--primary);
  background: rgba(100, 181, 246, 0.2);
}

.type-icon {
  font-size: 28px;
  display: block;
  margin-bottom: 6px;
}

.type-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
}

.level-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.level-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid transparent;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.2s ease;
}

.level-option:hover {
  background: rgba(100, 181, 246, 0.1);
}

.level-option.selected {
  border-color: var(--primary);
  background: rgba(100, 181, 246, 0.2);
}

.level-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
}

.level-stars {
  color: var(--text-tertiary);
  letter-spacing: 2px;
}

.level-option.selected .level-stars {
  color: var(--primary);
}

.modal-footer {
  padding: 16px 24px 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
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

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-soft), 0 0 20px rgba(88, 166, 255, 0.4);
}

.btn-primary:active {
  transform: translateY(0);
}
.suggestion-card {
  margin: 0 24px 32px;
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  padding: 20px 24px;
  box-shadow: var(--shadow-soft);
  position: relative;
  overflow: hidden;
}

.suggestion-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--primary), transparent);
}

.suggestion-icon {
  font-size: 28px;
  margin-bottom: 12px;
}

.suggestion-text {
  font-size: 15px;
  line-height: 1.6;
  color: var(--text-primary);
  font-weight: 400;
}

.section {
  margin-bottom: 32px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px 16px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-count {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-secondary);
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 500;
}

.card-list {
  padding: 0 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.relationship-card {
  background: var(--glass-bg);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  padding: 16px;
  box-shadow: var(--shadow-soft);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.relationship-card::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
}

.relationship-card.red::before {
  background: linear-gradient(180deg, var(--status-red) 0%, #FF5252 100%);
}

.relationship-card.yellow::before {
  background: linear-gradient(180deg, var(--status-yellow) 0%, #FFCA28 100%);
}

.relationship-card.green::before {
  background: linear-gradient(180deg, var(--status-green) 0%, #4CAF50 100%);
}

.relationship-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-soft), var(--shadow-glow);
  border-color: rgba(88, 166, 255, 0.4);
}

.relationship-card:active {
  transform: translateY(0);
  transition: all 0.1s ease;
}

.card-content {
  display: flex;
  align-items: center;
  gap: 14px;
}

.card-avatar {
  font-size: 44px;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-sm);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.card-info {
  flex: 1;
  min-width: 0;
}

.card-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.card-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.card-tag {
  font-size: 12px;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 4px;
}

.card-score {
  font-size: 12px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 8px;
}

.card-score.red {
  background: rgba(239, 83, 80, 0.2);
  color: var(--status-red);
}

.card-score.yellow {
  background: rgba(255, 213, 79, 0.2);
  color: var(--status-yellow);
}

.card-score.green {
  background: rgba(102, 187, 106, 0.2);
  color: var(--status-green);
}

.card-actions {
  display: flex;
  gap: 8px;
}

.quick-btn {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm);
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid var(--primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.quick-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(88, 166, 255, 0.2), transparent);
  transition: left 0.6s ease;
}

.quick-btn:hover {
  background: rgba(88, 166, 255, 0.2);
  border-color: var(--primary);
  transform: scale(1.1);
  box-shadow: 0 0 15px rgba(88, 166, 255, 0.3);
}

.quick-btn:hover::before {
  left: 100%;
}

.quick-btn:active {
  transform: scale(0.95);
  transition: all 0.1s ease;
}

.empty-state {
  text-align: center;
  padding: 80px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
}

.empty-icon {
  font-size: 80px;
  margin-bottom: 24px;
  opacity: 0.8;
  animation: float 6s ease-in-out infinite;
}

.empty-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.empty-text {
  font-size: 15px;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 32px;
  max-width: 320px;
}

.empty-btn {
  background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
  color: white;
  border: none;
  border-radius: 50px;
  padding: 16px 32px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: var(--shadow-soft), 0 0 20px rgba(88, 166, 255, 0.4);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.empty-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 24px rgba(88, 166, 255, 0.45);
}

@keyframes float {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-10px) scale(1.05); }
}
</style>