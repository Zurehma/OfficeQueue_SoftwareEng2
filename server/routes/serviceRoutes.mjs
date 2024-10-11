// Module for the authentication routes

import { Router } from "express";
import { check, body, param, query } from "express-validator";

import Utility from "../utilities.mjs";

import ServiceDAO from "../dao/serviceDAO.mjs";
import QueueManager from "../models/queue.mjs";

/**
 *
 */
function ServiceRoutes() {
  this.router = Router();

  this.queueManager = new QueueManager();
  this.serviceDAO = new ServiceDAO();

  this.queueManager.init();

  this.getRouter = () => this.router;

  this.initRoutes = () => {

    /**
     * Route to call the next customer in the queue of one of the services provided by the counterID provided in the body of the request
     */
    this.router.post(
      "/ticket/next",
      Utility.isLoggedIn,
      body("counterID").isInt({ gt: 0 }),
      body("date").isISO8601({ strict: true }),
      Utility.validateRequest,
      async (req, res, next) => {
        try {
          const services = await this.serviceDAO.getServicesPerCounter(req.body.counterID);
          const maxQueueLength = Math.max(
            ...[...services].map((service) => this.queueManager.length(service.code))
          );
          services.filter((service) => this.queueManager.length(service.code) === maxQueueLength);
          const minAverageTime = Math.min(...[...services].map((service) => service.averageTime));
          const service = services.find((service) => service.averageTime === minAverageTime);
          const ticket = this.queueManager.dequeue(service.code);

          if (ticket === undefined) {
            const err = { errCode: 400, errMessage: "The queues are empty!" };
            throw err;
          }

          await this.serviceDAO.addServedCustomer(req.body.counterID, service.id, req.user.id, req.body.date);

          return res
            .status(200)
            .json({ serviceCode: service.code, ticket: ticket, counterID: req.body.counterID });
        } catch (err) {
          return next(err);
        }
      }
    );

    /* 
      Route for user to get new ticket
    */
    this.router.post(
      "/ticket",
      [body("service").isString().notEmpty(), Utility.validateRequest],
      async (req, res) => {
        const service = req.body.service.toLowerCase();
        const serviceCode = await this.serviceDAO.getServiceCode(service);
        if (serviceCode === undefined) {
          return res.status(400).json({ message: "Invalid service" });
        }
        const ticket = this.queueManager.enqueue(serviceCode);
        return res.status(200).json({ ticket: ticket });
      }
    );

    //Route for manager or admin to clear queues
    this.router.delete("/resetQueues", Utility.isLoggedIn, async (req, res) => {
      this.queueManager.reset();
      return res.status(200).json({ message: "Queues cleared" });
    });
  };
}

export default ServiceRoutes;
