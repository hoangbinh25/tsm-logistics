import { Router } from "express";
import authRoute from "./auth.route";
import userRoute from "./user.route";
// Route admin
import fleetRoute from "./fleet.route"
import warehouseRoute from "./warehouse.route"
const router = Router();

router.use("/auth", authRoute)
router.use("/user", userRoute)

// admin
router.use("/fleet", fleetRoute)
router.use("/warehouses", warehouseRoute)

export default router;
