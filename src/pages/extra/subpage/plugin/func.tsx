import {usePluginStore} from "@/store";
import {readFileAsString} from "@/utils/file/FileUtil";
import {getForText} from "@/plugin/http";
import {isEmptyArray} from "@/utils/lang/FieldUtil";

export async function installFromUrl(url: string) {
  const text = await getForText(url);
  if (text) {
    await usePluginStore().installPlugin(text, url);
  } else {
    return Promise.reject(new Error("插件地址内容不存在"))
  }
}

export async function installFromLocal() {
  const paths = utools.showOpenDialog({
    title: '选择插件文件',
    buttonLabel: '安装',
    filters: [{
      name: 'JavaScript文件',
      extensions: ['js', 'javascript']
    }],
    properties: ['multiSelections']
  });
  if (!paths || isEmptyArray(paths)) {
    return false;
  }
  for (const path of paths) {
    const content = await readFileAsString(path);
    if (content) {
      await usePluginStore().installPlugin(content);
    }
  }
  return true;
}
