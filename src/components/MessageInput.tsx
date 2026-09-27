import { useState, type FormEvent } from 'react';
import { HStack, Input, IconButton } from '@chakra-ui/react';
import { FiSend } from 'react-icons/fi';

interface MessageInputProps {
  onSend: (text: string) => void | Promise<void>;
}

export default function MessageInput({ onSend }: MessageInputProps) {
  const [text, setText] = useState<string>('');

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (!text.trim()) return;
    void onSend(text.trim());
    setText('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <HStack p={3} gap={2} bg="white" borderTop="1px solid" borderColor="gray.200">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Введите сообщение..."
          size="md"
          borderRadius="full"
          bg="gray.100"
          _focus={{ bg: 'white' }}
        />
        <IconButton type="submit" colorScheme="blue" borderRadius="full" aria-label="Отправить">
          <FiSend />
        </IconButton>
      </HStack>
    </form>
  );
}
