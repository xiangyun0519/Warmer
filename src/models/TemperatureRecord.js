import AV from '../utils/leancloud';

// 温度记录模型
class TemperatureRecord extends AV.Object {
  constructor() {
    super('TemperatureRecord');
  }

  // 设置温度记录
  setTemperatureRecord(user, temperature, timestamp = new Date()) {
    this.set('user', user);
    this.set('temperature', temperature);
    this.set('timestamp', timestamp);
    return this;
  }

  // 获取用户的温度记录
  static async getUserTemperatureRecords(user, limit = 30) {
    const query = new AV.Query('TemperatureRecord');
    query.equalTo('user', user);
    query.descending('timestamp');
    query.limit(limit);
    return await query.find();
  }

  // 获取用户指定时间范围内的温度记录
  static async getUserTemperatureRecordsByDateRange(user, startDate, endDate) {
    const query = new AV.Query('TemperatureRecord');
    query.equalTo('user', user);
    query.greaterThanOrEqualTo('timestamp', startDate);
    query.lessThanOrEqualTo('timestamp', endDate);
    query.descending('timestamp');
    return await query.find();
  }

  // 获取用户最近的温度记录
  static async getLatestTemperatureRecord(user) {
    const query = new AV.Query('TemperatureRecord');
    query.equalTo('user', user);
    query.descending('timestamp');
    query.limit(1);
    const results = await query.find();
    return results.length > 0 ? results[0] : null;
  }
}

// 注册模型
AV.Object.register(TemperatureRecord, 'TemperatureRecord');

export default TemperatureRecord;