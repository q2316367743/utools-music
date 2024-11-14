import {DialogPlugin, Input, Paragraph} from "tdesign-vue-next";

export default {

  prompt(content: string, title?: string, config?: {
    confirmButtonText?: string,
    cancelButtonText?: string,
    inputPattern?: RegExp,
    inputErrorMessage?: string,
    inputValue?: string,
    onClose?: () => void
  }): Promise<string> {
    const {
      inputValue = '',
      confirmButtonText = '确认',
      cancelButtonText = '取消',
      onClose
    } = config || {};
    return new Promise<string>(resolve => {
      let value = ref(inputValue);

      function onKeydown(value: string | number) {
        resolve(`${value}`);
        res.destroy();
      }

      const res = DialogPlugin({
        default: () => <div>
          <Paragraph>{content}</Paragraph>
          <Input autofocus={true} v-model={value.value} clearable onEnter={onKeydown}></Input>
        </div>,
        header: title,
        draggable: true,
        confirmBtn: {
          default: confirmButtonText,
        },
        cancelBtn: {
          default: cancelButtonText
        },
        onConfirm: () => {
          resolve(value.value);
          res.destroy();
        },
        onCancel() {
          res.destroy();
        },
        onClose() {
          res.destroy();
          onClose && onClose()
        }
      })
    })
  },
  alert(content: string, title?: string, config?: {
    confirmButtonText?: string,
    cancelButtonText?: string,
  }) {
    const {
      confirmButtonText = '确认',
      cancelButtonText = '取消',
    } = config || {};
    return new Promise<void>(resolve => {

      const res = DialogPlugin({
        default: () => <Paragraph>{content}</Paragraph>,
        header: title,
        draggable: true,
        confirmBtn: {
          default: confirmButtonText,
        },
        cancelBtn: {
          default: cancelButtonText
        },
        onConfirm: () => {
          resolve();
          res.destroy();
        },
        onCancel() {
          res.destroy();
        },
        onClose() {
          res.destroy();
        }
      })
    })
  }
}

