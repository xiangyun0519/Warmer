import AV from '../utils/leancloud';

// 用户模型
class User extends AV.User {
  // 自定义方法
  static async signUp(username, password, email) {
    const user = new AV.User();
    user.setUsername(username);
    user.setPassword(password);
    user.setEmail(email);
    return await user.signUp();
  }

  static async login(username, password) {
    return await AV.User.logIn(username, password);
  }

  static async logout() {
    return await AV.User.logOut();
  }

  static getCurrentUser() {
    return AV.User.current();
  }
}

export default User;