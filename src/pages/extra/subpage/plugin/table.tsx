import {
  DialogPlugin,
  Form,
  FormItem,
  Input,
} from "tdesign-vue-next";
import {usePluginStore} from "@/store";
import MessageUtil from "@/utils/modal/MessageUtil";

export async function setUserVar(id: number) {
  const {getInstance, getPluginVar, setPluginVar} = usePluginStore();
  const instance = getInstance(id);
  const {userVariables} = instance;
  if (!userVariables) {
    return Promise.reject(new Error("此插件不需要设置变量"));
  }
  const res = await getPluginVar(id);
  console.log(id, res);
  const data = ref(res);
  const loading = ref(false);

  const dialogInstance = DialogPlugin({
    header: '设置变量',
    confirmBtn: {
      default: '保存',
      loading: loading.value
    },
    top: '10vh',
    default: () => <Form labelAlign={'top'}>
      {userVariables.map(uv => <FormItem label={uv.name}>
        <Input v-model={data.value[uv.key]} clearable={true} disabled={loading.value}></Input>
      </FormItem>)}
    </Form>,
    onConfirm: () => {
      loading.value = true;
      console.log(id, data.value);
      setPluginVar(id, data.value)
        .then(() => {
          MessageUtil.success("保存成功");
          dialogInstance.destroy();
        })
        .catch(e => MessageUtil.error("保存", e))
        .finally(() => loading.value = false);
    }
  });
}