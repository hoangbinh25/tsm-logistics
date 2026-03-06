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
import driverRoute from './driver.route';
import notificationRoute from './notification.route'
import incidentRoute from './incident.route'
import dashboardRoute from './dashboard.route'



const router = Router();
console.log("Initializing API routes...");

router.get("/debug-fleet", (req, res) => res.json({ message: "Fleet route reachable" }));

// user
router.use("/auth", authRoute)
router.use("/users", userRoute)
router.use("/orders", orderRoute)
router.use('/drivers', driverRoute);
router.use('/incidents', incidentRoute);


// driver
router.use('/notifications', notificationRoute)

// admin
router.use("/fleet", fleetRoute)
router.use("/warehouses", warehouseRoute)
router.use("/assign", assignOrderRoute)
router.use("/revenue", revenueRoute)
router.use("/services", transportServiceRoute)
router.use("/dashboard", dashboardRoute)


export default router;
