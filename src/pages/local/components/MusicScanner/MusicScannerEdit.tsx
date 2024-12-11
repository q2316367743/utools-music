import {buildRepository, Repository, RepositoryFileNameRuleEnum} from "@/entity/Repository";
import {DialogPlugin, Form, FormItem, Input, Radio, RadioGroup, Switch} from "tdesign-vue-next";
import FolderInput from "@/components/FolderInput/FolderInput.vue";
import {isEmptyString} from "@/utils/lang/StringUtil";
import MessageUtil from "@/utils/modal/MessageUtil";
import {MusicItemSourceEnum} from "@/entity/MusicItemSourceEnum";
import {clone} from "radash";

function renderContent(form: Ref<Repository>) {
  return () => <Form layout="vertical">
    <FormItem label={'仓库类型'} help={form.value.type !== MusicItemSourceEnum.LOCAL ? '实验性功能' : ''}>
      <RadioGroup v-model={form.value.type}>
        <Radio label={'本地'} value={MusicItemSourceEnum.LOCAL}></Radio>
        <Radio label={'WebDAV'} value={MusicItemSourceEnum.WEBDAV}></Radio>
        <Radio label={'AList'} value={MusicItemSourceEnum.A_LIST}></Radio>
      </RadioGroup>
    </FormItem>
    <FormItem label={'文件命名规则'}>
      <RadioGroup v-model={form.value.fileNameRule}>
        <Radio label={'歌手-歌名（默认）'} value={RepositoryFileNameRuleEnum.ARTIST_NAME}></Radio>
        <Radio label={'歌名-歌手'} value={RepositoryFileNameRuleEnum.NAME_ARTIST}></Radio>
        <Radio label={'歌名'} value={RepositoryFileNameRuleEnum.NAME}></Radio>
      </RadioGroup>
    </FormItem>

    {form.value.type === MusicItemSourceEnum.LOCAL && <FormItem label={'文件路径'} name={'path'}>
        <FolderInput v-model={form.value.path}/>
    </FormItem>}
    {(form.value.type === MusicItemSourceEnum.WEBDAV || form.value.type === MusicItemSourceEnum.A_LIST) && <>
        <FormItem label={'绑定当前设备'} name={'isNative'} help={'如果绑定当前设备，只有当前设备可以访问音乐内容'}>
            <Switch v-model={form.value.isNative}/>
        </FormItem>
        <FormItem label={'服务器名'} name={'name'}>
            <Input v-model={form.value.name} clearable={true}></Input>
        </FormItem>
        <FormItem label={'服务器地址'} name={'url'}>
            <Input v-model={form.value.url} clearable={true}></Input>
        </FormItem>
        <FormItem label={'文件路径'} name={'path'}>
            <Input v-model={form.value.path} clearable={true}></Input>
        </FormItem>
      {form.value.type === MusicItemSourceEnum.WEBDAV ?
        <>
          <FormItem label={'用户名'} name={'username'}>
            <Input v-model={form.value.username} clearable={true}></Input>
          </FormItem>
          <FormItem label={'密码'} name={'password'}>
            <Input v-model={form.value.password} clearable={true}></Input>
          </FormItem>
        </> :
        <>
          <FormItem label={'秘钥'} name={'username'}>
            <Input v-model={form.value.username} clearable={true}></Input>
          </FormItem>
          <FormItem label={'文件夹密码'} name={'password'} help={'如果文件夹没有密码，可不填'}>
            <Input v-model={form.value.password} clearable={true}></Input>
          </FormItem>
        </>}
    </>}
  </Form>
}


export function editRepository(res?: Repository) {
  return new Promise<Repository>(resolve => {
    const form = ref(res ? clone(res) : buildRepository());
    const instance = DialogPlugin({
      header: (res ? '编辑' : '修改') + '编辑文件夹',
      default: renderContent(form),
      confirmBtn: {
        default: res ? '编辑' : '保存'
      },
      width: 600,
      top: '5vh',
      onConfirm() {
        if (form.value.type === MusicItemSourceEnum.LOCAL) {
          // 本地
          if (isEmptyString(form.value.path)) {
            MessageUtil.error("请输入文件夹目录")
            return;
          }
          form.value.name = form.value.path;
        } else if (form.value.type === MusicItemSourceEnum.WEBDAV) {
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
    });
  })
}
