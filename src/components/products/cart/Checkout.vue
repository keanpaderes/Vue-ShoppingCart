<template>
  <div class="cart-products">
    <div class="row mt-5">
      <div class="col-sm-8">
        <form id="shipping">
          <p v-if="errors.length">
                  <b>Please correct the following error(s):</b>
                  <ul>
                    <li v-for="error in errors" :key="error">{{ error }}</li>
                  </ul>
          </p>
          <div class="form-group">
            <label for="address1">Address 1</label>
            <input
              type="text"
              class="form-control"
              id="address1"
              v-model="address1"
              name="address1"
              placeholder="Enter Address 1"
            >
          </div>
          <div class="form-group">
            <label for="address2">Address 2</label>
            <input
              type="text"
              class="form-control"
              id="address2"
              placeholder="Enter Address 2"
              v-model="address2"
            >
          </div>
          <div class="form-group">
            <label for="city">City</label>
            <input
              type="text"
              class="form-control"
              id="city"
              placeholder="Enter City"
              v-model="city"
            >
          </div>
          <div class="row">
            <div class="col">
              <div class="form-group">
                <label for="zipcode">Zip code</label>
                <input
                  type="text"
                  class="form-control"
                  id="zipcode"
                  v-model="zipcode"
                  placeholder="Enter Zip Code"
                >
              </div>
            </div>
          </div>
          <small
            id="emailHelp"
            class="form-text text-muted"
          >We'll never share your data with anyone else.</small>
          <br>
        </form>
      </div>
      <div class="col-sm-4">
        <cart-calculator ref="cartCalculator"></cart-calculator>
        <ul class="list-group mb-3">
          <button
            class="btn btn-success mt-2 text-white"
            type="submit"
            @click.prevent="createShippingDetail"
          >Submit order</button>
          <!-- <router-link to="/products" class="btn btn-primary mt-2 text-white">Continue Shopping</router-link> -->
          <!-- <a
            href="javascript:;;"
            class="btn btn-success mt-2 text-white"
            type="submit"
          >Save & Pay</a> -->
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions, mapMutations } from "vuex";
import CartCalculator from "./CartCalculator";
import axios from "axios";
import { errorToaster, successToaster } from "../../shared/service/ErrorHandler.js";
import gql from 'graphql-tag';

export default {
  name: "Checkout",
  components: { CartCalculator },
  data() {
    return {
      errors: [],
      address1: "",
      address2: "",
      city: "",
      zipcode: ""
    };
  },
  apollo: {
    sd_shipping_details: gql`query {
      sd_shipping_details {
        id
        address1
        address2
        city
        date
        total
        product_ids
        zipcode
      }
    }`,
  },
  methods: {
    ...mapMutations(["EMPTY_CART_LOCAL"]),
    createShippingDetail(e) {
      this.errors = []
      const { address1, address2, city, zipcode } = this;
      const { productIds, totalValue } = this.$refs.cartCalculator;
      // Error checking
      if (!address1 && !address2) this.errors.push("Address required.")
      if (!city) this.errors.push("City information required.")
      if (!zipcode) this.errors.push("Zip code information required.")

      // Runs mutation
      this.$apollo.mutate({
          mutation: gql`mutation insert_sd_shipping_details($address1: String!, $address2: String!, $city: String!, $products: String!, $totalValue: String!, $zipcode: String!) {
            insert_sd_shipping_details(objects: {address1: $address1, address2: $address2, city: $city, product_ids: $products, total: $totalValue, zipcode: $zipcode}) {
              returning {
                id
                date
              }
              affected_rows
            }
          }`,
          variables:{
            address1,
            address2,
            city,
            products: productIds,
            totalValue: totalValue.toString(),
            zipcode
          },
          update: (cache, {data:{insert_sd_shipping_details}}) => {
            successToaster("Inserted Successfully!", "Order Sent Successfully");
          }
        }
      );

      let v = this;
      setTimeout(function () {
        v.EMPTY_CART_LOCAL();
        v.$router.push({
          name: "home"
        });
      }, 1000);

      e.preventDefault();
    }
  }
};
</script>

<style lang="scss">
.cart-products {
  div {
    text-align: start;
  }
  #productCU {
    div {
      text-align: start;
    }
    button {
      text-align: center;
    }
  }
}
</style>
