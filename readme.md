Tristan Cooper

CSCIE90 -- Final Project Document

**Description:** This project is an AWS serverless application that
allows a user to come to a static website, purchase a product from
"Tristan Cooper Consulting" and receive an email confirmation of their
purchase.

**Video Demo:**

-   Short summary:

-   Longer, in depth, overview:

**Github:** https://github.com/tricooper/CSCIE90_Final

**Technologies used:**

-   **AWS S3** to serve a static website

-   [**Stripe Checkout**](https://stripe.com/payments/checkout) to
    process the transactions on the website

-   **AWS DynamoDB** to pull product information to the website and to
    save the order history

-   **AWS API Gateway** for an accessible HTTP endpoint for the S3
    website and Stripe webhooks

-   **AWS Lambda** functions to process the application logic

-   **AWS Simple Email** Service to send a confirmation email to the
    customer

Architecture
Diagram:


![CSCIE90_Architecture](https://files.tristanlcooper.com/hubfs/CSCIE90_Architecture.png)

**Step by Step overview of Application Architecture:**

1.  **A visitor comes to the site
    (<http://tristancooper-simplewebsite.s3-website.us-east-2.amazonaws.com/>)**

    a.  On page load, a Javascript function on the S3 Website makes an
        Ajax request to the HTTP endpoint set up on API gateway. The API
        Gateway then triggers a Lambda function which scans the Dynamo
        DB "Product Library" table and returns all products that should
        be sold on that page.

    b.  The S3 Website consumes the response and renders the products on
        the page.

2.  **A visitor clicks on "checkout" for one of the products.**

    a.  On checkout, the Javascript on the S3 website runs a function to
        redirect to the appropriate checkout page hosted by Stripe.

3.  **The visitor inputs their credit card information and purchases the
    product.**

    a.  Stripe sends a webhook to an HTTP endpoint hosted on API
        Gateway. The endpoint then triggers an AWS Lambda function.

4.  **AWS Lambda Function**

    a.  When the lambda function is triggered, it consumes the data from
        the Stripe webhook and write to the "order-history" table in
        Dynamo DB to record the transaction.

    b.  Additionally, the Lambda function utilizes AWS Simple Email
        Service to send over a purchase confirmation email to the
        customer who purchased the product.

5.  **On success, the visitor is redirected to a Thank You page.**

**In-Depth explanation:**

For the steps above, here's a more in-depth explanation along with code
samples and implementation:

1.  **Visitor comes to the website**

> Explanation: When the visitor comes to the website, S3 serves up a
> static website using my "index.html" file as the root directory. On
> load, there is an Ajax call that hits my API Gateway endpoint. The API
> gateway then hits my AWS Lambda function "Get Products" which simply
> scans DynamoDB and returns all of the products in my product table.
>
> The idea behind the product table is that it could be updated from
> another source such as an inventory management software so that we
> ensure we only show products that are available.
>
> When the browser receives the response of "products", we are
> populating the data on the website with the product information by
> looping through the response and creating an HTML column. This is done
> using a combination of custom CSS and Bootstrap 3.
>
>

2.  **A visitor clicks on "checkout" for one of the products**

Explanation: When a visitor clicks "checkout", the Stripe
"redirectToCheckout" function is run. This function is provided by
Stripe in their included Javascript file that's linked on the page. I
pass through the SKU ID (the unique identifier for the product) to
Stripe and it then triggers a redirect to the appropriate "checkout
page".

This checkout page is hosted by Stripe and allows the website visitor to
purchase the product that they clicked "checkout" from.

Stripe's "redirectToCheckout" function:


3.  **The visitor inputs their credit card information and purchases the
    product**

Explanation: Once on the checkout page hosted by Stripe, the person can
then input their credit card information and pay for the product. They
will then be redirected to a Thank You page on success, concurrently,
Stripe is configured to send a webhook whenever there is a successful
"checkout" event. Stripe sends this webhook data to my API Gateway
endpoint which triggers a lambda function

A note on Stripe implementation: I've set up a few different pieces in
Stripe to make this work that is worth mentioning even though it's
outside of AWS:

-   I've created Stripe "products" to match the products of my database:


-   Following Stripe's documentation for "[After the
    Payment](https://stripe.com/docs/payments/checkout/fulfillment)",
    I've configured a Stripe webhook to send data to API Gateway every
    time someone successfully checks out.


-   Because this is an example site and not to be used for actually
    processing payments, everything in Stripe is currently set to "test
    mode". As a result, you can use [Stripe's test
    cards](https://stripe.com/docs/testing) (under "Payment Intents
    API") to make a "payment" on any of the checkout pages.

4.  **AWS Lambda Function**

Explanation: Probably the most difficult part of this project was
setting up the Lambda function to accept the Stripe webhook and trigger
an email via SES as well as write to the "order-history" Dynamo DB
table.

The Lambda function will first accept the payload from Stripe's webhook
and then immediately make another request to Stripe to get the
customer's email address. For some reason, Stripe's webhook does not
include the customer's email address, so you need to make a subsequent
request using the "Customer ID" parameter to get the email.

Once we get the information back from Stripe, we have all of the
necessary information to send a personalized email and write to the
database: product purchased, total amount, email, order ID.

We build the Dynamo DB request and save this in the "Params" variable.
We then build the SES request and save this in the "sesParams" variable.
From there, we simply write this to the DynamoDB table to save the
order, then send the email confirmation over to the customer.


5.  **On success, the visitor is redirected to Thank You page**

Explanation: When Stripe receives a "200" response, the user is
redirected to the Thank You page.

**Try it out for yourself:**

-   Here's a link to the website on S3:
    <http://tristancooper-simplewebsite.s3-website.us-east-2.amazonaws.com/>

-   From here, click "checkout" on any of the products. Stripe is
    currently configured in test mode, meaning you can use Stripes "Test
    Cards" (see [here](https://stripe.com/docs/testing)) to input and
    authorize your test "payment".

-   **Important note:** Because of email authentication, you will not
    receive an AWS SES email if you choose to test it. I have not taken
    additional steps to set up DKIM on my SES account.
