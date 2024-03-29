import { Router } from "express";
import { celebrate, Joi } from "celebrate";
import multer from "multer";
import multerConfig from "../src/config/multer";

import itemsController from "./controllers/ItemsController";
import pointsController from "./controllers/PointsController";

const routes = Router();

const upload = multer(multerConfig);

routes.get("/items", itemsController.index);
routes.get("/points/:id", pointsController.show);
routes.get("/points", pointsController.index);

routes.post(
  "/points",
  upload.single("image"),
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().required(),
      email: Joi.string().required().email(),
      whastapp: Joi.number().required(),
      latitude: Joi.number().required(),
      longitude: Joi.number().required(),
      city: Joi.string().required(),
      uf: Joi.string().required().max(2),
      items: Joi.string().required(),
    }),
  }),
  pointsController.create
);

export default routes;
