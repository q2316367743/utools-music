import {usePluginStore} from "@/store/module/PluginStore";
import {readFileAsString} from "@/utils/file/FileUtil";

export async function installFromUrl(url: string) {
  const rsp = await fetch(url, {
    method: 'GET'
  });
  const text = await rsp.text();
  if (text) {
    await usePluginStore().installPlugin(text);
  }
}

export async function installFromLocal() {
  const paths = utools.showOpenDialog({
    title: '选择插件文件',
    buttonLabel: '安装',
    filters: [{
      name: 'JavaScript文件',
      extensions: ['js', 'javascript']
    }]
  });
  if (!paths || !paths[0]) {
    return false;
  }
  const content = await readFileAsString(paths[0]);
  if (content) {
    await usePluginStore().installPlugin(content);
    return true;
  } else {
    return Promise.reject(new Error("文件内容不存在"));
  }
}
