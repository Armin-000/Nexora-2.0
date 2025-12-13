// src/hooks/useChat.ts
import { useState, useCallback } from 'react';
import { Message, Role, OllamaChunk } from '../types';

const MODEL_NAME = 'llama3.2:3b';

const SYSTEM_PROMPT = [
  'You are Nexora, a precise and friendly coding assistant.',
  'Always answer in Croatian when possible, unless the user asks for another language.',
  'Give clear and concise explanations, without unnecessary repetition.',
  'When you show code, use Markdown code blocks (```lang ... ```), and briefly explain what the code does.',
  'If the user question is unclear, ask one short follow-up question.',
  'If you are not sure about something, say so and explain the most likely options instead of inventing facts.',
].join('\n');

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [abortController, setAbortController] =
    useState<AbortController | null>(null);

  const handleSend = useCallback(
    async (input: string) => {
      const trimmed = input.trim();
      if (!trimmed || isLoading) return;

      setError(null);

      const userMsgId = Date.now();
      const assistantId = userMsgId + 1;

      const userMsg: Message = {
        id: userMsgId,
        role: 'user',
        content: trimmed,
      };

      const baseMessages = [...messages, userMsg];

      setMessages([
        ...baseMessages,
        { id: assistantId, role: 'assistant', content: '' },
      ]);

      const controller = new AbortController();
      setAbortController(controller);
      setIsLoading(true);

      try {
        const payload = {
          model: MODEL_NAME,
          stream: true,
          messages: [
            { role: 'system' as Role, content: SYSTEM_PROMPT },
            ...baseMessages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
          ],
        };

        const res = await fetch('http://localhost:11434/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error(
            `Greška na serveru: ${res.status} ${res.statusText}`,
          );
        }

        const reader = res.body?.getReader();
        if (!reader) {
          throw new Error('Browser ne podržava stream čitanje odgovora.');
        }

        const decoder = new TextDecoder();
        let doneStreaming = false;

        while (!doneStreaming) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk
            .split('\n')
            .filter((l) => l.trim().length > 0);

          for (const line of lines) {
            let data: OllamaChunk;
            try {
              data = JSON.parse(line);
            } catch {
              continue;
            }

            const token: string = data?.message?.content ?? '';
            const isDone: boolean = data?.done ?? false;

            if (token) {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? { ...m, content: m.content + token }
                    : m,
                ),
              );
            }

            if (isDone) {
              doneStreaming = true;
              break;
            }
          }
        }
      } catch (err: any) {
        if (err?.name !== 'AbortError') {
          console.error(err);
          setError(
            err?.message ??
              'Dogodila se greška pri spajanju na Ollama API. Je li Ollama pokrenut?',
          );
        }
      } finally {
        setIsLoading(false);
        setAbortController(null);
      }
    },
    [messages, isLoading],
  );

  const handleStop = useCallback(() => {
    if (abortController) {
      abortController.abort();
    }
  }, [abortController]);

  return {
    modelName: MODEL_NAME,
    messages,
    isLoading,
    error,
    handleSend,
    handleStop,
  };
}
