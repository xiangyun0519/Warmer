// 暖心建议工具

// 计算上次联系天数
function getDaysSinceLastContact(relationship) {
  const lastContact = new Date(relationship.lastContact || relationship.createdAt);
  const today = new Date();
  const diffTime = Math.abs(today - lastContact);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

// 检查是否是生日
function isBirthdayToday(relationship) {
  if (!relationship.birthday) return false;
  const today = new Date();
  const todayMonthDay = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  return relationship.birthday === todayMonthDay;
}

// 检查是否持续降温
function isContinuousCooling(history) {
  if (history.length < 3) return false;
  const recentHistory = history.slice(-3);
  for (let i = 1; i < recentHistory.length; i++) {
    if (recentHistory[i].score >= recentHistory[i - 1].score) {
      return false;
    }
  }
  return true;
}

// 检查是否持续升温
function isContinuousWarming(history) {
  if (history.length < 3) return false;
  const recentHistory = history.slice(-3);
  for (let i = 1; i < recentHistory.length; i++) {
    if (recentHistory[i].score <= recentHistory[i - 1].score) {
      return false;
    }
  }
  return true;
}

// 检查是否是新关系
function isNewRelationship(relationship) {
  const createdAt = new Date(relationship.createdAt);
  const today = new Date();
  const diffTime = Math.abs(today - createdAt);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= 7;
}

// 获取暖心建议
export function getSuggestion(relationship) {
  const days = getDaysSinceLastContact(relationship);
  const history = relationship.temperatureHistory || [];
  const lastScore = history[history.length - 1]?.score || 50;
  const name = relationship.name;
  const type = relationship.type;

  // 生日当天
  if (isBirthdayToday(relationship)) {
    return `今天是${name}的生日，送个祝福吧`;
  }

  // 14天没联系+降温
  if (days >= 14 && lastScore < 50) {
    return `你和${name}已经两周没联系了，发个消息吧`;
  }

  // 7天没联系
  if (days >= 7 && days < 14) {
    return `记得和${name}保持联系哦`;
  }

  // 持续降温
  if (isContinuousCooling(history)) {
    return `关系需要维护，找个机会聊聊？`;
  }

  // 持续升温
  if (isContinuousWarming(history)) {
    return `你们最近关系升温很快，可以约出来聚聚`;
  }

  // 新关系
  if (isNewRelationship(relationship)) {
    return `刚认识${name}，可以主动打个招呼`;
  }

  // 恋人+长期未更新
  if (type === 'lover' && days >= 14) {
    return `和${name}在一起很久了，记得制造小惊喜`;
  }

  // 家人+长期未更新
  if (type === 'family' && days >= 14) {
    return `给家人打个电话吧，他们在想你`;
  }

  // 温度低于40
  if (lastScore < 40) {
    return `这段关系好像遇到了问题，也许需要主动修复`;
  }

  // 温度高于80
  if (lastScore > 80) {
    return `这段关系很健康，继续保持`;
  }

  // 关系刚建立
  if (history.length === 1) {
    return `新朋友要好好维护哦，记得保持联系`;
  }

  // 默认建议
  return `记得定期维护和${name}的关系哦`;
}