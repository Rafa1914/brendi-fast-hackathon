import { Router } from "express";
import StoreRouter from "./store";

const router = Router();

router.use('/store', StoreRouter);

export default router;