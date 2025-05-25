declare module 'express' {
  export interface Request {
    file?: any;
    files?: any;
    body?: any;
  }
  
  export interface Response {
    status(code: number): Response;
    json(data: any): Response;
    send(body: any): Response;
  }
  
  export interface Router {
    get(path: string, handler: (req: Request, res: Response) => void): Router;
    post(path: string, handler: (req: Request, res: Response) => void): Router;
    put(path: string, handler: (req: Request, res: Response) => void): Router;
    delete(path: string, handler: (req: Request, res: Response) => void): Router;
    use(path: string, router: Router): Router;
    use(handler: (req: Request, res: Response, next: Function) => void): Router;
  }
  
  export function Router(): Router;
  
  export function json(options?: any): (req: Request, res: Response, next: Function) => void;
  export function urlencoded(options?: any): (req: Request, res: Response, next: Function) => void;
  
  export default function createApplication(): {
    use: (middleware: any) => any;
    listen: (port: number, callback?: () => void) => any;
    get: (path: string, handler: (req: Request, res: Response) => void) => any;
    post: (path: string, handler: (req: Request, res: Response) => void) => any;
    json: typeof json;
    urlencoded: typeof urlencoded;
  };
}

declare module 'cors' {
  export default function cors(options?: any): any;
}

declare module 'multer' {
  export interface File {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    size: number;
    destination: string;
    filename: string;
    path: string;
    buffer: Buffer;
  }
  
  export interface StorageEngine {
    _handleFile(req: any, file: any, callback: (error?: any, info?: any) => void): void;
    _removeFile(req: any, file: any, callback: (error?: any) => void): void;
  }
  
  export interface Multer {
    single(fieldname: string): any;
    array(fieldname: string, maxCount?: number): any;
    fields(fields: Array<{name: string, maxCount?: number}>): any;
    none(): any;
  }
  
  export function memoryStorage(): StorageEngine;
  export function diskStorage(options: {destination?: string | ((req: any, file: any, callback: (error: Error | null, destination: string) => void) => void), filename?: (req: any, file: any, callback: (error: Error | null, filename: string) => void) => void}): StorageEngine;
  
  export default function multer(options?: {storage?: StorageEngine}): Multer;
}

declare module 'path' {
  export function join(...paths: string[]): string;
  export function resolve(...paths: string[]): string;
  export function dirname(path: string): string;
  export function basename(path: string, ext?: string): string;
  export function extname(path: string): string;
}

declare namespace Express {
  export interface Multer {
    File: {
      fieldname: string;
      originalname: string;
      encoding: string;
      mimetype: string;
      size: number;
      destination: string;
      filename: string;
      path: string;
      buffer: Buffer;
    }
  }
  
  export interface Request {
    file?: Multer.File;
    files?: {[fieldname: string]: Multer.File[]};
  }
}

declare namespace NodeJS {
  export interface ProcessEnv {
    [key: string]: string | undefined;
    NODE_ENV?: 'development' | 'production' | 'test';
    PORT?: string;
    SERPAPI_KEY?: string;
    GEMINI_API_KEY?: string;
  }
  
  export interface Process {
    env: ProcessEnv;
  }
}

declare var process: NodeJS.Process; 