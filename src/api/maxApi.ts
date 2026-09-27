import type { RawMessage } from '../types';

const BASE_URL = '/api';

const MESSAGE_TYPES = new Set<string>(['incomingMessageReceived', 'outgoingMessageReceived']);

class MaxApiClient {
  private idInstance: string | null = null;
  private apiTokenInstance: string | null = null;
  private chatId: string | null = null;

  private notifyInterval: ReturnType<typeof setInterval> | null = null;

  private lastHistoryAt = 0;
  private historyBackoff = 0;

  private lastReceiptId: number | string | null = null;

  setCredentials(idInstance: string, apiTokenInstance: string, chatId: string): void {
    this.idInstance = idInstance;
    this.apiTokenInstance = apiTokenInstance;
    this.chatId = chatId;
  }

  private ensureReady(): void {
    if (!this.idInstance || !this.apiTokenInstance || !this.chatId) {
      throw new Error('Не заданы учётные данные или chatId');
    }
  }

  async sendMessage(text: string): Promise<void> {
    this.ensureReady();
    const url = `${BASE_URL}/waInstance${this.idInstance}/sendMessage/${this.apiTokenInstance}`;

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatId: this.chatId, message: text }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Ошибка отправки: ${res.status} ${err}`);
    }
  }

  async getMessages(force = false): Promise<RawMessage[]> {
    if (!this.idInstance || !this.apiTokenInstance || !this.chatId) return [];

    const now = Date.now();
    const minInterval = 60_000 + this.historyBackoff;
    if (!force && now - this.lastHistoryAt < minInterval) {
      return [];
    }

    const url = `${BASE_URL}/waInstance${this.idInstance}/getChatHistory/${this.apiTokenInstance}`;

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId: this.chatId, count: 50 }),
      });

      if (res.status === 429) {
        this.historyBackoff = Math.min(
          this.historyBackoff === 0 ? 30_000 : this.historyBackoff * 2,
          600_000
        );
        console.warn(
          `getChatHistory: 429, следующая попытка не раньше чем через ${this.historyBackoff / 1000} с`
        );
        return [];
      }

      this.historyBackoff = 0;
      this.lastHistoryAt = now;

      if (!res.ok) {
        console.error('Ошибка получения истории:', res.status);
        return [];
      }

      const data = await res.json();
      return ((data as RawMessage[]) ?? []).reverse();
    } catch (err) {
      console.warn('getChatHistory: сеть недоступна', err);
      return [];
    }
  }

  async getNewMessages(): Promise<RawMessage[]> {
    if (!this.idInstance || !this.apiTokenInstance) return [];

    const url = `${BASE_URL}/waInstance${this.idInstance}/receiveNotification/${this.apiTokenInstance}`;

    let res: Response;
    try {
      res = await fetch(url);
    } catch (err) {
      console.warn('receiveNotification: сеть недоступна', err);
      return [];
    }
    if (!res.ok) return [];

    const data = await res.json();
    if (!data || !data.receiptId || !data.body) return [];

    if (this.lastReceiptId === data.receiptId) {
      return [];
    }

    this.lastReceiptId = data.receiptId;

    try {
      await fetch(
        `${BASE_URL}/waInstance${this.idInstance}/deleteNotification/${this.apiTokenInstance}/${data.receiptId}`,
        { method: 'DELETE' }
      );
    } catch (err) {
      console.warn('deleteNotification упал:', err);
    }

    const body = data.body;
    if (!MESSAGE_TYPES.has(body.typeWebhook)) return [];

    const messageData = body.messageData;
    if (!messageData) return [];

    const text =
      messageData.textMessageData?.textMessage ?? messageData.extendedTextMessageData?.text ?? '';
    if (!text) return [];

    return [
      {
        idMessage: body.idMessage,
        textMessage: text,
        timestamp: body.timestamp,
        type: body.typeWebhook === 'outgoingMessageReceived' ? 'outgoing' : 'incoming',
        senderId: body.senderData?.sender,
        chatId: body.senderData?.chatId,
      } as RawMessage,
    ];
  }

  async drainNotifications(): Promise<RawMessage[]> {
    const all: RawMessage[] = [];

    for (let i = 0; i < 5; i++) {
      const batch = await this.getNewMessages();
      if (batch.length === 0) break;
      all.push(...batch);
    }

    return all;
  }

  startPolling(onUpdate: (messages: RawMessage[]) => void): void {
    this.stopPolling();

    this.notifyInterval = setInterval(async () => {
      try {
        const messages = await this.drainNotifications();
        if (messages.length) onUpdate(messages);
      } catch (err) {
        console.warn('Polling (notifications) error:', err);
      }
    }, 1500);
  }

  stopPolling(): void {
    if (this.notifyInterval) {
      clearInterval(this.notifyInterval);
      this.notifyInterval = null;
    }
  }
}

export const maxApi = new MaxApiClient();
