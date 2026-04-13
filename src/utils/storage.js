// 本地存储工具

const STORAGE_KEY = 'warm-flow-relationships';

// 获取所有关系
export function getRelationships() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting relationships from localStorage:', error);
    return [];
  }
}

// 保存所有关系
export function saveRelationships(relationships) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(relationships));
  } catch (error) {
    console.error('Error saving relationships to localStorage:', error);
  }
}

// 获取单个关系
export function getRelationship(id) {
  const relationships = getRelationships();
  return relationships.find(rel => rel.id === id);
}

// 更新单个关系
export function updateRelationship(updatedRelationship) {
  const relationships = getRelationships();
  const index = relationships.findIndex(rel => rel.id === updatedRelationship.id);
  if (index !== -1) {
    relationships[index] = updatedRelationship;
    saveRelationships(relationships);
    return true;
  }
  return false;
}

// 删除关系
export function deleteRelationship(id) {
  const relationships = getRelationships();
  const filteredRelationships = relationships.filter(rel => rel.id !== id);
  if (filteredRelationships.length !== relationships.length) {
    saveRelationships(filteredRelationships);
    return true;
  }
  return false;
}