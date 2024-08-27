
// 初始化pinia
import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', () => {
  // 响应式用户信息状态
  const user = ref(null);
  // 响应式用户是否订阅
  const subscribedUser = ref(false);
  // 响应式用户积分
  const credits = ref(0);
  // 响应式鉴权值
  const jwt = ref('');
  // 响应式passport (token()
  const passport = ref('');
  // 获取登录相关接口
  // const { login } = useApi();

  /**
   * @description:  获取用户信息
   * @param {String} passportValue //后端接口获取到的passport 类似于token
   * @param {Boolean} isInit  // 是否为网站初始化调用获取用户信息
   * @return {RefObject} User
   */
  const getUser = async (passportValue, isInit) => {
    if(!passportValue){
      passportValue=localStorage.getItem(passport);
    }
    setPassport(passportValue);
    try {
      const res = await login.getUserStatus(passportValue);
      if (res.ok === 0 && res.data) {
        try {
          const { profile, subscription, team_subscription } = res.data;
          jwt.value = res?.data?.jwt;
          if (profile) {
            let { free_cnt, is_subscribed, detail } = subscription;
            if (detail && detail.ends_at) is_subscribed = new Date(detail.ends_at) > new Date();
            if (!free_cnt) free_cnt = 0;
            const subscribedType = (is_subscribed && ((detail && detail.name) || (team_subscription && team_subscription.detail && team_subscription.detail.name))) || '';
            const _user = { ...profile, free_cnt, is_subscribed, subscribedType };
            user.value = _user;
            subscribedUser.value = is_subscribed;
            credits.value = free_cnt;
          }
        } catch (e) {
          console.log(e);
        }
      }
    } catch (error) {
      console.error(error, 'error 获取用户信息失败');
    }
    return user; // 返回用户状态，无论请求成功与否
  };

  /**
   * @description: 在浏览器本地存储 存储token
   * @param {*} passportValue //后端接口获取到的passpot 类似于token
   * @return {*} void
   */
  const setPassport = async (passportValue) => {
    if (!passportValue) {
      return;
    }

    passport.value = passportValue;
    localStorage.setItem('passport', passportValue);
    console.log('记录passport');
  };

  /**
   * @description: 退出登录 清除User  passport(token) 以及登录后的信息
   * @return {*}
   */
  const logout = async () => {
    console.log('退出登录');
    localStorage.removeItem('passport');
    passport.value = '';
    user.value = null;
    credits.value = 0;
    subscribedUser.value = false;
  };

  /**
   * @description: 初始化 google 右上角快捷键登录   用户初始化状态没登录情况下调用
   * @return {*}
   */
  const initGoogleQuickLogin = async () => {
    const handleCredentialResponse = (response) => {
      if (!response || !response.credential) return;
      console.log(response, 'response');
      // 解析JWT
      const idToken = response.credential;
      const base64Url = idToken.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join('')
      );
      const payload = JSON.parse(jsonPayload);

      // 获取用户的Google UID
      const googleUid = payload.sub; // 'sub' 字段通常是用户的Google ID
      login.loginGoogle(response.credential, googleUid).then(
        (res) => {
          console.log('loginGoogle', res);
          if (res.ok === 0) {
            setPassport(res.data.passport);
            getUser(res.data.passport).then((user) => {
              if (user.value.id) {
                emits('loginSuccess', '1');
              }
            });
          }
        },
        (error) => {
          console.log('loginGoogle', error);
          // 提示登录出错
        }
      );
    };

    function addGoogleAccountsScript(params) {
      if (typeof google !== 'undefined') {
        google.accounts.id.initialize({
          client_id: '704677828444-ihbv6faprun043f3iuponnrctutdssgj.apps.googleusercontent.com',
          callback: handleCredentialResponse,
        });
        google.accounts.id.prompt();
      }
    }
    addGoogleAccountsScript();
  };

  return {
    user,
    subscribedUser,
    credits,
    jwt,
    getUser,
    setPassport,
    logout,
    initGoogleQuickLogin,
  };
});
