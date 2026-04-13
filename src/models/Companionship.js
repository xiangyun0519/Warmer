import AV from '../utils/leancloud';

// 陪伴关系模型
class Companionship extends AV.Object {
  constructor() {
    super('Companionship');
  }

  // 设置陪伴关系
  setCompanionship(userA, userB, status = 'pending') {
    this.set('userA', userA);
    this.set('userB', userB);
    this.set('status', status);
    this.set('createdAt', new Date());
    return this;
  }

  // 获取陪伴关系
  static async getCompanionship(userA, userB) {
    const query = new AV.Query('Companionship');
    query.equalTo('userA', userA);
    query.equalTo('userB', userB);
    return await query.first();
  }

  // 获取用户的所有陪伴关系
  static async getUserCompanionships(user) {
    const query = new AV.Query('Companionship');
    const subQuery1 = new AV.Query('Companionship');
    subQuery1.equalTo('userA', user);
    const subQuery2 = new AV.Query('Companionship');
    subQuery2.equalTo('userB', user);
    query.or([subQuery1, subQuery2]);
    return await query.find();
  }

  // 更新陪伴关系状态
  async updateStatus(status) {
    this.set('status', status);
    return await this.save();
  }
}

// 注册模型
AV.Object.register(Companionship, 'Companionship');

export default Companionship;