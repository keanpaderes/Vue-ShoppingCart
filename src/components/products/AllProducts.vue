<template>
  <div class="all-products">
    <div class="row">
      <card-loader :loopCount="4" v-if="$apollo.loading"/>
      <div class="col-md-3" v-for="(item, index) in pr_products" :key="index">
        <card-template :item="item"/>
      </div>
    </div>
    <edit-product ref="editProduct"/>
  </div>
</template>

<script>
import axios from "axios";
import { errorToaster } from "../shared/service/ErrorHandler";
import CardLoader from "../shared/CardLoader";
import CardTemplate from "../shared/CardTemplate";
import EditProduct from "./actions/EditProduct";
import gql from 'graphql-tag';

export default {
  name: "AllProducts",
  apollo: {
    pr_products: gql`query  {
      pr_products {
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
  },
  components: { CardLoader, CardTemplate, EditProduct },
  data() {
    return {
      allProducts: []
    };
  },
  methods: {
    //manadatory function called from cardTemplate
    editProduct(product) {
      this.$refs.editProduct.setProduct(product);
    },
  },
  mounted() {
    console.log(this.$apollo.queries.pr_products);
  }
};
</script>

<style>
.card {
  height: 490px;
}
.card-text {
  height: 70px;
  overflow: hidden;
}
</style>
