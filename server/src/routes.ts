import { Router } from 'express'

import itemsController from './controllers/ItemsController'
import pointsController from './controllers/PointsController'

const routes = Router()

routes.get("/items", itemsController.index)
routes.post("/points", pointsController.create)
routes.get("/points/:id", pointsController.show)
routes.get("/points", pointsController.index)

export default routes 