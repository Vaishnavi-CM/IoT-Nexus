import { Router, type IRouter } from "express";
import healthRouter from "./health";
import chatRouter from "./chat";
import conceptsRouter from "./concepts";
import statsRouter from "./stats";
import quizRouter from "./quiz";

const router: IRouter = Router();

router.use(healthRouter);
router.use(chatRouter);
router.use(conceptsRouter);
router.use(statsRouter);
router.use(quizRouter);

export default router;
