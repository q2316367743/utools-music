export interface PluginSubscribe {
  id: number;
  name: string;
  url: string;
}

export function buildPluginSubscribe(): PluginSubscribe {
  return {
    id: Date.now(),
    name: '',
    url: ''
  }
}