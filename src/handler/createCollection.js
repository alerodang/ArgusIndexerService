'use strict';

const AWS = require('aws-sdk');
const jwt = require('jsonwebtoken');
const rekognition = new AWS.Rekognition();

module.exports.handler = async (event) => {
    console.log('DEBUG: parse headers');
    const {Authorization: token} = event.headers;

    const decodedToken = jwt.decode(token);
    const account = decodedToken["email"];

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