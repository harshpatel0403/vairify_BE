import AWS from 'aws-sdk';
const s3 = new AWS.S3({
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_TOKEN,
    secretAccessKey: process.env.AWS_SECERT_TOKEN,
});

const rekognition = new AWS.Rekognition({
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_TOKEN,
    secretAccessKey: process.env.AWS_SECERT_TOKEN,
})
export const uploadToS3 = async (folderName, fileBuffer, fileName, mimeType) => {
    const chunkSize = 5 * 1024 * 1024; // 5MB
    try {

        const fileSize = fileBuffer.length;
        const totalParts = Math.ceil(fileSize / chunkSize);
        const timestamp = new Date().toISOString();
        const uniqueKey = `images/${folderName}/${timestamp}_${fileName}`;

        const multipartParams = {
            Bucket: process.env.AWS_BUCKET,
            Key: uniqueKey,
            ContentType: mimeType,
            // ACL: 'public-read',
        };

        const multipartUpload = await s3.createMultipartUpload(multipartParams).promise();
        const uploadId = multipartUpload.UploadId;
        const partPromises = [];

        for (let partNumber = 1; partNumber <= totalParts; partNumber++) {
            const start = (partNumber - 1) * chunkSize;
            const end = Math.min(start + chunkSize, fileSize);
            const partBuffer = fileBuffer.slice(start, end);

            const partParams = {
                Body: partBuffer,
                Bucket: process.env.AWS_BUCKET,
                Key: uniqueKey,
                PartNumber: partNumber,
                UploadId: uploadId,
            };

            const partPromise = s3.uploadPart(partParams).promise();
            partPromises.push(partPromise);
        }

        const partsData = await Promise.all(partPromises);

        const completeParams = {
            Bucket: process.env.AWS_BUCKET,
            Key: uniqueKey,
            MultipartUpload: {
                Parts: partsData.map((data, index) => ({
                    ETag: data.ETag,
                    PartNumber: index + 1,
                })),
            },
            UploadId: uploadId,
        };

        await s3.completeMultipartUpload(completeParams).promise();

        console.log("File uploaded sucessfully to aws s3.");
        return uniqueKey;

    } catch (error) {
        console.error('Error uploading file in chunks:', error);
        throw error;
    }
}

export const deleteFilesFromFolder = async (fileUrl) => {
    try {
        const urlParts = new URL(fileUrl);
        const fileKey = urlParts.pathname.substring(1);

        const deleteParams = {
            Bucket: process.env.AWS_BUCKET,
            Key: fileKey,
        };

        await s3.deleteObject(deleteParams).promise();
        console.log(`File deleted successfully: ${fileKey}`);
    } catch (error) {
        console.error('Error deleting file:', error);
        throw error;
    }
};

export const compareFaces = async (sourceImageKey, targetImageKey, similarityThreshold = 80) => {
    try {
        const params = {
            SourceImage: {
                S3Object: {
                    Bucket: process.env.AWS_BUCKET,
                    Name: sourceImageKey,
                },
            },
            TargetImage: {
                S3Object: {
                    Bucket: process.env.AWS_BUCKET,
                    Name: targetImageKey,
                },
            },
            SimilarityThreshold: similarityThreshold,
        };

        const response = await rekognition.compareFaces(params).promise();
        console.log('Face comparison result:', response);

        const matchDetails = response.FaceMatches.map(match => ({
            similarity: match.Similarity,
            boundingBox: match.Face.BoundingBox,
        }));

        return {
            matches: matchDetails,
            unmatchedFaces: response.UnmatchedFaces,
        };
    } catch (error) {
        console.error('Error comparing faces:', error);
        throw error;
    }
};

export const fetchS3Files = async () => {
    try {
        const response = await s3.listObjectsV2({ Bucket: process.env.AWS_BUCKET }).promise();
        const files = response.Contents?.map(item => ({
            key: item.Key,
            url: s3.getSignedUrl('getObject', {
                Bucket: process.env.AWS_BUCKET,
                Key: item.Key,
                Expires: 60 * 60,
            }),
        })) || [];
        return files;
    } catch (error) {
        console.error('Error fetching S3 files:', error);
        throw error;
    }
}

