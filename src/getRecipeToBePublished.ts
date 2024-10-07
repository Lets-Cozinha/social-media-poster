import * as dateFns from 'date-fns';
import {
  type Recipe,
  fetchAlreadyPublishedRecipes,
  fetchMostRecentRecipes,
  fetchRecipeByPath,
  getLetsCozinha,
} from './cms';
import { getMostVisitedRecipes } from './getMostVisitedPages';

const NUMBER_OF_DAYS_AGO_FOR_PUBLISHED_RECIPES = 50;

export const getRecipeToBePublished = async (): Promise<Recipe> => {
  console.log('Buscando receita para ser publicada...');

  const startDate = dateFns
    .subDays(new Date(), NUMBER_OF_DAYS_AGO_FOR_PUBLISHED_RECIPES)
    .toISOString();

  console.log('Buscando receitas já publicadas...');
  const alreadyPublishedRecipes = await fetchAlreadyPublishedRecipes({
    startDate,
  });

  const filterAlreadyPublishedRecipes = (recipe: Recipe) => {
    return !alreadyPublishedRecipes.some((publishedRecipe) => {
      return publishedRecipe.receita.slug === recipe.slug;
    });
  };

  const filterRecipeDoNotHaveImages = (recipe: Recipe) => {
    return recipe.imagens?.length && recipe.imagens?.length > 0;
  };

  const MOST_RECENT_RECIPES_INTERVAL_IN_DAYS = 30;

  console.log('Buscando receitas publicadas recentemente...');
  const mostRecentRecipes = await fetchMostRecentRecipes(
    MOST_RECENT_RECIPES_INTERVAL_IN_DAYS
  );

  const mostRecentRecipesNotPublished = mostRecentRecipes
    .filter(filterAlreadyPublishedRecipes)
    .filter(filterRecipeDoNotHaveImages);

  const EXPIRATION_DAYS = 7;

  const checkIfRecipeWillExpireInAInterval = (recipe: Recipe) => {
    return dateFns.isWithinInterval(
      dateFns.addDays(
        new Date(recipe.createdAt),
        MOST_RECENT_RECIPES_INTERVAL_IN_DAYS
      ),
      {
        start: new Date(),
        end: dateFns.addDays(new Date(), EXPIRATION_DAYS),
      }
    );
  };

  const recipesThatWillExpireInAInterval = mostRecentRecipesNotPublished.filter(
    checkIfRecipeWillExpireInAInterval
  );

  if (recipesThatWillExpireInAInterval.length > 0) {
    return recipesThatWillExpireInAInterval[0];
  }

  console.log('Buscando receitas favoritas...');
  const favoriteRecipes = (await getLetsCozinha()).letsCozinha
    .receitas_favoritas;

  const favoriteRecipesNotPublished = favoriteRecipes
    .filter(filterAlreadyPublishedRecipes)
    .filter(filterRecipeDoNotHaveImages);

  if (favoriteRecipesNotPublished.length > 0) {
    return favoriteRecipesNotPublished[0];
  }

  if (mostRecentRecipesNotPublished.length > 0) {
    return mostRecentRecipesNotPublished[0];
  }

  console.log(
    'Buscando receitas mais visitadas que ainda não foram publicadas...'
  );
  const mostVisitedRecipesPaths = await getMostVisitedRecipes();

  const mostVisitedRecipesPathsNotPublished = mostVisitedRecipesPaths.filter(
    (recipe) => {
      return !alreadyPublishedRecipes.some((publishedRecipe) => {
        return publishedRecipe.receita.slug === recipe.slug;
      });
    }
  );

  if (mostVisitedRecipesPathsNotPublished.length > 0) {
    return await fetchRecipeByPath(mostVisitedRecipesPathsNotPublished[0].path);
  }

  return await fetchRecipeByPath(mostVisitedRecipesPaths[0].path);
};
