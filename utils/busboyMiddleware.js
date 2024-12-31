import Busboy from 'busboy';

export const uploadMiddleware = (req, res, next) => {

    if (req.headers['content-type']?.includes('multipart/form-data')) {
        const busboy = Busboy({ headers: req.headers });

        const files = [];
        const fields = {};

        busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
            const chunks = [];
            file.on('data', (data) => {
                chunks.push(data);
            });
            file.on('end', () => {
                const buffer = Buffer.concat(chunks);
                files.push({ fieldname, filename, encoding, mimetype, buffer });
            });
        });

        busboy.on('field', (fieldname, value) => {
            fields[fieldname] = value;
        });

        busboy.on('finish', () => {
            req.files = files[0];
            req.fields = fields;
            next();
        });

        req.pipe(busboy);
    } else if (req.headers['content-type'] === 'application/json') {

        req.fields = req.body;
        next();
    } else {
        return res.status(400).send({ error: 'Invalid content type' });
    }
};
