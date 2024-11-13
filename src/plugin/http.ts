import axios, {AxiosRequestConfig, AxiosProxyConfig} from "axios";
import {globalSetting} from "@/store";
import {isNotEmptyString} from "@/utils/lang/StringUtil";


export function getAxiosInstance() {
  const config: AxiosRequestConfig = {
    timeout: 15000
  }
  const setting = toRaw(globalSetting.value);
  if (setting.proxyEnabled) {
    const proxy: AxiosProxyConfig = {
      host: setting.proxyHost,
      port: setting.proxyPort,
    }
    if (isNotEmptyString(setting.proxyUser) || isNotEmptyString(setting.proxyPassword)) {
      proxy['auth'] = {
        username: setting.proxyUser,
        password: setting.proxyPassword,
      }
    }
    config['proxy'] = proxy;
  }

  // 此处处理代理问题
  return axios.create(config);
}

export async function getForText(url: string): Promise<string> {
  const rsp = await getAxiosInstance().get<string>(url, {
    responseType: 'text',
  });

  return rsp.data;
}

export async function getForJSON<T>(url: string): Promise<T> {
  const rsp = await getAxiosInstance().get<T>(url, {
    responseType: 'json',
  })
  return rsp.data;
}