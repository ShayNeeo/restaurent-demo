// Temporary shims to satisfy the linter when @types are not installed yet.
declare module 'path' { const x: any; export = x }
declare module 'fs' { const x: any; export = x }
declare module 'http' { const x: any; export = x }
declare module 'https' { const x: any; export = x }
declare module 'dotenv' { const x: any; export = x }
declare module 'express' { const x: any; export = x }
declare module 'http-proxy-middleware' { export const createProxyMiddleware: any }

declare var process: any;
declare var __dirname: string;
declare var console: any;

