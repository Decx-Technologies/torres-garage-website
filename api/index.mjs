// Vercel Function entry. vercel.json rewrites /api/* and /uploads/* here with ?__route=<original path>;
// static files are served from dist/ by Vercel's CDN. Locally, server.mjs runs backend.mjs directly.
import {handler} from '../backend.mjs';
export default handler;
