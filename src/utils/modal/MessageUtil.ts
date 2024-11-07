import Optional from "@/utils/lang/Optional";
import {MessagePlugin} from "tdesign-vue-next";

function render(message: string, e?: any) {
  if (typeof e === 'string') {
    return Optional.ofNullable(e).map(e => `${message}，${e}`).orElse(message)
  } else {
    return Optional.ofNullable(e).map(e => `${message}，${e}`).orElse(message)
  }
}

function success(message: any): void;
function success(message: any, callback: () => void): void;
function success(message: any, callback?: () => void): void {
  MessagePlugin.success({
    closeBtn: true,
    content: typeof message === 'string' ? message : JSON.stringify(message)
  });
  callback && callback();
}


function warning(message: string, e?: any): void {
  MessagePlugin.warning({
    closeBtn: true,
    content: render(message, e)
  });
  console.error(message, e);
}

function error(message: string): void;
function error(message: string, e: any): void;
function error(message: string, e: any, callback: () => void): void;
function error(message: string, e?: any, callback?: () => void): void {
  MessagePlugin.error({
    closeBtn: true,
    content: render(message, e)
  });
  console.error(message, e);
  callback && callback();
}

export default {

  success,
  info(message: any) {
    MessagePlugin.info({
      closeBtn: true,
      content: typeof message === 'string' ? message : JSON.stringify(message)
    });
  },
  warning,
  error
}
