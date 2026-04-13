import AV from 'leancloud-storage';

// 初始化LeanCloud
AV.init({
  appId: 'test_app_id',
  appKey: 'test_app_key',
  serverURL: 'https://api.leancloud.cn'
});

// 测试环境配置，生产环境请替换为真实的 LeanCloud 应用信息
export default AV;