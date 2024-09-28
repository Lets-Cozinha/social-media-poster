import * as dateFns from 'date-fns';
import {
  type Recipe,
  fetchAlreadyPublishedRecipes,
  fetchRecipeByPath,
} from './cms';
import { getMostVisitedRecipes } from './getMostVisitedPages';

const NUMBER_OF_DAYS_AGO_FOR_PUBLISHED_RECIPES = 10;

export const getRecipeToBePublished = async () => {
  console.log('Buscando receita para ser publicada...');

  const startDate = dateFns
    .subDays(new Date(), NUMBER_OF_DAYS_AGO_FOR_PUBLISHED_RECIPES)
    .toISOString();

  console.log('Buscando receitas já publicadas...');
  const alreadyPublishedRecipes = await fetchAlreadyPublishedRecipes({
    startDate,
  });

  console.log('Buscando receitas mais visitadas...');
  const mostVisitedRecipes = await getMostVisitedRecipes();

  let recipeToBePublished: Recipe | undefined;

  console.log(
    'Verificando receitas mais visitadas que ainda não foram publicadas...'
  );
  for (const mostVisitedRecipe of mostVisitedRecipes) {
    if (
      !alreadyPublishedRecipes.some((publishedRecipe) => {
        return publishedRecipe.receita.slug === mostVisitedRecipe.slug;
      })
    ) {
      const recipe = await fetchRecipeByPath(mostVisitedRecipe.path);
      recipeToBePublished = recipe;
      break;
    }
  }

  if (!recipeToBePublished) {
    console.log('Nenhuma receita encontrada para ser publicada');
    return;
  }

  console.log(
    'Receita encontrada para ser publicada:',
    recipeToBePublished.nome
  );
  return recipeToBePublished;
};
