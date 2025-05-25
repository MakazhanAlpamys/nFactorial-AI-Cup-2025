declare module 'express' {
  export default function express(): any;
  export namespace express {
    export interface Request {
      file?: any;
      files?: any;
    }
  }
}

declare module 'cors' {
  export default function cors(options?: any): any;
}

declare module 'multer' {
  export default function multer(options: any): any;
}

declare namespace Express {
  export interface Request {
    file?: any;
    files?: any;
  }
} 