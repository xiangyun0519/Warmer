import AV from '../utils/leancloud';

// 互动记录模型
class InteractionRecord extends AV.Object {
  constructor() {
    super('InteractionRecord');
  }

  // 设置互动记录
  setInteractionRecord(sender, receiver, type, content = '') {
    this.set('sender', sender);
    this.set('receiver', receiver);
    this.set('type', type);
    this.set('content', content);
    this.set('timestamp', new Date());
    return this;
  }

  // 获取用户发送的互动记录
  static async getSentInteractions(user, limit = 30) {
    const query = new AV.Query('InteractionRecord');
    query.equalTo('sender', user);
    query.descending('timestamp');
    query.limit(limit);
    return await query.find();
  }

  // 获取用户接收的互动记录
  static async getReceivedInteractions(user, limit = 30) {
    const query = new AV.Query('InteractionRecord');
    query.equalTo('receiver', user);
    query.descending('timestamp');
    query.limit(limit);
    return await query.find();
  }

  // 获取两个用户之间的互动记录
  static async getInteractionsBetweenUsers(userA, userB, limit = 30) {
    const query = new AV.Query('InteractionRecord');
    const subQuery1 = new AV.Query('InteractionRecord');
    subQuery1.equalTo('sender', userA);
    subQuery1.equalTo('receiver', userB);
    const subQuery2 = new AV.Query('InteractionRecord');
    subQuery2.equalTo('sender', userB);
    subQuery2.equalTo('receiver', userA);
    query.or([subQuery1, subQuery2]);
    query.descending('timestamp');
    query.limit(limit);
    return await query.find();
  }

  // 获取用户的所有互动记录
  static async getAllUserInteractions(user, limit = 30) {
    const query = new AV.Query('InteractionRecord');
    const subQuery1 = new AV.Query('InteractionRecord');
    subQuery1.equalTo('sender', user);
    const subQuery2 = new AV.Query('InteractionRecord');
    subQuery2.equalTo('receiver', user);
    query.or([subQuery1, subQuery2]);
    query.descending('timestamp');
    query.limit(limit);
    return await query.find();
  }
}

// 注册模型
AV.Object.register(InteractionRecord, 'InteractionRecord');

export default InteractionRecord;