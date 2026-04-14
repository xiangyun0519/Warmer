import { defineStore } from 'pinia'

// 关系类型和等级数据
export const RELATIONSHIP_TYPES = {
  friend: { label: '朋友', icon: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=friendly%20group%20of%20people%20icon%20minimal%20flat%20design%20blue%20color%20scheme&image_size=square' },
  lover: { label: '恋人', icon: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=heart%20icon%20minimal%20flat%20design%20red%20color%20scheme&image_size=square' },
  family: { label: '家人', icon: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=family%20home%20icon%20minimal%20flat%20design%20green%20color%20scheme&image_size=square' }
}

export const RELATIONSHIP_LEVELS = {
  stranger: { label: '陌生', value: 0 },
  acquaintance: { label: '认识', value: 1 },
  friend: { label: '熟识', value: 2 },
  close: { label: '亲密', value: 3 },
  best: { label: '挚友', value: 4 }
}

export const AVATAR_OPTIONS = [
  'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=friendly%20person%20avatar%20minimal%20flat%20design%20blue%20color%20scheme&image_size=square',
  'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=family%20member%20avatar%20minimal%20flat%20design%20green%20color%20scheme&image_size=square',
  'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=lover%20avatar%20minimal%20flat%20design%20red%20color%20scheme&image_size=square',
  'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=friend%20avatar%20minimal%20flat%20design%20blue%20color%20scheme&image_size=square',
  'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=person%20avatar%20minimal%20flat%20design%20purple%20color%20scheme&image_size=square',
  'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=person%20avatar%20minimal%20flat%20design%20orange%20color%20scheme&image_size=square',
  'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=person%20avatar%20minimal%20flat%20design%20teal%20color%20scheme&image_size=square',
  'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=person%20avatar%20minimal%20flat%20design%20pink%20color%20scheme&image_size=square',
  'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=person%20avatar%20minimal%20flat%20design%20yellow%20color%20scheme&image_size=square',
  'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=person%20avatar%20minimal%20flat%20design%20indigo%20color%20scheme&image_size=square',
  'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=person%20avatar%20minimal%20flat%20design%20brown%20color%20scheme&image_size=square',
  'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=person%20avatar%20minimal%20flat%20design%20gray%20color%20scheme&image_size=square',
  'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=person%20avatar%20minimal%20flat%20design%20cyan%20color%20scheme&image_size=square',
  'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=person%20avatar%20minimal%20flat%20design%20lime%20color%20scheme&image_size=square',
  'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=person%20avatar%20minimal%20flat%20design%20navy%20color%20scheme&image_size=square',
  'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=person%20avatar%20minimal%20flat%20design%20maroon%20color%20scheme&image_size=square',
  'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=person%20avatar%20minimal%20flat%20design%20olive%20color%20scheme&image_size=square',
  'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=person%20avatar%20minimal%20flat%20design%20teal%20color%20scheme&image_size=square',
  'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=person%20avatar%20minimal%20flat%20design%20purple%20color%20scheme&image_size=square',
  'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=person%20avatar%20minimal%20flat%20design%20blue%20color%20scheme&image_size=square'
]

// 获取当前日期
const getCurrentDate = () => {
  return new Date().toISOString().split('T')[0]
}

// 主Store
export const useMainStore = defineStore('main', {
  state: () => ({
    // 用户信息
    user: null,
    // 关系列表
    relationships: [],
    // 陪伴关系列表
    companions: [],
    // 互动记录
    interactions: [],
    // 提醒列表
    reminders: [],
    // 徽章列表
    badges: [],
    // 是否显示首次引导
    hasSeenOnboarding: false
  }),

  getters: {
    // 按状态分组的关系
    groupedRelationships: (state) => {
      const red = []
      const yellow = []
      const green = []
      
      state.relationships.forEach(r => {
        const status = getStatus(r)
        if (status.type === 'red') red.push(r)
        else if (status.type === 'yellow') yellow.push(r)
        else green.push(r)
      })
      
      return { red, yellow, green }
    },

    // 待处理的陪伴请求
    pendingCompanions: (state) => {
      return state.companions.filter(c => c.status === 'pending')
    },

    // 已接受的陪伴关系
    acceptedCompanions: (state) => {
      return state.companions.filter(c => c.status === 'accepted')
    }
  },

  actions: {
    // 初始化数据
    initData() {
      this.loadData()
      this.checkBirthdays()
      this.checkOnboarding()
    },

    // 从本地存储加载数据
    loadData() {
      try {
        const saved = localStorage.getItem('blueRealm')
        if (saved) {
          const data = JSON.parse(saved)
          this.relationships = data.relationships || []
          this.companions = data.companions || []
          this.interactions = data.interactions || []
          this.reminders = data.reminders || []
          this.badges = data.badges || []
          this.hasSeenOnboarding = data.hasSeenOnboarding || false
        } else {
          // 初始化测试数据
          this.initTestData()
        }
      } catch (error) {
        console.error('加载数据失败:', error)
        this.initTestData()
      }
    },

    // 保存数据到本地存储
    saveData() {
      try {
        const data = {
          relationships: this.relationships,
          companions: this.companions,
          interactions: this.interactions,
          reminders: this.reminders,
          badges: this.badges,
          hasSeenOnboarding: this.hasSeenOnboarding
        }
        localStorage.setItem('blueRealm', JSON.stringify(data))
      } catch (error) {
        console.error('保存数据失败:', error)
      }
    },

    // 初始化测试数据
    initTestData() {
      this.relationships = [
        {
          id: '1',
          name: '小明',
          avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=friendly%20person%20avatar%20minimal%20flat%20design%20blue%20color%20scheme&image_size=square',
          type: 'friend',
          level: 'close',
          birthday: '04-13',
          lastContact: '2026-03-30',
          temperatureHistory: [
            { date: '2026-03-01', score: 70, note: '一起吃饭' },
            { date: '2026-03-15', score: 65, note: '好久没见' },
            { date: '2026-03-30', score: 55, note: '刚吵完架' }
          ],
          createdAt: '2026-01-15'
        },
        {
          id: '2',
          name: '老妈',
          avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=family%20member%20avatar%20minimal%20flat%20design%20green%20color%20scheme&image_size=square',
          type: 'family',
          level: 'best',
          birthday: '08-15',
          lastContact: '2026-03-20',
          temperatureHistory: [
            { date: '2026-02-01', score: 85, note: '打电话回家' },
            { date: '2026-03-01', score: 80, note: '视频通话' },
            { date: '2026-03-20', score: 75, note: '好久没打了' }
          ],
          createdAt: '2026-01-01'
        },
        {
          id: '3',
          name: '小红',
          avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=lover%20avatar%20minimal%20flat%20design%20red%20color%20scheme&image_size=square',
          type: 'lover',
          level: 'best',
          birthday: '12-25',
          lastContact: '2026-04-10',
          temperatureHistory: [
            { date: '2026-03-01', score: 75, note: '约会' },
            { date: '2026-03-20', score: 82, note: '一起看电影' },
            { date: '2026-04-10', score: 88, note: '收到礼物' }
          ],
          createdAt: '2026-02-14'
        },
        {
          id: '4',
          name: '阿杰',
          avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=friend%20avatar%20minimal%20flat%20design%20blue%20color%20scheme&image_size=square',
          type: 'friend',
          level: 'friend',
          birthday: null,
          lastContact: '2026-04-05',
          temperatureHistory: [
            { date: '2026-03-15', score: 60, note: '打球' },
            { date: '2026-04-05', score: 65, note: '开黑' }
          ],
          createdAt: '2026-03-01'
        }
      ]
      this.saveData()
    },

    // 添加关系
    addRelationship(relationship) {
      const newRelationship = {
        id: Date.now().toString(),
        lastContact: getCurrentDate(),
        temperatureHistory: [{
          date: getCurrentDate(),
          score: 60,
          note: '刚认识'
        }],
        createdAt: getCurrentDate(),
        ...relationship
      }
      this.relationships.push(newRelationship)
      this.saveData()
      return newRelationship
    },

    // 更新关系温度
    updateTemperature(relationshipId, score, note) {
      const relationship = this.relationships.find(r => r.id === relationshipId)
      if (relationship) {
        relationship.temperatureHistory.push({
          date: getCurrentDate(),
          score,
          note
        })
        relationship.lastContact = getCurrentDate()
        this.saveData()
        return true
      }
      return false
    },

    // 添加陪伴关系
    addCompanion(userId) {
      const newCompanion = {
        id: Date.now().toString(),
        userA: this.user?.id || 'current',
        userB: userId,
        status: 'pending',
        createdAt: getCurrentDate()
      }
      this.companions.push(newCompanion)
      this.saveData()
      return newCompanion
    },

    // 接受陪伴请求
    acceptCompanion(companionId) {
      const companion = this.companions.find(c => c.id === companionId)
      if (companion) {
        companion.status = 'accepted'
        this.saveData()
        return true
      }
      return false
    },

    // 添加互动记录
    addInteraction(companionId, type, content) {
      const newInteraction = {
        id: Date.now().toString(),
        companionId,
        type,
        content,
        fromUser: this.user?.id || 'current',
        createdAt: getCurrentDate()
      }
      this.interactions.push(newInteraction)
      this.saveData()
      return newInteraction
    },

    // 检查生日提醒
    checkBirthdays() {
      const today = new Date()
      const todayMonth = today.getMonth() + 1
      const todayDay = today.getDate()
      const todayStr = `${todayMonth.toString().padStart(2, '0')}-${todayDay.toString().padStart(2, '0')}`
      
      const upcomingBirthdays = []
      
      this.relationships.forEach(relationship => {
        if (relationship.birthday) {
          const [month, day] = relationship.birthday.split('-').map(Number)
          const birthdayStr = `${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
          
          if (birthdayStr === todayStr) {
            upcomingBirthdays.push({ ...relationship, type: 'today' })
          } else {
            // 检查未来7天内的生日
            const birthdayDate = new Date(today.getFullYear(), month - 1, day)
            if (birthdayDate < today) {
              birthdayDate.setFullYear(today.getFullYear() + 1)
            }
            
            const diffTime = birthdayDate - today
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
            
            if (diffDays <= 7) {
              upcomingBirthdays.push({ ...relationship, type: 'upcoming', days: diffDays })
            }
          }
        }
      })
      
      return upcomingBirthdays
    },

    // 标记首次引导已完成
    finishOnboarding() {
      this.hasSeenOnboarding = true
      this.saveData()
    },

    // 检查是否需要显示首次引导
    checkOnboarding() {
      return !this.hasSeenOnboarding
    }
  }
})

// 辅助函数：获取关系状态
function getStatus(relationship) {
  const days = getDaysSince(relationship.lastContact)
  const score = getCurrentScore(relationship)

  if (days >= 14 || score < 50) return { type: 'red', label: '需要关心' }
  if (days >= 7 || score < 70) return { type: 'yellow', label: '保持联系' }
  return { type: 'green', label: '关系健康' }
}

// 辅助函数：获取距离上次联系的天数
function getDaysSince(dateStr) {
  const date = new Date(dateStr)
  const now = new Date()
  const diffTime = Math.abs(now - date)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

// 辅助函数：获取当前温度分数
function getCurrentScore(relationship) {
  if (relationship.temperatureHistory.length === 0) return 60
  return relationship.temperatureHistory[relationship.temperatureHistory.length - 1].score
}