<template>
  <div class="container">
    <!-- 头部 -->
    <div class="header">
      <h1>☀️ 暖流</h1>
      <p>让每一段关系都被看见</p>
    </div>

    <!-- 主页面 -->
    <div v-if="!selectedRelationship">
      <!-- 需要关心 (红色) -->
      <div class="section" v-if="needAttention.length > 0">
        <h2>🔴 需要关心 ({{ needAttention.length }})</h2>
        <div class="relationship-grid">
          <div 
            v-for="relationship in needAttention" 
            :key="relationship.id"
            class="relationship-card"
            @click="selectRelationship(relationship)"
          >
            <div class="avatar">{{ relationship.avatar }}</div>
            <div class="name">{{ relationship.name }}</div>
            <div class="days">{{ getDaysSinceLastContact(relationship) }}天</div>
          </div>
        </div>
      </div>

      <!-- 保持联系 (黄色) -->
      <div class="section" v-if="keepInTouch.length > 0">
        <h2>🟡 保持联系 ({{ keepInTouch.length }})</h2>
        <div class="relationship-grid">
          <div 
            v-for="relationship in keepInTouch" 
            :key="relationship.id"
            class="relationship-card"
            @click="selectRelationship(relationship)"
          >
            <div class="avatar">{{ relationship.avatar }}</div>
            <div class="name">{{ relationship.name }}</div>
            <div class="days">{{ getDaysSinceLastContact(relationship) }}天</div>
          </div>
        </div>
      </div>

      <!-- 关系健康 (绿色) -->
      <div class="section" v-if="healthyRelationships.length > 0">
        <h2>🟢 关系健康 ({{ healthyRelationships.length }})</h2>
        <div class="relationship-grid">
          <div 
            v-for="relationship in healthyRelationships" 
            :key="relationship.id"
            class="relationship-card"
            @click="selectRelationship(relationship)"
          >
            <div class="avatar">{{ relationship.avatar }}</div>
            <div class="name">{{ relationship.name }}</div>
            <div class="days">{{ getDaysSinceLastContact(relationship) }}天</div>
          </div>
        </div>
      </div>

      <!-- 添加按钮 -->
      <button class="add-button" @click="showAddModal = true">＋ 添加重要的人</button>
    </div>

    <!-- 关系详情页 -->
    <div v-else>
      <button class="back-button" @click="selectedRelationship = null">← 返回首页</button>
      <div class="detail-container">
        <div class="detail-header">
          <div class="avatar">{{ selectedRelationship.avatar }}</div>
          <div class="info">
            <div class="name">{{ selectedRelationship.name }}</div>
            <div class="type">{{ getTypeText(selectedRelationship.type) }}</div>
            <div class="level">{{ getLevelText(selectedRelationship.level) }}</div>
          </div>
        </div>

        <!-- 温度曲线 -->
        <div class="temperature-section">
          <h3>温度曲线</h3>
          <div class="temperature-chart" ref="chartRef"></div>

          <!-- 温度输入 -->
          <h3>更新关系温度</h3>
          <div class="temperature-input">
            <button 
              :class="{ active: temperatureChange === -10 }"
              @click="temperatureChange = -10"
            >
              变冷 (-10)
            </button>
            <button 
              :class="{ active: temperatureChange === 0 }"
              @click="temperatureChange = 0"
            >
              没变化 (0)
            </button>
            <button 
              :class="{ active: temperatureChange === 10 }"
              @click="temperatureChange = 10"
            >
              变暖 (+10)
            </button>
          </div>

          <!-- 备注输入 -->
          <div class="note-input">
            <textarea 
              v-model="temperatureNote"
              placeholder="今天发生啥了..."
            ></textarea>
          </div>

          <!-- 提交按钮 -->
          <button class="add-button" @click="updateTemperature">更新温度</button>
        </div>

        <!-- 温度历史 -->
        <div class="temperature-history">
          <h3>温度记录</h3>
          <div 
            v-for="(record, index) in selectedRelationship.temperatureHistory" 
            :key="index"
            class="history-item"
          >
            <div class="date">{{ record.date }}</div>
            <div class="score">温度: {{ record.score }}</div>
            <div class="note" v-if="record.note">{{ record.note }}</div>
          </div>
        </div>

        <!-- 暖心建议 -->
        <div class="suggestions-section">
          <h3>暖心建议</h3>
          <p>{{ getSuggestion(selectedRelationship) }}</p>
        </div>
      </div>
    </div>

    <!-- 添加关系模态框 -->
    <div class="modal" v-if="showAddModal">
      <div class="modal-content">
        <h2>添加重要的人</h2>
        <div class="form-group">
          <label>昵称</label>
          <input v-model="newRelationship.name" type="text" placeholder="输入昵称" />
        </div>
        <div class="form-group">
          <label>头像 (emoji)</label>
          <input v-model="newRelationship.avatar" type="text" placeholder="输入emoji" />
        </div>
        <div class="form-group">
          <label>关系类型</label>
          <select v-model="newRelationship.type">
            <option value="friend">朋友</option>
            <option value="lover">恋人</option>
            <option value="family">家人</option>
          </select>
        </div>
        <div class="form-group">
          <label>关系等级</label>
          <select v-model="newRelationship.level">
            <option value="stranger">陌生</option>
            <option value="acquaintance">认识</option>
            <option value="friend">熟识</option>
            <option value="close">亲密</option>
            <option value="best">挚友</option>
          </select>
        </div>
        <div class="form-group">
          <label>生日 (可选，格式: MM-DD)</label>
          <input v-model="newRelationship.birthday" type="text" placeholder="例如: 01-01" />
        </div>
        <div class="button-group">
          <button class="cancel-button" @click="showAddModal = false">取消</button>
          <button class="confirm-button" @click="addRelationship">添加</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts';
