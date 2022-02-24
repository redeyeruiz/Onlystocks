import { getCookie, setCookie } from "./util.js"

if ( document.readyState == 'loading') {
    document.addEventListener('DOMContentLoaded', ready)
} else{
    ready()
}


var stripeHandler = StripeCheckout.configure({
    key: stripePublicKey,
    local: 'auto',
    token: function(token) {

    }
})

function ready(){
    var addToCartButtons = document.getElementsByClassName("add-to-cart")

    for (var i = 0; i< addToCartButtons.length; i++){
        var button = addToCartButtons[i]
        button.addEventListener('click', addToCart)
    }
    
}

function purchaseClicked() {
    var priceElement = document.getElementsByClassName('price')[0]
    var stripreHandler = parseFloat(priceElement.innerText.replace('$','')) * 100
    stripeHandler.open({
        amount: price
    })
}

function addToCart(event){
    var buttonClicked = event.target
    var itemId = buttonClicked.id.replace('_','')
    var cart = getCookie('cart')
    if (cart.includes(itemId)) return
    cart = cart + '_' + itemId
    setCookie('cart', cart, 1)
    console.log(cart)
}

