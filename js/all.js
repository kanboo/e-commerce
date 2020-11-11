// axios.defaults.baseURL = 'http://localhost:3000/api';
axios.defaults.baseURL = 'https://endless-terra-285506.df.r.appspot.com/api';


const merchantProduct = {
  A01: {
    id: 'A01',
    name: "時尚外套",
    price: 100,
    specification: '',
    imageUrl: 'https://lh3.googleusercontent.com/gcqvjhReXqSEX-S6oTcmEKALKem4jC66KUO3m0YtDqRJoIHFTeCgR05HNxPbdh1OsPa4WyJ9iPPd_8kPCa7X52-qjUg9nx85_3y_Zw=s64'
  },
  A02: {
    id: 'A02',
    name: "秋冬外套",
    price: 200,
    specification: '',
    imageUrl: 'https://lh3.googleusercontent.com/rXRpsoMfReFxIJ1aj_6oysIB5tM8EQTZeDLw0nav8loPRobuovbwHemC--ykbyu0tXfWs1Ri2AtsWsrS0Q-daP1T_HypGXjl5y7aBg=s64'
  },
  A03: {
    id: 'A03',
    name: "禦寒外套",
    price: 300,
    specification: '',
    imageUrl: 'https://lh3.googleusercontent.com/Ts5Q3pC1q-KoHnSiPzCbyn0Ge25eTf6b24JuSd78DPhmYkOCVPoT6zrAczWREbkdAZRyUMj0EimreIi_8RoIqUHf36qcM-XLs1ifvg=s64'
  },
  A0401: {
    id: 'A0401',
    name: "長靴",
    price: 1000,
    specification: '黑',
    imageUrl: 'https://lh3.googleusercontent.com/UYAHysEMEN8mW-V24a27cD7a02rZzWyJG6lyFmcRcpiOw0UjzJ2Lu-t28gaFDb-0uNccpRoTCHFqj6tZl2OskNUfPKMAkjM2rSrEMks=s64'
  },
  A0402: {
    id: 'A0402',
    name: "長靴",
    price: 1000,
    specification: '咖啡',
    imageUrl: 'https://lh3.googleusercontent.com/UYAHysEMEN8mW-V24a27cD7a02rZzWyJG6lyFmcRcpiOw0UjzJ2Lu-t28gaFDb-0uNccpRoTCHFqj6tZl2OskNUfPKMAkjM2rSrEMks=s64'
  }
}

var app = new Vue({
  el: '#app',
  data: {
    merchantProduct: merchantProduct,

    handsupSessionToken: '',
    cartItems: {
      data: [],
      info: ''
    }
  },

  computed: {
    displayProduct() {
      const { data } = this.cartItems
      return data.reduce((prev, current) => {
        const items = current.skus.map(sku => {
          const machProduct = this.merchantProduct[sku.merchant_sku_id]
          return {
            ...machProduct,
            quantity: sku.quantity
          }
        })

        prev.push(...items)
        return prev
      }, [])
    },

    normalizeOrderItems() {
      const { data } = this.cartItems

      return data.reduce((prev, current) => {
        const items = current.skus.map(sku => {

          const machProduct = this.merchantProduct[sku.merchant_sku_id]

          return {
            "merchant_product_id": machProduct.id,
            "handsup_product_id": current.handsup_product_id,
            "product_name": machProduct.name,
            "merchant_sku_id": sku.merchant_sku_id,
            "handsup_sku_id": sku.handsup_sku_id,
            "sku_name": sku.sku_name,
            "price": sku.price,
            "quantity": sku.quantity,
            "info": ""
          }
        })

        prev.push(...items)

        return prev

      }, [])

    },

    calcTotalPrice() {
      return this.normalizeOrderItems.reduce((prev, current) => {
        return prev + (Number(current.price) * current.quantity)
      }, 0)
    }
  },

  created() {
    this.initData()
  },

  methods: {
    initData() {
      let url = new URL(window.location);
      if (url.searchParams.has("token")) {
        this.handsupSessionToken = url.searchParams.get("token");

        axios.get('/carts', {
          params: {
            session_token: this.handsupSessionToken
          }
        })
          .then((response) => {
            console.log(response)
            this.cartItems = response.data
          })
          .catch((error) => {
            console.log(error);
          })
      }
    },


    calcPostBack() {
      const orderInfo = {
        "order_id": "ORDER-" + new Date().getTime(),
        "buyer_name": "Kanboo",
        "buyer_email": "Kanboo@test.com",
        "buyer_phone": "0912345678",
        "buyer_country_code": "JP",
        "total_price": this.calcTotalPrice,
        "currency": "JPY",
        "session_token": this.handsupSessionToken,
        "created_at": new Date().toISOString(),
        "paid_at": new Date().toISOString(),
        "order_status": "completed",
        "info": "",
      }

      orderInfo.order_items = this.normalizeOrderItems

      return orderInfo
    },

    handleCheckout() {
      const orderInfo = this.calcPostBack()

      axios.post('/order-postback', { data: [orderInfo], info: '' })
        .then((response) => {
          alert('Data synced successfully')
          this.cartItems = {
            data: [],
            info: ''
          }
        })
        .catch((error) => {
          console.log(error);
        })
    }
  }
})