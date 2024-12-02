import {AxiosRequestConfig, AxiosProxyConfig, AxiosInstance} from "axios";
import {globalSetting} from "@/store";
import {isNotEmptyString} from "@/utils/lang/StringUtil";
import {stringToBase64} from "@/utils/file/CovertUtil";


export function getAxiosInstance(): AxiosInstance {
  const config: AxiosRequestConfig = {
    timeout: 15000,
    adapter: 'http',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.0.0',
    }
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
  const i = window.preload.lib.axios.create(config);
  // @ts-ignore
  i.default = i;

  (i as AxiosInstance).interceptors.request.use(c => {
    console.log("请求：", c.url)
    return c;
  });
  return i
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

export async function headForExist(url: string): Promise<boolean> {
  const u = new URL(url);
  const str = u.origin + u.pathname + u.search;
  let headers = undefined;
  if (u.username || u.password) {
    headers = {
      Authorization: stringToBase64(`${u.username}:${u.password}`),
    }
  }
  try {
    await getAxiosInstance().head(str, {
      headers
    });
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
}