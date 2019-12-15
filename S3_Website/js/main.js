
const stripe = Stripe('pk_test_680xSaAOGNoHZ0THwtrimPyC00wbdmt02S');


$.ajax({
  url: "https://16lkjag7kg.execute-api.us-east-2.amazonaws.com/getProducts",
  headers: "{'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}",
  crossDomain: true,
  type: 'GET',

}).done((result) => {

  $.each(result.Items, (index, item) => {
    let amount = item.amount;
    let image = item.image;
    let sku = item.sku;
    let name = item.productName;
    let html = `<div class="item  col-xs-4 col-lg-4">
        <div class="thumbnail">
            <img class="group list-group-image" src="${image}" alt="" />
            <div class="caption">
                <h4 class="group inner list-group-item-heading">
                    ${name}</h4>
                <div class="row">
                    <div class="col-xs-12 col-md-6">
                        <p class="lead">
                            $${amount}</p>
                    </div>
                    <div class="col-xs-12 col-md-6">
                        <a class="btn btn-success checkout-button" id="${sku}" href="javaScript:void(0);">Checkout</a>
                    </div>
                </div>
            </div>
        </div>
    </div>`
    $("#products").append(html);
  })
  $(".checkout-button").on('click', (event) => {
    console.log(event.target.id);
    stripeRedirect(event.target.id)
  });
});



var stripeRedirect = (sku) => {
  stripe.redirectToCheckout({
  items: [
    // Replace with the ID of your SKU
    {sku: sku, quantity: 1}
  ],
  successUrl: 'http://tristancooper-simplewebsite.s3-website.us-east-2.amazonaws.com/thankyou.html',
  cancelUrl: 'http://tristancooper-simplewebsite.s3-website.us-east-2.amazonaws.com/thankyou.html',
  }).then(function (result) {
  // If `redirectToCheckout` fails due to a browser or network
  // error, display the localized error message to your customer
  // using `result.error.message`.
  });
}
