import { getRecipeUrl } from './getRecipeUrl';
import { getSocialMediaContent } from './getSocialMediaContent';
import qs from 'qs';
import 'dotenv/config';
import type { Recipe } from './cms';

const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;

const FACEBOOK_PAGE_ID = process.env.FACEBOOK_PAGE_ID;

const BASE_URL = 'https://graph.facebook.com/v21.0';

/**
 * It should follow the guidelines for posting on Facebook.
 * https://www.facebook.com/help/1257205004624246
 *
 * And Facebook Community Standards
 * https://transparency.meta.com/policies/community-standards/
 */
const completionContent = `
Você é um especialista em redes sociais e está criando um post para a página de receitas no Facebook.
O nome da página é 'Lets Cozinha' (sem apóstrofo no 'Lets').
O objetivo do post é atrair o interesse do público para as receitas, estimulando a interação de maneira natural e positiva.
Mantenha um tom convidativo e descreva os destaques da receita de forma clara, mencionando ingredientes principais ou detalhes atrativos.
Evite expressões que possam ter duplo sentido, como "esta receita vai roubar a cena" ou "este sabor vai invadir a sua casa" (os verbos "invadir" e "roubar" têm duplo sentido), ou soar sensacionalistas.
Adicione até 5 hashtags relevantes para ampliar o alcance, alinhadas ao nicho de receitas e ao perfil do público-alvo.
Evite pedir explicitamente para que as pessoas acessem o site, mas crie curiosidade sobre a receita sem mencionar o link diretamente, já que o Facebook exibe o link da postagem automaticamente.

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

  const url = `${BASE_URL}/${FACEBOOK_PAGE_ID}/feed?${query}`;

  console.log('Enviando post para o Facebook...');
  const response = await fetch(url, {
    method: 'POST',
  });

  const data: { id: string } | { error: { message: string } } =
    await response.json();

  if ('error' in data) {
    console.error(data.error.message);
    throw new Error(data.error.message);
  }

  console.log(`Post ${data.id} no Facebook enviado com sucesso!`);
  return data;
};
