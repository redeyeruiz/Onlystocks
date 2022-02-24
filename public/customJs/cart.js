// alert("boot")
import { getCookie, setCookie } from "./util.js"
if ( document.readyState == 'loading') {
    document.addEventListener('DOMContentLoaded', ready)
} else{
    ready()
}

function ready(){
    var removeCartItemButtons = document.getElementsByClassName('btn-danger')


    for (var i = 0; i< removeCartItemButtons.length; i++){
        var button = removeCartItemButtons[i]
        button.addEventListener('click', removeCartItem)
    }

    var quantityInputs = document.getElementsByClassName('cart_count')
    for ( i = 0; i< quantityInputs.length; i++){
        var input = quantityInputs[i]
        input.addEventListener('change', quantityChanged)
    }

    var addToCartButtons = document.getElementsByClassName('shop-item-button')
    for ( i = 0; i< addToCartButtons.length; i++){
        button = addToCartButtons[i]
        
        // button.addEventListener('click', addToCartClicked)
    }
    var checkoutButton = document.getElementsByClassName('btn-checkout')
    checkoutButton[0].addEventListener('click', goToCheckout)
    updateCartTotal()

}

function goToCheckout(event){
    // var checkoutButton = event.target
    // console.log("Checkout")
    // var cookie = getCookie('nothing')
    // console.log(cookie.length == 0)

    var cart = getCookie('cart').split('_')
    if(cart.lenght != 0){
        cart.shift()
        
        var itemJsn =""
        var jsnCart ='{"items": ['
        for(let item in cart ){
            //console.log(typeof item)
            itemJsn = '{ "id":' + item + ',' + '"quantity":' + '1' + '},'
            jsnCart += itemJsn
        }
        jsnCart = jsnCart.slice(0,-1)
        jsnCart = jsnCart + ']}'

        //jsnCart = JSON.stringify(jsnCart)
        //var parsedJsonCart = JSON.parse(jsnCart)
        //console.log("item " + typeof jsnCart)

        
        //jsnCart = JSON.stringify(jsnCart)
        // console.log(parsedJsonCart)
        // console.log(typeof parsedJsonCart)
        
        fetch('/create-checkout-session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: jsnCart,
            })
              .then(res => {
                if (res.ok) return res.json()
                return res.json().then(json => Promise.reject(json))
              })
              .then(({ url }) => {
                  console.log(url)
                // window.location = url
              })
              .catch(e => {
                console.error(e.error)
              })
    }
    


    
}



function removeCartItem(event){
    var buttonClicked = event.target

    var itemId = buttonClicked.id.replace('_','')
    var cart = getCookie('cart')
    var itemCookie = '_'+itemId
    if (cart.includes(itemId)){
        cart = cart.replace(itemCookie,'')

    } 
    setCookie('cart', cart, 1)
    
    buttonClicked.parentElement.parentElement.remove()
    updateCartTotal()
}

function quantityChanged(event){
    var input = event.target
    if(isNaN(input.value) || input.value <= 0){
        input.value = 1
    }
    updateCartTotal()
}

function addToCartClicked(event){
    var button = event.target()
    var shopItem = button.parentElement.parentElement
    var title = shopItem.getElementsByClassName('shop-item-title')[0].innerText
    var price = shopItem.getElementsByClassName('shop-item-price')[0].innerText
    var imageSrc = shopItem.getElementsByClassName('shop-item-image')[0].src
    addItemTocart(title,price,imageSrc)
    // updateCartTotal()
}
function addItemTocart(title, price, imageSrc){
    var cartRow = document.createElement('tr')
    cartRow.classList.add('cart-row')
    var cartItems = document.getElementsByClassName('cart-items')[0]
    var cartItemNames = cartItems.getElementsByClassName('cart-item-title')
    for(var i = 0; i < cartItemNames.length; i++){
        if(cartItemNames[i].innerText == title){
            alert('this item has already been added to the cart')
            return
        }
    }
    var cartRowContents = `
        <th scope="row">
            <ul class="cart_list">
                <li class="list-inline-item pr15"><a href="#"><img src="/images/shop/close.png" alt="close.png"></a></li>
                <li class="list-inline-item pr20"><a href="#"><img src="/images/shop/shopping_cart.jpg" alt="shopping_cart.jpg"></a></li>
                <li class="list-inline-item"><a class="cart_title" href="#">Introduction Web Design <br> with HTML</a></li>
            </ul>
        </th>
        
        
        <td class="item-price" >$99.00</td>
        <td><input class="cart_count text-center" placeholder="4" type="number"></td>
        <td class="cart_total">$499.00</td>
        <td>
            <button class="btn btn-danger btn-sm t" type="button">REMOVE</button>
        </td>
    `
    cartRow.innerHTML = cartRowContents
    cartItems.appendChild(cartRow)
    cartRow.getElementsByClassName('btn-danger')[0].addEventListener('click', removeCartItem)
    cartRow.getElementsByClassName('cart-quantity-input')[0].add('change', quantityChanged)
}

function updateCartTotal(){
    var cartItemConatainer = document.getElementsByClassName("cart-items")[0]
    var cartRows = cartItemConatainer.getElementsByClassName('cart-row')
    var total = 0 
    // console.log(cartItemConatainer)
    for ( var i = 0; i< cartRows.length; i++){

        var cartRow = cartRows[i]
        var priceElement = cartRow.getElementsByClassName('item-price')[0]
        var quantityElement = cartRow.getElementsByClassName('cart_count')[0]
        var price = parseFloat(priceElement.innerText.replace('$',''))
        // var quantity = quantityElement.value
        var quantity = 1
        total = total +  (price * quantity)
        console.log(total)
        
        
    }
    total = Math.round(total * 100) / 100
    document.getElementsByClassName('total')[0].innerText = '$' + total
}
//  updateCartTotal()