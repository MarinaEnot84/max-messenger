import { VStack, Box, Text } from '@chakra-ui/react';
import type { RefObject } from 'react';
import type { Message } from '../types';

interface MessageListProps {
  messages: Message[];
  bottomRef: RefObject<HTMLDivElement | null>;
}

export default function MessageList({ messages, bottomRef }: MessageListProps) {
  return (
    <VStack gap={2} align="stretch">
      {messages.map((msg, idx) => {
        const isMe = msg.from === 'me';
        return (
          <Box
            key={`${msg.id}-${idx}`}
            alignSelf={isMe ? 'flex-end' : 'flex-start'}
            bg={isMe ? '#dcf8c6' : 'white'}
            px={3}
            py={2}
            borderRadius="lg"
            maxW="80%"
            boxShadow="sm"
          >
            <Text fontSize="sm">{msg.text}</Text>
            <Text fontSize="xs" color="gray.500" textAlign="right" mt={1}>
              {new Date(msg.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </Box>
        );
      })}
      <div ref={bottomRef} />
    </VStack>
  );
}
