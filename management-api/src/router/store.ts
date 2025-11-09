import { Router } from "express";
import { StoreController } from "../controller/store";

const StoreRouter = Router();

StoreRouter.get('/:id', StoreController.getStore);

export default StoreRouter;