import { useEffect, useRef, useState } from 'react';
import { VStack, HStack, Text, IconButton, Box, Spinner, Center } from '@chakra-ui/react';
import { FiX } from 'react-icons/fi';
import { maxApi } from '../api/maxApi';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { toaster } from './ui/toaster';
import type { Message, RawMessage } from '../types';

interface ChatWindowProps {
  chatId: string;
  onLogout: () => void;
}

function toMessage(raw: RawMessage): Message {
  return {
    id: raw.idMessage ?? `local-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    text: raw.textMessage ?? '',
    from: raw.type === 'outgoing' || raw.typeMessage === 'outgoing' ? 'me' : 'them',
    timestamp: new Date((raw.timestamp ?? Date.now() / 1000) * 1000).toISOString(),
  };
}

export default function ChatWindow({ chatId, onLogout }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;
    maxApi
      .getMessages()
      .then((history) => {
        if (!mounted) return;
        setMessages(history.map(toMessage));
      })
      .catch((err) => console.error('Ошибка истории:', err))
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [chatId]);

  useEffect(() => {
    maxApi.startPolling((newMsgs) => {
      const mapped = newMsgs.map(toMessage);
      setMessages((prev) => {
        const existingIds = new Set(prev.map((m) => m.id));
        const fresh = mapped.filter((m) => !existingIds.has(m.id));
        if (!fresh.length) return prev;
        return [...prev, ...fresh];
      });
    });
    return () => maxApi.stopPolling();
  }, [chatId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (text: string): Promise<void> => {
    const localMsg: Message = {
      id: `local-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      text,
      from: 'me',
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, localMsg]);
    try {
      await maxApi.sendMessage(text);
    } catch (err) {
      toaster.create({
        title: 'Сообщение не отправлено',
        description: (err as Error).message,
        type: 'error',
      });
      setMessages((prev) => prev.filter((m) => m.id !== localMsg.id));
    }
  };

  return (
    <VStack h="600px" gap={0} align="stretch">
      <HStack bg="brand.600" color="white" px={4} py={3} justify="space-between">
        <Text fontWeight="bold">Чат</Text>
        <IconButton size="sm" variant="ghost" color="white" onClick={onLogout} aria-label="Выйти">
          <FiX />
        </IconButton>
      </HStack>

      <Box flex={1} overflowY="auto" px={4} py={2} bg="#e5ddd5">
        {loading ? (
          <Center h="100%">
            <Spinner />
          </Center>
        ) : messages.length === 0 ? (
          <Center h="100%">
            <Text color="gray.500" fontSize="sm">
              Нет сообщений. Напишите первым.
            </Text>
          </Center>
        ) : (
          <MessageList messages={messages} bottomRef={bottomRef} />
        )}
      </Box>

      <MessageInput onSend={handleSend} />
    </VStack>
  );
}
