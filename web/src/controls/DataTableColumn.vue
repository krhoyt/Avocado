<template>
  <button
    :style="style">
    {{text}}
  </button>
</template>

<script>
import Label from './Label.vue';

export default {
  name: 'DataTableColumn',
  components: {
    Label
  },
  props: {
    field: {type: String, default: null},
    grow: {type: Number, default: null},
    text: {type: String, default: null},
    width: {type: Number, default: null}
  },
  computed: {
    style: function() {
      return {
        flexGrow: this.width === null ? 1 : '',
        minWidth: this.width === null ? '' : ( this.width + 'px' )
      };
    }
  }
}
</script>

<style scoped>
button {
  appearance: none;
  background: none;
  border: none;
  box-sizing: border-box;
  color: #161616;
  flex-basis: 0;
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 14px;
  font-weight: 600;
  height: 47px;
  outline: none;
  padding-left: 16px;
  padding-right: 16px;
  text-align: left;
}
</style>
