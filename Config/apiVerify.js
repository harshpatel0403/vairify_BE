import { verify } from "./auth.js";


const tokenVerification = (req, res, next) => {
    try {
        const { authorization } = req.headers;
        // console.log(authorization, req.headers, ' <=== Auth token...')
        if (!authorization || !authorization.startsWith('Bearer')) {
            return res.status(406).send({ message: 'Unauthorized' })
        }

        let token = authorization.replace('Bearer ', '');

        const decodedToken = verify(token)
        req.user = decodedToken
        return next();
    } catch (error) {
        if ((error.name === 'TokenExpiredError') || (error.name === "JsonWebTokenError") || (error.name === "NotBeforeError")) {
            return res.status(406).send({ message: 'Token has expired' });
        }
    }
}

export { tokenVerification }