import { type Recipe } from './cms';
import OpenAI from 'openai';

const openai = new OpenAI();

const getSeoMetadata = async ({
  completionContent,
  recipeContent,
  currentDescriptionContent,
}: {
  completionContent: string;
  recipeContent: string;
  currentDescriptionContent?: string;
}) => {
  const messages: Array<OpenAI.ChatCompletionMessageParam> = [
    {
      role: 'system',
      content: completionContent,
    },
    { role: 'user', content: recipeContent },
  ];

  if (currentDescriptionContent) {
    messages.push({ role: 'user', content: currentDescriptionContent });
  }

  const completion = await openai.chat.completions.create({
    messages,
    model: 'gpt-4o',
    response_format: { type: 'json_object' },
    n: 1,
    temperature: 0.5,
  });

  return JSON.parse(completion.choices[0].message.content || '{}');
};

export const getRecipeSeoMetadata = async (recipe: Recipe) => {
  const completionContent = `Você é um especialista em SEO com a missão de otimizar uma página de receitas para alcançar a primeira posição nos resultados de pesquisa do Google.
  Seu objetivo é criar uma descrição envolvente, palavras-chave relevantes e meta descrição para os motores de busca.

  Caso seja fornecida a descrição atual da receita, você deve deixar diferente da atual porque o Google não está exibindo a descrição atual nos resultados de pesquisa.

  Instruções:
  
  Com base nas informações da receita, forneça o seguinte no formato json:
  
  - descricao: Uma descrição cativante e informativa da receita, destacando seus principais atrativos e benefícios.
  - keywords: Uma lista de palavras-chave, separadas por vírgula, relevantes e de alto volume de pesquisa que se relacionem diretamente com a receita. Priorize a qualidade das palavras-chave em vez da quantidade.
  - meta_descricao: Uma meta description atraente para ser exibida nos resultados de pesquisa. Deve ter 150 a 160 caracteres no máximo.
  `;

  const recipeContent = [
    `Nome da receita: ${recipe.nome}`,
    `Receita: ${recipe.receita}`,
  ].join('\n');

  const currentDescriptionContent = recipe.descricao
    ? [
        `Descrição atual: ${recipe.descricao}`,
        `Meta descrição atual: ${recipe.meta_descricao}`,
      ].join('\n')
    : undefined;

  return getSeoMetadata({
    completionContent,
    recipeContent,
    currentDescriptionContent,
  });
};
