import { useState, type FormEvent } from 'react';
import { VStack, Input, Button, Heading, Field } from '@chakra-ui/react';
import { toaster } from './ui/toaster';
import type { Credentials } from '../types';

interface LoginFormProps {
  onLogin: (creds: Credentials) => void | Promise<void>;
}

export default function LoginForm({ onLogin }: LoginFormProps) {
  const [idInstance, setIdInstance] = useState('');
  const [apiTokenInstance, setApiTokenInstance] = useState('');

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (!idInstance || !apiTokenInstance) {
      toaster.create({ title: 'Заполните оба поля', type: 'warning' });
      return;
    }
    void onLogin({ idInstance, apiTokenInstance });
  };

  return (
    <form onSubmit={handleSubmit}>
      <VStack gap={4} p={8}>
        <Heading size="md" color="brand.600">
          Вход в MAX
        </Heading>

        <Field.Root required>
          <Field.Label>idInstance</Field.Label>
          <Input
            value={idInstance}
            onChange={(e) => setIdInstance(e.target.value)}
            placeholder="Например, 1101000001"
          />
        </Field.Root>

        <Field.Root required>
          <Field.Label>apiTokenInstance</Field.Label>
          <Input
            type="password"
            value={apiTokenInstance}
            onChange={(e) => setApiTokenInstance(e.target.value)}
            placeholder="Токен инстанса"
          />
        </Field.Root>

        <Button type="submit" colorScheme="blue" w="full">
          Далее
        </Button>
      </VStack>
    </form>
  );
}
