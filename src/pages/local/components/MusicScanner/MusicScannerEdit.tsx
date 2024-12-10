import {buildRepository, Repository, RepositoryType} from "@/entity/Repository";
import {DialogPlugin, Form, FormItem, Input, Radio, RadioGroup} from "tdesign-vue-next";
import FolderInput from "@/components/FolderInput/FolderInput.vue";
import {isEmptyString} from "@/utils/lang/StringUtil";
import MessageUtil from "@/utils/modal/MessageUtil";


function renderContent(form: Ref<Repository>) {
  return () => <Form layout="vertical">
    <FormItem label={'仓库类型'} help={form.value.type === RepositoryType.WEBDAV ? '实验性功能' : ''}>
      <RadioGroup v-model={form.value.type}>
        <Radio label={'本地'} value={RepositoryType.LOCAL}></Radio>
        <Radio label={'WebDAV'} value={RepositoryType.WEBDAV}></Radio>
      </RadioGroup>
    </FormItem>

    {form.value.type === RepositoryType.LOCAL && <FormItem label={'文件路径'} name={'path'}>
        <FolderInput v-model={form.value.path}/>
    </FormItem>}
    {form.value.type === RepositoryType.WEBDAV && <>
        <FormItem label={'服务器名'} name={'name'}>
            <Input v-model={form.value.name} clearable={true}></Input>
        </FormItem>
        <FormItem label={'服务器地址'} name={'url'}>
            <Input v-model={form.value.url} clearable={true}></Input>
        </FormItem>
        <FormItem label={'文件路径'} name={'path'}>
            <Input v-model={form.value.path} clearable={true}></Input>
        </FormItem>
        <FormItem label={'用户名'} name={'username'}>
            <Input v-model={form.value.username} clearable={true}></Input>
        </FormItem>
        <FormItem label={'密码'} name={'password'}>
            <Input v-model={form.value.password} clearable={true}></Input>
        </FormItem>
    </>}
  </Form>
}

export function addRepository() {
  return new Promise<Repository>(resolve => {
    const form = ref(buildRepository());
    const instance = DialogPlugin({
      header: '新增文件夹',
      default: renderContent(form),
      confirmBtn: {
        default: '新增'
      },
      onConfirm() {
        if (form.value.type === RepositoryType.LOCAL) {
          // 本地
          if (isEmptyString(form.value.path)) {
            MessageUtil.error("请输入文件夹目录")
            return;
          }
          form.value.name = form.value.path;
        } else if (form.value.type === RepositoryType.WEBDAV) {
          if (isEmptyString(form.value.path)) {
            MessageUtil.error("请输入文件夹目录")
            return;
          }
          if (isEmptyString(form.value.url)) {
            MessageUtil.error("请输入服务器地址")
            return;
          }
        }
        resolve(form.value);
        instance.destroy();
      },
      top: '8vh'
    });
  })
}
