<template>
  <div class="product-details">
    <div class="container">
      <div class="row mb-3">
        <div class="col-sm-4">
          <div class="product-image">
            <div class="view hm-zoom z-depth-2" style="cursor: pointer">
              <img
                v-bind:src="pr_products[0].image"
                v-bind:alt="pr_products[0].name"
                class="img-fluid rounded"
                style="max-height: 700px; max-width: 127.135px;margin: auto"
              >
            </div>
            <div class style="margin-top:15px">
              <ul class="list-group mb-3">
                <li class="list-group-item d-flex justify-content-between lh-condensed">
                  <div>
                    <h6 class="my-0">Product Price</h6>
                  </div>
                  <span
                    class="text-muted"
                  >₱ {{pr_products[0].price}}</span>
                </li>
                <li class="list-group-item d-flex justify-content-between lh-condensed">
                  <div>
                    <h6 class="my-0">Product Seller</h6>
                  </div>
                  <span
                    class="text-muted"
                  >{{pr_products[0].seller}}</span>
                </li>
              </ul>
              <button class="btn btn-primary" v-on:click="addToCart(pr_products[0])">Add to Cart</button>
            </div>
          </div>
        </div>
        <div class="col-sm-8">
          <div class="product-detail">
            <h5 class="product-head">Product Details</h5>
            <table class="table" cellspacing="0" style="max-height: 28px">
              <tbody>
                <tr>
                  <th scope="row">Product Name</th>
                  <td>{{pr_products[0].name}}</td>
                </tr>
                <tr>
                  <th scope="row">Product Description</th>
                  <td>{{pr_products[0].description}}</td>
                </tr>
                <tr>
                  <th scope="row">Product Category</th>
                  <td>{{pr_products[0].category}}</td>
                </tr>
                <tr>
                  <th scope="row">Product Rating</th>
                  <td>
                    <div class="stars-outer">
                      <div class="stars-inner"></div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <nav aria-label="breadcrumb ">
        <ol class="breadcrumb">
          <li class="breadcrumb-item active" aria-current="page">Similar Products</li>
        </ol>
      </nav>
      <div class="row">
        <div class="col-md-3 mt-3" v-for="(item, index) in similarProduct" :key="index">
          <card-template :item="item"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { mapState, mapActions, mapMutations } from "vuex";
import CardTemplate from "../shared/CardTemplate";
import { errorToaster } from "../../components/shared/service/ErrorHandler.js";
import gql from 'graphql-tag';

export default {
  name: "productDetail",
  data() {
    return {
      product: new Object(),
      similarProduct: [],
    };
  },
  apollo: {
    pr_products: {
      query: gql`query pr_products($id: Int!){
        pr_products(where: {id: {_eq: $id}}) {
          id
          category
          description
          image
          name
          price
          rating
          seller
        }
      }`,
      prefetch: ({ route }) => ({ id: route.params.id }),
      variables() {
        return { id: parseInt(this.$route.params.id) }
      }
    },
  },
  components: { CardTemplate },
  methods: {
    getSimilarProduct(productSeller) {
      axios
        .get(`${process.env.VUE_APP_BASE_URL}/products/similarProduct`, {
          params: { productSeller: productSeller }
        })
        .then(response => {
          this.similarProduct = response.data;
        })
        .catch(error => {
          console.log(error);
        });
    },
    ...mapMutations(["ADD_CART_LOCAL"]),
    addToCart(product) {
      this.ADD_CART_LOCAL(product);
    }
  },
  mounted() {
    console.log(this.$apollo.queries.pr_products[0].rating);
    const starTotal = 5;
    const starPercentage =
      (Number(this.$apollo.queries.pr_products[0].rating) / starTotal) * 100;
    // 3
    const starPercentageRounded = `${Math.round(starPercentage / 10) *
      10}%`;
    // 4
    document.querySelector(
      `.stars-inner`
    ).style.width = starPercentageRounded;

    // Getting Similar Product
    this.getSimilarProduct(this.$apollo.queries.pr_products[0].seller);
  }
};
</script>

<style>
.product-detail {
  text-align: start;
}

.product-detail .product-head {
  padding: 10px;
  font-weight: 500;
}

.product-detail .table th {
  width: 152px;
}

.product-ship {
  height: 15rem;
}

.stars-outer {
  display: inline-block;
  position: relative;
  font-family: FontAwesome;
}

.stars-outer::before {
  content: "\f006 \f006 \f006 \f006 \f006";
}

.stars-inner {
  position: absolute;
  top: 0;
  left: 0;
  white-space: nowrap;
  overflow: hidden;
  width: 0;
}

.stars-inner::before {
  content: "\f005 \f005 \f005 \f005 \f005";
  color: #f8ce0b;
}
</style>