import { ref, computed, onMounted, watch } from 'vue';
import { getRelationships, saveRelationships } from './utils/storage.js';
import { getSuggestion } from './utils/suggestions.js';

export default {
  name: 'App',
  setup() {
    // 状态
    const relationships = ref(getRelationships());
    const showAddModal = ref(false);
    const selectedRelationship = ref(null);
    const temperatureChange = ref(0);
    const temperatureNote = ref('');
    const chartRef = ref(null);
    let chart = null;

    // 新关系表单
    const newRelationship = ref({
      name: '',
      avatar: '🤝',
      type: 'friend',
      level: 'acquaintance',
      birthday: null
    });

    // 计算属性：按状态分类关系
    const needAttention = computed(() => {
      return relationships.value.filter(rel => {
        const days = getDaysSinceLastContact(rel);
        const lastScore = rel.temperatureHistory[rel.temperatureHistory.length - 1]?.score || 50;
        return days >= 14 || lastScore < 40;
      });
    });

    const keepInTouch = computed(() => {
      return relationships.value.filter(rel => {
        const days = getDaysSinceLastContact(rel);
        const lastScore = rel.temperatureHistory[rel.temperatureHistory.length - 1]?.score || 50;
        return days >= 7 && days < 14 && lastScore >= 40;
      });
    });

    const healthyRelationships = computed(() => {
      return relationships.value.filter(rel => {
        const days = getDaysSinceLastContact(rel);
        const lastScore = rel.temperatureHistory[rel.temperatureHistory.length - 1]?.score || 50;
        return days < 7 && lastScore >= 40;
      });
    });

    // 方法：计算上次联系天数
    function getDaysSinceLastContact(relationship) {
      const lastContact = new Date(relationship.lastContact || relationship.createdAt);
      const today = new Date();
      const diffTime = Math.abs(today - lastContact);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    }

    // 方法：获取关系类型文本
    function getTypeText(type) {
      const types = {
        friend: '朋友',
        lover: '恋人',
        family: '家人'
      };
      return types[type] || type;
    }

    // 方法：获取关系等级文本
    function getLevelText(level) {
      const levels = {
        stranger: '陌生',
        acquaintance: '认识',
        friend: '熟识',
        close: '亲密',
        best: '挚友'
      };
      return levels[level] || level;
    }

    // 方法：选择关系
    function selectRelationship(relationship) {
      selectedRelationship.value = relationship;
    }

    // 方法：添加关系
    function addRelationship() {
      if (!newRelationship.value.name) return;

      const today = new Date().toISOString().split('T')[0];
      const newRel = {
        id: Date.now().toString(),
        ...newRelationship.value,
        lastContact: today,
        temperatureHistory: [
          { date: today, score: 50, note: '关系建立' }
        ],
        createdAt: today
      };

      relationships.value.push(newRel);
      saveRelationships(relationships.value);
      showAddModal.value = false;

      // 重置表单
      newRelationship.value = {
        name: '',
        avatar: '🤝',
        type: 'friend',
        level: 'acquaintance',
        birthday: null
      };
    }

    // 方法：更新温度
    function updateTemperature() {
      if (!selectedRelationship.value) return;

      const today = new Date().toISOString().split('T')[0];
      const lastScore = selectedRelationship.value.temperatureHistory[selectedRelationship.value.temperatureHistory.length - 1]?.score || 50;
      const newScore = Math.max(0, Math.min(100, lastScore + temperatureChange.value));

      selectedRelationship.value.temperatureHistory.push({
        date: today,
        score: newScore,
        note: temperatureNote.value
      });

      selectedRelationship.value.lastContact = today;
      saveRelationships(relationships.value);

      // 重置表单
      temperatureChange.value = 0;
      temperatureNote.value = '';

      // 更新图表
      updateChart();
    }

    // 方法：更新图表
    function updateChart() {
      if (!chartRef.value || !selectedRelationship.value) return;

      if (chart) {
        chart.dispose();
      }

      chart = echarts.init(chartRef.value);

      const history = selectedRelationship.value.temperatureHistory;
      const dates = history.map(item => item.date);
      const scores = history.map(item => item.score);

      const option = {
        tooltip: {
          trigger: 'axis',
          formatter: function(params) {
            const data = params[0];
            const index = data.dataIndex;
            const note = history[index].note || '';
            return `${data.name}<br/>温度: ${data.value}<br/>${note}`;
          }
        },
        xAxis: {
          type: 'category',
          data: dates
        },
        yAxis: {
          type: 'value',
          min: 0,
          max: 100,
          axisLabel: {
            formatter: '{value}'
          }
        },
        series: [{
          data: scores,
          type: 'line',
          smooth: true,
          lineStyle: {
            color: '#FF9F43'
          },
          itemStyle: {
            color: '#FF9F43'
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: 'rgba(255, 159, 67, 0.3)'
              },
              {
                offset: 1,
                color: 'rgba(255, 159, 67, 0.1)'
              }
            ])
          }
        }]
      };

      chart.setOption(option);

      // 响应式调整
      window.addEventListener('resize', () => {
        chart.resize();
      });
    }

    // 监听选中关系变化，更新图表
    watch(selectedRelationship, () => {
      setTimeout(updateChart, 100);
    });

    // 初始化
    onMounted(() => {
      // 如果没有关系，添加示例数据
      if (relationships.value.length === 0) {
        const today = new Date().toISOString().split('T')[0];
        const sampleData = [
          {
            id: '1',
            name: '小明',
            avatar: '🤝',
            type: 'friend',
            level: 'close',
            birthday: null,
            lastContact: today,
            temperatureHistory: [
              { date: today, score: 60, note: '刚吵完架' },
              { date: today, score: 65, note: '和好了' }
            ],
            createdAt: today
          }
        ];
        relationships.value = sampleData;
        saveRelationships(sampleData);
      }
    });

    return {
      relationships,
      showAddModal,
      selectedRelationship,
      newRelationship,
      temperatureChange,
      temperatureNote,
      chartRef,
      needAttention,
      keepInTouch,
      healthyRelationships,
      getDaysSinceLastContact,
      getTypeText,
      getLevelText,
      selectRelationship,
      addRelationship,
      updateTemperature,
      getSuggestion
    };
  }
};
</script>