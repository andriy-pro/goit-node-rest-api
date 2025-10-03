/**
 * Helper для роботи з Gravatar
 * Генерує URL аватарів на основі email адреси
 *
 * @fileoverview Gravatar helper functions
 * @module gravatar
 * @author Andriy Nechyporenko
 * @version 1.0.0 - Topic 9: Avatar Upload
 * @license GPL-3.0
 */

import gravatar from "gravatar";

/**
 * Генерує URL аватара Gravatar для email
 * @param {string} email - Email користувача
 * @returns {string} URL аватара (HTTPS)
 * 
 * @example
 * const avatarURL = getGravatarUrl('user@example.com');
 * // Returns: 'https://gravatar.com/avatar/...'
 */
export const getGravatarUrl = (email) => {
  return gravatar.url(
    email,
    {
      s: "250", // size (250x250 pixels)
      r: "pg", // rating (parental guidance)
      d: "identicon", // default image type (generated pattern)
    },
    true // secure (use HTTPS)
  );
};

