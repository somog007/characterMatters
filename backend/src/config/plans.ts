import { env } from './env';

/** Price of each package in naira, per academic session. */
export const PACKAGE_PRICES_NGN = {
  package_1: 1_200_000,
  package_2: 900_000,
  package_3: 750_000,
  package_4: 450_000,
  package_5: 300_000,
  package_6: 150_000,
} as const;

export type PlanId = keyof typeof PACKAGE_PRICES_NGN;
export const PLAN_IDS = Object.keys(PACKAGE_PRICES_NGN) as [PlanId, ...PlanId[]];

export const isPlanId = (value: unknown): value is PlanId =>
  typeof value === 'string' && Object.prototype.hasOwnProperty.call(PACKAGE_PRICES_NGN, value);

// The collection the site already links to publicly as a preview. Set
// SUBSCRIBER_COLLECTION_URL to a private link to give subscribers different content.
const DEFAULT_COLLECTION_URL = 'https://collection.cloudinary.com/crau2l9a/fafda5942927feb6d904a3105bda1d79';

/**
 * Links shown to subscribers. Only sent to accounts with an ACTIVE
 * subscription, never shipped in the frontend bundle.
 */
export const subscriberResources = () => [
  {
    label: 'Open the Character Matters video & resource collection',
    url: env.SUBSCRIBER_COLLECTION_URL || DEFAULT_COLLECTION_URL,
  },
];
