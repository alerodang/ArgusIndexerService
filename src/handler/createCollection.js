'use strict';

const AWS = require('aws-sdk');
const rekognition = new AWS.Rekognition();

module.exports.handler = async (event) => {
    console.log("DEBUG: parse body");
    const {account} = JSON.parse(event.body);

    console.log("DEBUG: create collection");
    const collectionId = account.replace("@", "-");
    const payload = await rekognition.createCollection({CollectionId: collectionId}).promise();

    return {
        statusCode: 200,
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            success: true,
            payload: payload
        })
    }
};