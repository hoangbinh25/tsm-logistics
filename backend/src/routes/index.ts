import { Router } from "express";
import authRoute from "./auth.route";
import userRoute from "./user.route";
// Route admin
import fleetRoute from "./fleet.route";
import warehouseRoute from "./warehouse.route";
import assignOrderRoute from "./order.route";
import revenueRoute from "./revenue.route";
import transportServiceRoute from "./transport-service.route"
import orderRoute from "./order.route"

const router = Router();

router.use("/auth", authRoute)
router.use("/user", userRoute)
router.use("/orders", orderRoute)

// admin
router.use("/fleet", fleetRoute)
router.use("/warehouses", warehouseRoute)
router.use("/assign", assignOrderRoute)
router.use("/revenue", revenueRoute)
router.use("/services", transportServiceRoute)

export default router;
