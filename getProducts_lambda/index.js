const AWS = require('aws-sdk');
var ddb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    
    const response = {
        statusCode: 200,
        headers: {
        "Access-Control-Allow-Origin" : "*", 
        }
    };
    
    
    var params = {
    TableName: "products",
    ProjectionExpression: "productId, sku, image, amount, productName"
    };

    try {
        var result = await ddb.scan(params).promise()
        response.body = JSON.stringify(result)
    }
    catch(err) {
        console.log(err)
    }

    return response;
};
