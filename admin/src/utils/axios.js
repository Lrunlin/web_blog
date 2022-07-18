import axios from "axios";
axios.defaults.baseURL =
  process.env.NODE_ENV == "development" ? "http://localhost:3000" : "https://blogweb.cn/api";
axios.interceptors.request.use(
  function (config) {
    config.headers.authorization = localStorage.token;
    config.headers.isAdmin = true;
    config.headers['Cache-Control'] = 'no-cache';
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);