/** Prefixes a /public path with the GitHub Pages base path. next/link does this itself; raw <img>/<a> tags need it. */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

export const asset = (path: string) => (path.startsWith("http") ? path : `${BASE_PATH}${path}`);
