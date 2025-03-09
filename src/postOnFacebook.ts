import { getRecipeUrl } from './getRecipeUrl';
import { getSocialMediaContent } from './getSocialMediaContent';
import qs from 'qs';
import 'dotenv/config';
import type { Recipe } from './cms';

const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;

if (!META_ACCESS_TOKEN) {
  throw new Error('META_ACCESS_TOKEN não definido');
}

const FACEBOOK_PAGE_ID = process.env.FACEBOOK_PAGE_ID;

const BASE_URL = 'https://graph.facebook.com/v21.0';

const getDefaultFacebookMessage = (recipe: Recipe) => {
  return `Confira essa deliciosa receita de ${recipe.nome} aqui no Lets Cozinha! 🍽️👩‍🍳`;
};

/**
 * It should follow the guidelines for posting on Facebook.
 * https://www.facebook.com/help/1257205004624246
 *
 * And Facebook Community Standards
 * https://transparency.meta.com/policies/community-standards/
 */
const linkPostCompletionContent = `
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

const photoPostCompletionContent = `
Você é um especialista em redes sociais responsável por criar posts envolventes para a página de receitas no Facebook, chamada "Lets Cozinha".
O nome da página é 'Lets Cozinha' (sem apóstrofo no 'Lets').
Seu objetivo é compartilhar uma receita completa, incluindo ingredientes e modo de preparo, de forma clara e acessível para os seguidores.
Use um tom amigável e convidativo.

Para este post, siga as diretrizes abaixo:

- Comece com uma introdução curta que destaque a receita e por que ela é especial, mencionando o nome da receita e qualquer curiosidade relevante.
- Apresente a lista de ingredientes de maneira organizada e fácil de entender.
- Em seguida, explique o modo de preparo em etapas claras e simples, para que qualquer pessoa possa seguir. Não deve ser markdown.
- Convide os seguidores a comentar, curtir e compartilhar suas próprias variações ou fotos da receita pronta.
- Incorpore até 5 hashtags relevantes para o post, focando em termos populares no nicho de culinária.
- Evite expressões que possam ter duplo sentido, como "esta receita vai roubar a cena" ou "este sabor vai invadir a sua casa" (os verbos "invadir" e "roubar" têm duplo sentido), ou soar sensacionalistas.
- Não alterar a receita.

Forneça o seguinte no formato json:

- post: o texto do post.
`;

const postLinkPostOnFacebook = async (recipe: Recipe) => {
  console.log('Postando no Facebook sobre a receita: ', recipe.nome);

  console.log(`Gerando conteúdo para o post no Facebook...`);
  const content = await getSocialMediaContent({
    recipe,
    completionContent: linkPostCompletionContent,
  });

  /**
   * https://developers.facebook.com/docs/pages-api/posts
   */
  const query = qs.stringify({
    access_token: META_ACCESS_TOKEN,
    message: content.post || getDefaultFacebookMessage(recipe),
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

/**
 * https://developers.facebook.com/docs/graph-api/reference/page/photos/#upload
 */
const uploadImage = async (imageUrl: string) => {
  const image = await fetch(imageUrl);
  const imageBuffer = await image.arrayBuffer();
  const imageBlob = new Blob([imageBuffer]);
  const formData = new FormData();
  formData.append('access_token', META_ACCESS_TOKEN);
  formData.append('source', imageBlob, 'image.jpg');
  formData.append('published', 'false');
  const response = await fetch(`${BASE_URL}/${FACEBOOK_PAGE_ID}/photos`, {
    method: 'POST',
    body: formData,
  });
  const data = (await response.json()) as { id: string };
  return data;
};

const postPhotoPostOnFacebook = async (recipe: Recipe) => {
  console.log('Postando no Facebook sobre a receita: ', recipe.nome);

  if (!recipe.imagens) {
    return postLinkPostOnFacebook(recipe);
  }

  console.log('Enviando imagens para o Facebook...');
  const imagesIds = (
    await Promise.all(
      recipe.imagens.map((imagem) => {
        return uploadImage(imagem.url);
      })
    )
  ).filter((image) => {
    return !!image.id;
  });

  if (imagesIds.length === 0) {
    console.log('Nenhuma imagem foi enviada para o Facebook, postando link...');
    return postLinkPostOnFacebook(recipe);
  }

  console.log(`Gerando conteúdo para o post no Facebook...`);
  const content = await getSocialMediaContent({
    recipe,
    completionContent: photoPostCompletionContent,
  });

  /**
   * https://developers.facebook.com/docs/graph-api/reference/page/photos/#multi
   */
  const query = qs.stringify({
    access_token: META_ACCESS_TOKEN,
    message: content.post || getDefaultFacebookMessage(recipe),
    attached_media: imagesIds.map((image) => {
      return { media_fbid: image.id };
    }),
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

export const postOnFacebook = async (recipe: Recipe) => {
  /**
   * 25% chance of posting a link post to increase social media sharing
   * to improve SEO.
   */
  const random = Math.floor(Math.random() * 4);

  if (random === 0) {
    return postLinkPostOnFacebook(recipe);
  }

  return postPhotoPostOnFacebook(recipe);
};
