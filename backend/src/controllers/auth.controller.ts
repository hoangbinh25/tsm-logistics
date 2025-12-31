import { Request, Response } from "express";
import { loginService } from "../services/auth.service";

export async function login(req: Request, res: Response) {
    const result = await loginService(req.body);
    res.json(result)
}