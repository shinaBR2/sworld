import { SelectorConfig, SelectorName } from '../types';

/**
 * Data
 * - slug
 * - title
 * - videoUrl
 */

const selectors: SelectorConfig[] = [
  {
    name: SelectorName.TITLE,
    selector: '.product-item-info > .product-item-name > a',
    waitForSelectorTimeout: 10000,
    required: false,
  },
  {
    name: SelectorName.URL,
    selector: '#main-contents #content #ajax-episode #halim-list-server .halim-list-eps a',
    waitForSelectorTimeout: 10000,
    required: true,
  },
];

const videoUrlXHRUrl = 'wp-content/themes/halimmovies/player.php';

export { selectors, videoUrlXHRUrl };
