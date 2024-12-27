import express from 'express';

import {getCouponsByUserId, applyCoupon, generateCoupons} from "../Controllers/CouponController.js"

const CouponRoute = express.Router();

CouponRoute.get('/:userId', getCouponsByUserId);
CouponRoute.post('/apply-coupon', applyCoupon);
CouponRoute.post('/generate-coupons', generateCoupons);

export default CouponRoute;