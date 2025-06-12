// interfaces/bot.interface.ts
export interface Bot {
  id: string;
  name: string;
  status: string;
  createdOn: string;
  created_By: string;
  invoked: number;
  completed: number;
  dropped: number;
  Channel: string;
  botDescription?: string;
  botTimeout?: string;
  dropOfMessage?: string;
  advanceAction?: {
    selected: Array<{ name: string; value: string }>;
  };
}

export interface AdvanceAction {
  name: string;
  value: string;
  children?: any[];
  multiSelect?: boolean;
}

export interface FilterOption {
  value: number;
  label: string;
  checked: boolean;
}

export interface ChannelOption {
  value: number;
  label: string;
  connected_id: string;
  channel_status?: string;
  checked: boolean;
}