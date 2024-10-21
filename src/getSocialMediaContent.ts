import OpenAI from 'openai';
import 'dotenv/config';
import type { Recipe } from './cms';

const openai = new OpenAI({});

export const getSocialMediaContent = async ({
  completionContent,
  recipe,
}: {
  completionContent: string;
  recipe: Recipe;
}): Promise<{
  post?: string;
}> => {
  const recipeContent = [
    `Nome da receita: ${recipe.nome}`,
    `Receita: ${recipe.receita}`,
  ].join('\n');

  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: completionContent,
      },
      { role: 'user', content: recipeContent },
    ],
    model: 'gpt-4o',
    response_format: { type: 'json_object' },
    n: 1,
    temperature: 0.3,
  });

  return JSON.parse(completion.choices[0].message.content || '{}');
};
