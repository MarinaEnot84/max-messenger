export interface Credentials {
  idInstance: string;
  apiTokenInstance: string;
}

export type MessageSide = 'me' | 'them';

export interface Message {
  id: string | number;
  text: string;
  from: MessageSide;
  timestamp: string;
}

export interface RawMessage {
  idMessage?: string;
  textMessage?: string;
  typeMessage?: string;
  timestamp?: number;
  type?: 'incoming' | 'outgoing';
  senderId?: string;
  chatId?: string;
}
