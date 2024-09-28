import { getRecipeUrl } from './getRecipeUrl';
import { getSocialMediaContent } from './getSocialMediaContent';
import qs from 'qs';
import 'dotenv/config';
import type { Recipe } from './cms';

const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;

const FACEBOOK_PAGE_ID = process.env.FACEBOOK_PAGE_ID;

const BASE_URL = 'https://graph.facebook.com/v20.0';

const completionContent = `
Você é um especialista em redes sociais e está criando um post para a página de receitas no Facebook.
O nome da página é "Lets Cozinha" com o "Lets" tudo junto (sem apóstrofo).
O objetivo do post é engajar a audiência, gerar curtidas, comentários e compartilhamentos.
O post deve ser envolvente, destacando os principais atrativos da receita e convidando os seguidores a conferirem os detalhes completos no site.
Mantenha o post visualmente limpo e, se fizer sentido, incluir uma prévia, como um ou dois ingredientes principais ou uma frase chamativa.
Adicione até 5 hashtags relevantes para aumentar o alcance da publicação, levando em consideração o nicho de receitas e o público-alvo
Não colocar o link da receita no post, pois o Facebook irá automaticamente exibir o link da postagem.

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
