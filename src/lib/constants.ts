//* src/lib/constants.ts

export const API_BASE_URL = import.meta.env.VITE_API_URL;

export const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
export const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID;

export const MAX_FILE_SIZE_BYTES = 100 * 1000 * 1000;
export const MAX_FILE_SIZE_LABEL = "100 MB";

export const MAX_PROFILE_PICTURE_BYTES = 2 * 1000 * 1000;
export const MAX_PROFILE_PICTURE_LABEL = "2 MB";
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
