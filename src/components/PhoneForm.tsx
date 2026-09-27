import { useState, type FormEvent } from 'react';
import { VStack, Input, Button, Heading, HStack, Field } from '@chakra-ui/react';
import { toaster } from './ui/toaster';

interface PhoneFormProps {
  onCreateChat: (phone: string) => void | Promise<void>;
  onBack: () => void;
}

export default function PhoneForm({ onCreateChat, onBack }: PhoneFormProps) {
  const [phone, setPhone] = useState('');

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 10) {
      toaster.create({ title: 'Введите корректный номер', type: 'warning' });
      return;
    }
    void onCreateChat(phone);
  };

  return (
    <form onSubmit={handleSubmit}>
      <VStack gap={4} p={8}>
        <Heading size="md" color="brand.600">
          Новый чат
        </Heading>

        <Field.Root required>
          <Field.Label>Номер телефона получателя</Field.Label>
          <Input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+7 999 123-45-67"
          />
        </Field.Root>

        <HStack w="full" gap={2}>
          <Button variant="outline" onClick={onBack} flex={1}>
            Назад
          </Button>
          <Button type="submit" colorScheme="blue" flex={2}>
            Создать чат
          </Button>
        </HStack>
      </VStack>
    </form>
  );
}
