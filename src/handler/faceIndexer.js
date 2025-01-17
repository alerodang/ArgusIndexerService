'use strict';

const AWS = require('aws-sdk');
const rekognition = new AWS.Rekognition;
const dynamoDB = new AWS.DynamoDB;

const collectionsTable = process.env.COLLECTIONS_TABLE;

module.exports.handler = async (event) => {

    const bucket = event.Records[0].s3.bucket.name;
    const objectKey = event.Records[0].s3.object.key.replace('%40', '@');

    const account = objectKey.split('/')[1];
    const collectionId = account.replace('@', '-');
    const name = objectKey.split('/')[2];

    const indexFacesParams = {
        CollectionId: collectionId,
        Image: {
            S3Object: {
                Bucket: bucket,
                Name: objectKey
            }
        }
    };

    console.log('DEBUG:', bucket);
    console.log('DEBUG:', objectKey);

    const rekognitionResponse = await rekognition.indexFaces(indexFacesParams, function(err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else     console.log('DEBUG:', data);           // successful response
    }).promise();

    console.log("DEBUG:", rekognitionResponse);

    const faceId = rekognitionResponse.FaceRecords[0].Face.FaceId;

    const params = {
        Item: {
            "rekognitionFaceId": {
                S: faceId
            },
            "collectionId": {
                S: collectionId
            },
            "name": {
                S: name
            }
        },
        TableName: collectionsTable
    };

    await dynamoDB.putItem(params, function(err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else console.log('DEBUG dynamo getItem:', data); // successful response
    }).promise();

    return {
        statusCode: 200,
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            success: true,
            payload: rekognitionResponse
        })
    }
};

