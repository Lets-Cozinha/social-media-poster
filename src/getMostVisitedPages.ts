import { BetaAnalyticsDataClient } from '@google-analytics/data';
import 'dotenv/config';

const credentials = JSON.parse(
  Buffer.from(process.env.GOOGLE_SERVICE_KEY || '', 'base64').toString('ascii')
);

const analyticsDataClient = new BetaAnalyticsDataClient({
  credentials,
});

const propertyId = process.env.GA4_PROPERTY_ID;

export const getMostVisitedPages = async () => {
  try {
    const [response] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [
        {
          startDate: '7daysAgo',
          endDate: 'today',
        },
      ],
      dimensions: [
        {
          name: 'unifiedPagePathScreen',
        },
      ],
      metrics: [
        {
          name: 'screenPageViews',
        },
      ],
      limit: 50,
    });

    return (
      response.rows
        ?.map((row) => {
          return {
            path: row.dimensionValues?.[0].value,
            views: row.metricValues?.[0].value,
          };
        })
        .filter(
          (
            page
          ): page is {
            path: string;
            views: string;
          } => {
            return !!page.path;
          }
        ) || []
    );
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const getMostVisitedRecipes = async () => {
  const pages = await getMostVisitedPages();
  return pages
    .filter((page) => {
      return page.path.startsWith('/receitas/');
    })
    .map((page) => {
      const slug = page.path.replace('/receitas/', '');
      return { slug, ...page };
    });
};
