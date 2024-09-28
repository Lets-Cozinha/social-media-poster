import qs from 'qs';
import 'dotenv/config';
import { getSocialMediaContent } from './getSocialMediaContent';
import type { Recipe } from './cms';
import { getRecipeUrl } from './getRecipeUrl';

const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;

const FACEBOOK_PAGE_ID = process.env.FACEBOOK_PAGE_ID;

const BASE_URL = 'https://graph.facebook.com/v20.0';

const completionContent = `
Você é um especialista em redes sociais e está criando um post para uma página de receitas no Facebook, chamada Lets Cozinha.
Escreva um post sobre a receita cujo objetivo é engajar a audiência e ganhar curtidas e compartilhamentos.
O post terá o link para a receita no site com mais detalhes.
Adicione as melhores hashtags para aumentar o alcance do post, mas não mais do que 5 hashtags.

Forneça o seguinte no formato json:

- post: o texto do post.
`;

export const postOnFacebook = async (recipe: Recipe) => {
  console.log('Postando no Facebook sobre a receita: ', recipe.nome);

  console.log(`Gerando conteúdo para o post no Facebook...`);
  const content = await getSocialMediaContent({ recipe, completionContent });

  if (!content.post) {
    console.log('Não foi possível gerar o conteúdo para o post no Facebook');
    return;
  }

  /**
   * https://developers.facebook.com/docs/pages-api/posts
   */
  const query = qs.stringify({
    access_token: META_ACCESS_TOKEN,
    message: content.post,
    link: getRecipeUrl(recipe),
  });

  const url = `${BASE_URL}/${FACEBOOK_PAGE_ID}?${query}`;

  console.log('Enviando post para o Facebook...');
  const response = await fetch(url, {
    method: 'POST',
  });

  const data: { id: string } = await response.json();

  console.log(`Post ${data.id} no Facebook enviado com sucesso!`);
  return data;
};
