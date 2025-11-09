import { Router } from "express";
import StoreRouter from "./store";
import OrderRouter from "./order";

const router = Router();

router.use('/store', StoreRouter);
router.use('/order', OrderRouter);

export default router;