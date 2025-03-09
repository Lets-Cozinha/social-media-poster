import qs from 'qs';
import 'dotenv/config';

const CMS_URL = process.env.CMS_URL;

const CMS_TOKEN = process.env.CMS_TOKEN;

const RECIPES_POPULATE = ['categorias', 'imagens'];

type CMSData<Attributes> = {
  id: number;
  attributes: Attributes;
};

export type CMSDataArrayResponse<Attributes = Record<string, unknown>> = {
  data: CMSData<Attributes>[];
};

export type CMSSingleDataResponse<Attributes = Record<string, unknown>> = {
  data: CMSData<Attributes>;
};

type ImageAttributes = {
  url: string;
  width: number;
  height: number;
  alt?: string;
};

type Image = ImageAttributes & {
  formats: {
    thumbnail?: ImageAttributes;
    small?: ImageAttributes;
    medium?: ImageAttributes;
    large?: ImageAttributes;
  };
};

type CMSImages = {
  data: CMSData<Image>[];
};

type RecipeAttributes = {
  nome: string;
  descricao: string;
  slug: string;
  receita: string;
  updatedAt: string;
  createdAt: string;
  meta_descricao: string;
  keywords: string;
  imagens?: CMSImages;
  categorias?: {
    data: CMSData<{
      id: number;
      nome: string;
      slug: string;
    }>[];
  };
};

type CMSRecipesResponse = CMSDataArrayResponse<RecipeAttributes>;

const mapCMSData = <Attributes>(data: CMSData<Attributes>) => {
  return {
    id: data.id,
    ...data.attributes,
  };
};

const mapRecipe = (data: CMSRecipesResponse['data'][0]) => {
  const imagens = data.attributes.imagens?.data?.map(mapCMSData);
  const categorias = data.attributes.categorias?.data?.map(mapCMSData);
  return { ...mapCMSData(data), imagens, categorias };
};

export type Recipe = ReturnType<typeof mapRecipe>;

export const fetchRecipes = async (query?: string): Promise<Recipe[]> => {
  const response = await fetch(
    `${CMS_URL}/api/lets-cozinha-receitas?${query}`,
    {
      headers: {
        Authorization: `Bearer ${CMS_TOKEN}`,
        'Strapi-Response-Format': 'v4',
      },
    }
  ).then((res) => {
    return res.json() as Promise<CMSRecipesResponse>;
  });

  return response.data.map(mapRecipe);
};

export const fetchRecipeByPath = async (path: string): Promise<Recipe> => {
  const slug = path.replace(/^\/receitas\//, '');

  const query = qs.stringify({
    populate: RECIPES_POPULATE,
    filters: {
      slug: {
        $eq: slug,
      },
    },
  });

  const recipe = (await fetchRecipes(query))[0];

  return recipe;
};

export const fetchMostRecentRecipes = async (
  intervalInDays: number
): Promise<Recipe[]> => {
  const query = qs.stringify({
    populate: RECIPES_POPULATE,
    sort: 'createdAt:desc',
    filters: {
      createdAt: {
        $gte: new Date(
          new Date().getTime() - intervalInDays * 24 * 60 * 60 * 1000
        ).toISOString(),
      },
    },
  });

  return fetchRecipes(query);
};

type PosterAttributes = {
  receita: { data: CMSData<RecipeAttributes> };
};

type CMSPosterResponse = CMSDataArrayResponse<PosterAttributes>;

export const fetchAlreadyPublishedRecipes = async ({
  startDate,
}: {
  startDate: string;
}) => {
  const query = qs.stringify({
    populate: ['receita'],
    filters: {
      createdAt: {
        $gte: startDate,
      },
    },
    pagination: {
      pageSize: 100,
    },
    sort: 'createdAt:desc',
  });

  const response = await fetch(`${CMS_URL}/api/lets-cozinha-posters?${query}`, {
    headers: {
      Authorization: `Bearer ${CMS_TOKEN}`,
      'Strapi-Response-Format': 'v4',
    },
  }).then((res) => {
    return res.json() as Promise<CMSPosterResponse>;
  });

  return response.data.map((d) => {
    return { ...mapCMSData(d), receita: mapRecipe(d.attributes.receita.data) };
  });
};

export const savePoster = async ({
  recipe,
  facebookPostId,
}: {
  recipe: Recipe;
  facebookPostId?: string;
}) => {
  const response = await fetch(`${CMS_URL}/api/lets-cozinha-posters`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${CMS_TOKEN}`,
      'Content-Type': 'application/json',
      'Strapi-Response-Format': 'v4',
    },
    body: JSON.stringify({
      data: {
        receita: recipe.id,
        facebook_post_id: facebookPostId,
      },
    }),
  }).then((res) => {
    return res.json();
  });

  if (response.error) {
    throw new Error(response.error?.message);
  }

  return response;
};

type LetsCozinhaCMSResponse = CMSSingleDataResponse<{
  titulo: string;
  descricao?: string;
  receitas_favoritas_titulo: string;
  receitas_favoritas: CMSRecipesResponse;
}>;

export const getLetsCozinha = async () => {
  const query = qs.stringify({
    populate: {
      receitas_favoritas: {
        populate: RECIPES_POPULATE,
      },
    },
  });

  const response: LetsCozinhaCMSResponse = await fetch(
    `${CMS_URL}/api/lets-cozinha?${query}`,
    {
      headers: {
        Authorization: `Bearer ${CMS_TOKEN}`,
        'Strapi-Response-Format': 'v4',
      },
    }
  ).then((res) => {
    return res.json();
  });

  const receitas_favoritas =
    response.data.attributes.receitas_favoritas.data.map(mapRecipe);

  const letsCozinha = {
    ...mapCMSData(response.data),
    receitas_favoritas,
  };

  return { letsCozinha };
};

export const updateRecipe = async (id: number, newData: Partial<Recipe>) => {
  const response = await fetch(`${CMS_URL}/api/lets-cozinha-receitas/${id}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${CMS_TOKEN}`,
      'Content-Type': 'application/json',
      'Strapi-Response-Format': 'v4',
    },
    body: JSON.stringify({
      data: newData,
    }),
  });

  return response.json();
};
