import { Router } from "express";
import StoreRouter from "./store";
import OrderRouter from "./order";
import AnalyticsRouter from "./analytics";

const router = Router();

router.use('/store', StoreRouter);
router.use('/order', OrderRouter);
router.use('/analytics', AnalyticsRouter);

export default router;