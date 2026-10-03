import express from 'express';
import {  validateRequestBody } from '../../validators';
import { createBookingSchema } from '../../validators/booking.validators';
import { confirmBookingHandler, createBookingHandler } from '../../controllers/booking.controllers';

const bookingRouter = express.Router();

bookingRouter.get('/', validateRequestBody(createBookingSchema), createBookingHandler); // TODO: Resolve this TS compilation issue
bookingRouter.get('/confirm/:idempotencyKey', confirmBookingHandler); // TODO: Resolve this TS compilation issue

bookingRouter.get('/health', (req, res) => {
    res.status(200).send('OK');
});

export default bookingRouter;