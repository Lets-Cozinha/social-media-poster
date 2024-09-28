import { getRecipeToBePublished } from './getRecipeToBePublished';
import { postOnFacebook } from './postOnFacebook';
import { savePoster } from './cms';

export const postRecipe = async () => {
  console.log('Buscando receita para ser publicada...');
  const recipe = await getRecipeToBePublished();

  if (!recipe) {
    console.log('Nenhuma receita encontrada para ser publicada');
    return;
  }

  console.log('Publicando receita...');
  const facebookData = await postOnFacebook(recipe);

  console.log('Salvando poster...');
  await savePoster({ recipe, facebookPostId: facebookData?.id });

  console.log('Receita publicada com sucesso!');
};
