
const AWS = require('aws-sdk');
const stripe = require('stripe')('insert API key here');
var ddb = new AWS.DynamoDB({apiVersion: '2012-08-10'});
var ses = new AWS.SES({region: 'us-east-1'});
exports.handler = async (event, context, callback) => {


    const checkoutBody = JSON.parse(event.body).data.object

    try
    {
      var customerEmail = await stripe.customers.retrieve(checkoutBody.customer);
    }
    catch (err)
    {
      console.log(err)
    }

    let email = customerEmail.email
    let orderid = checkoutBody.id
    let product = checkoutBody.display_items[0].sku
    let timestamp = new Date()
    let emailHtml = `<p>Hi,</p> <p> Thank you for your purchase! Here are the details: </p><p>Product: ${product.attributes.name}</p><p>Amount: ${product.price}</p><p>We'll be in touch when your order is successfully fulfilled.</p>`

    var params = {
      TableName: 'order-history',
      Item: {
        'orderid' : {S: orderid},
        'email' : {S: email},
        'product_name' : { S: product.attributes.name},
        'order_amount' : { N: product.price.toString() },
        'date' : {S: timestamp.toString() }
      }
    };

    var sesParams = {
        Destination: {
            ToAddresses: [ email ]
        },
        Message: {
            Body: {
                Html: { Data: emailHtml

                }

            },

            Subject: { Data: "Thank you for your order!"

            }
        },
        Source: "tricooper@gmail.com"
    };

   try
    {
        var result = await ddb.putItem(params).promise();
        var sendEmail = await ses.sendEmail(sesParams).promise();
    }
    catch(err)
    {
        console.log(err);
    }

    const response = {
      statusCode: 200,
    };

    return response;
};
