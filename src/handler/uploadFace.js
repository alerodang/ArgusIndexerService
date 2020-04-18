'use strict';

const AWS = require('aws-sdk');
const s3 = new AWS.S3();

const bucket = process.env.APP_BUCKET;

module.exports.handler = async (event) => {

    console.log('DEBUG: parse body');
    const {account, client, face} = JSON.parse(event.body);

    const buffer = Buffer.from(face.image.replace(/^data:image\/\w+;base64,/, ''), 'base64');
    const objectKey = 'faces/' + account + '/' + face.name + '/' + face.position + '.jpg';
    const date =  Date.now();

    console.log('DEBUG: upload image');
    const payload = await s3.upload({
        Bucket: bucket,
        Key: objectKey,
        Body: buffer,
        Metadata: {
            'date': String(date),
            'client': client.name,
        },
    }).promise();

    return {
        statusCode: 200,
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            success: true,
            payload: payload
        })
    }
};

