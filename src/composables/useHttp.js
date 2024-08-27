/*
 * @Author: liu 2322312693@qq.com
 * @Date: 2024-07-31 17:31:56
 * @LastEditors: liu 2322312693@qq.com
 * @LastEditTime: 2024-08-27 18:44:39
 * @FilePath: /baby_face_generator/composables/useHttp.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { useUserStore } from '../store/useUser';



let store;


const fetch = $fetch.create({
  onRequest({ options }) {
    if(!store){
      store=userStore();
    }
    const contentType = options?.headers?.['Content-Type'] || options?.headers?.['content-type'];
    if (contentType === 'application/x-www-form-urlencoded; charset=UTF-8'&&options.body) {
      // 将 body 转换为 URL 编码的字符串
      options.body = Object.keys(options.body)
        .map((key) => encodeURIComponent(key) + '=' + encodeURIComponent(options.body[key]))
        .join('&');
    }

    options.headers = {
      ...options.headers,
    };
  },
  onResponse({ response }) {
    const { url, status, _data } = response;
    if (status !== 200) {
      return Promise.reject(_data);
    }

    if (url.includes('emaillogin') || url.includes('emailsignup') || url.includes('user/status')) {
      if (_data.ok !== 0) {
        return Promise.reject(_data);
      }
    }

    return response._data;
  },
});

export const useHttp = {
  get: (url, params, headers) => {
    return fetch(url, { method: 'get', params, headers });
  },

  post: (url, body, headers) => {
    return fetch(url, { method: 'post', body, headers });
  },

  put: (url, body, headers) => {
    return fetch(url, { method: 'put', body, headers });
  },

  delete: (url, body, headers) => {
    return fetch(url, { method: 'delete', body, headers });
  },
};
