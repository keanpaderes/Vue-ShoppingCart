<template>
  <div class="cart-calculator">
    <h4 class="d-flex justify-content-between align-items-center mb-3">
      <span class="text-muted">Your cart</span>
      <span class="badge badge-primary badge-pill">{{cartProducts.length}}</span>
    </h4>
    <ul class="list-group mb-3">
      <li
        class="list-group-item d-flex justify-content-between lh-condensed"
        v-for="(product, index) in cartProducts"
        :key="index"
      >
        <div>
          <h6 class="my-0">{{product.name}}</h6>
        </div>
        <span class="text-muted" style="width:120px">₱ {{product.price}}</span>
      </li>
      <hr>
      <li class="list-group-item d-flex justify-content-between">
        <span>Total (PHP)</span>
        <strong>₱ {{totalValue.toFixed(2)}}</strong>
      </li>
    </ul>
  </div>
</template>
<script>
import { mapState, mapActions, mapMutations } from "vuex";
export default {
  name: "cartCalculator",
  data() {
    return {
      totalValue: 0.0,
      productIds: ""
    };
  },
  computed: mapState(["cartProducts"]),
  methods: {
    calulateTotalPrice() {
      this.totalValue = 0;
      const ids = [];
      this.cartProducts.forEach(product => {
        ids.push(product.id);
        this.totalValue += parseFloat(product.price.replace(",", ""));
      });
      this.productIds = ids.join(",")
    }
  },
  created() {
    this.calulateTotalPrice();
  }
};
</script>
<style>
</style>
