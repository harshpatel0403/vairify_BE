import { S3Client, CreateMultipartUploadCommand, UploadPartCommand, CompleteMultipartUploadCommand, DeleteObjectCommand, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3';
import { RekognitionClient, DetectFacesCommand, CompareFacesCommand } from '@aws-sdk/client-rekognition';

const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_TOKEN,
        secretAccessKey: process.env.AWS_SECERT_TOKEN,
    }
});

const rekognition = new RekognitionClient({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_TOKEN,
        secretAccessKey: process.env.AWS_SECERT_TOKEN,
    }
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
        };

        const { UploadId } = await s3.send(new CreateMultipartUploadCommand(multipartParams));
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
                UploadId,
            };

            const partPromise = s3.send(new UploadPartCommand(partParams));
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
            UploadId,
        };

        await s3.send(new CompleteMultipartUploadCommand(completeParams));


        console.log("File uploaded sucessfully to aws s3.");
        return uniqueKey

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

        await s3.send(new DeleteObjectCommand(deleteParams));
        console.log(`File deleted successfully: ${fileKey}`);
    } catch (error) {
        console.error('Error deleting file:', error);
        throw error;
    }
};


export const detectFace = async (imageKey) => {
    const params = {
        Image: {
            S3Object: {
                Bucket: process.env.AWS_BUCKET,
                Name: imageKey,
            },
        },
    };

    try {
        const data = await rekognition.send(new DetectFacesCommand(params));

        if (data.FaceDetails.length > 0) {
            console.log('Faces detected:', data.FaceDetails);
            return true;
        } else {
            console.log('No faces detected');
            return false;
        }
    } catch (error) {
        console.error('Error detecting faces:', error);
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

        const response = await rekognition.send(new CompareFacesCommand(params));
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
        const response = await s3.send(new ListObjectsV2Command({ Bucket: process.env.AWS_BUCKET }));
        const files = response.Contents?.map(item => ({
            key: item.Key,
            url: s3.send(new GetObjectCommand({
                Bucket: process.env.AWS_BUCKET,
                Key: item.Key,
                Expires: 60 * 60,
            })),
        })) || [];
        return files;
    } catch (error) {
        console.error('Error fetching S3 files:', error);
        throw error;
    }
}

