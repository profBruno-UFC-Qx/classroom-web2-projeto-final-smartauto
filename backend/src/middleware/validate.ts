// implementar middleware de validação de dados com zod

// src/middlewares/validate.ts
import { NextFunction, Request, Response } from "express";
import { ZodType, ZodError } from "zod";

export const validate =
  (schemas: { body?: ZodType<any, any>; query?: ZodType<any, any>; params?: ZodType<any, any> }) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schemas.body) req.body = schemas.body.parse(req.body);
      if (schemas.query) req.query = schemas.query.parse(req.query) as typeof req.query;
      if (schemas.params) req.params = schemas.params.parse(req.params) as typeof req.params;
      next();
    } catch (err) {
    if (err instanceof ZodError) {
        const errorsByField: Record<string, string> = {};
        const errorsArray = err.issues.map((e) => {
          const field = e.path.join('.');
          const message = e.message;
          
          if (!errorsByField[field]) {
            errorsByField[field] = message;
          }
          
          return { 
            field,
            path: e.path, 
            message 
          };
        });

        return res.status(400).json({
          message: "Erro de validação",
          errors: errorsArray,
          fields: errorsByField, // Objeto indexado para acesso direto
        });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  };
