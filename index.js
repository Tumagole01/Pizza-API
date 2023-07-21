document.addEventListener('alpine:init', () => {
    Alpine.data('pizzaCart', () => {
        return {
            title: 'Perfect Pizza Cart',
            pizzas: [],
            username: '',
            cartId: '',
            cartPizzas: [],
            cartTotal: 0.00,
            paymentAmount: 0,
            message: '',
            change: '',
            isUser: false,
            openCart: false,
            filterVal: '',
            feature: [],

            getFeatured() {
                const getURL = `https://pizza-api.projectcodex.net/api/pizzas/featured?username=user`;
                axios
                    .get(getURL)
                    .then(result => {
                        console.log(result.data)
                        this.feature = result.data.pizzas
                    })
            },

            login() {
                if (this.username.length > 2) {
                    localStorage['username'] = this.username;
                    this.createCart();
                    this.fetchPizzaMenu();
                    this.isUser = true;
                } else {
                    alert("username is too short");
                }

            },

            filter(size) {
                axios.get('https://pizza-api.projectcodex.net/api/pizzas')
                    .then(result => {
                        // code here
                        const filteredList = result.data.pizzas.filter((pizza) => pizza.size === this.filterVal)
                        this.pizzas = filteredList;
                    });
            },

            logout() {
                if (confirm('Do you want to logout?')) {
                    this.username = '';
                    this.cartId = '';
                    localStorage['cartId'] = '';
                    localStorage['username'] = '';
                    this.isUser = false;
                }

            },


            createCart() {

                if (!this.username) {
                    //this.cartId = 'No username to create a cart for'
                    return;
                }


                const cartId = localStorage['cartId'];

                if (cartId) {
                    this.cartId = cartId;
                    return Promise.resolve()
                } else {
                    const createCartURL = `https://pizza-api.projectcodex.net/api/pizza-cart/create?username=${this.username}`
                    return axios.get(createCartURL)
                        .then(result => {
                            this.cartId = result.data.cart_code;
                            localStorage['cartId'] = this.cartId;
                        });
                }

            },

            getCart() {
                const getCartURL = `https://pizza-api.projectcodex.net/api/pizza-cart/${this.cartId}/get`
                return axios.get(getCartURL);
            },

            addPizza(pizzaId) {
                return axios.post('https://pizza-api.projectcodex.net/api/pizza-cart/add', {
                    "cart_code": this.cartId,
                    "pizza_id": pizzaId
                })
            },

            removePizza(pizzaId) {
                return axios.post('https://pizza-api.projectcodex.net/api/pizza-cart/remove', {
                    "cart_code": this.cartId,
                    "pizza_id": pizzaId
                })
            },

            pay(amount) {
                return axios.post('https://pizza-api.projectcodex.net/api/pizza-cart/pay',
                    {
                        "cart_code": this.cartId,
                        amount
                    })
            },

            showCartData() {
                this.getCart().then(result => {
                    const cartData = result.data;
                    this.cartPizzas = cartData.pizzas;
                    this.cartTotal = cartData.total.toFixed(2);
                    //alert(this.cartTotal);
                });
            },

            fetchPizzaMenu() {
                axios
                    .get('https://pizza-api.projectcodex.net/api/pizzas')
                    .then(result => {
                        // code here
                        //console.log(result.data);
                        this.pizzas = result.data.pizzas
                    });

            },

            init() {
                const storedUsername = localStorage['username'];
                const storedCartId = localStorage['cartId'];
                if (storedUsername && storedCartId) {
                    this.username = localStorage['username'];
                    this.createCart()
                        .then(() => {
                            this.showCartData();
                            this.isUser = true;
                            this.fetchPizzaMenu();
                        })
                }

                this.getFeatured();



                // if (this.cartId) {

                // }
            },

            addPizzaToCart(pizzaId) {
                //alert(pizzaId)
                this
                    .addPizza(pizzaId)
                    .then(() => {
                        this.showCartData();
                    })
            },

            removePizzaFromCart(pizzaId) {
                //alert(pizzaId)
                this
                    .removePizza(pizzaId)
                    .then(() => {
                        this.showCartData();
                    })
            },

            payForCart() {
                //alert("Pay Now!" + this.paymentAmount)
                this.pay(this.paymentAmount)
                    .then(result => {
                        if (result.data.status == 'failure') {
                            this.message = result.data.message;
                            this.change = 'You need R' + (this.cartTotal - this.paymentAmount).toFixed(2);
                            setTimeout(() =>
                            { this.message = '';
                            this.change = '';
                        }, 3000);
                        } else {
                            this.change = 'Your change is R' + (this.paymentAmount - this.cartTotal).toFixed(2);
                            this.message = 'Payment successful! Enjoy your pizza😜!';

                            setTimeout(() => {
                                this.message = '';
                                this.cartPizzas = [];
                                this.cartTotal = 0.00
                                this.cartId = '';
                                this.change = '';
                                this.paymentAmount = 0.00;
                                localStorage['cartId'] = '';
                                this.createCart();
                            }, 6000);
                        }
                    })
            },

            pizzaImage(pizza) {
                return `Pizza Medium.png`
            }

        }
    })
})