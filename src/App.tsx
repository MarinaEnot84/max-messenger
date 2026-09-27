import { useState } from 'react';
import { Box, Flex } from '@chakra-ui/react';
import LoginForm from './components/LoginForm';
import PhoneForm from './components/PhoneForm';
import ChatWindow from './components/ChatWindow';
import { maxApi } from './api/maxApi';
import type { Credentials } from './types';

type Stage = 'login' | 'phone' | 'chat';

function phoneToChatId(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (!digits) throw new Error('Некорректный номер');
  return `${digits}@c.us`;
}

export default function App() {
  const [stage, setStage] = useState<Stage>('login');
  const [creds, setCreds] = useState<Credentials | null>(null);
  const [chatId, setChatId] = useState<string | null>(null);

  const handleLogin = async (credentials: Credentials): Promise<void> => {
    setCreds(credentials);
    setStage('phone');
  };

  const handleCreateChat = async (phone: string): Promise<void> => {
    if (!creds) return;
    try {
      const cid = phoneToChatId(phone);
      maxApi.setCredentials(creds.idInstance, creds.apiTokenInstance, cid);
      await maxApi.getMessages();
      setChatId(cid);
      setStage('chat');
    } catch (err) {
      alert('Не удалось создать чат: ' + (err as Error).message);
    }
  };

  const handleLogout = (): void => {
    maxApi.stopPolling();
    setStage('login');
    setCreds(null);
    setChatId(null);
  };

  return (
    <Flex minH="100vh" align="center" justify="center" p={4}>
      <Box w="100%" maxW="480px" bg="white" borderRadius="xl" boxShadow="lg" overflow="hidden">
        {stage === 'login' && <LoginForm onLogin={handleLogin} />}
        {stage === 'phone' && <PhoneForm onCreateChat={handleCreateChat} onBack={handleLogout} />}
        {stage === 'chat' && chatId && <ChatWindow chatId={chatId} onLogout={handleLogout} />}
      </Box>
    </Flex>
  );
}
