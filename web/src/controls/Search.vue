<template>
  <Box
    background="#f4f4f4"
    direction="row">

    <input
      @input="$emit( 'input', $event.target.value )"    
      @keyup="change"
      :placeholder="placeholder"
      ref="input"
      :title="title"
      :value="value">      
    <button
      @click="clear"
      title="Clear"
      v-show="hasValue"/>

  </Box>
</template>

<script>
import Box from '../containers/Box.vue';

export default {
  name: 'Search',
  components: {
    Box
  },
  props: {
    placeholder: {type: String, default: 'Search'},
    title: {type: String, default: 'Search'},
    value: {type: String, default: null}
  },
  computed: {
    hasValue: function() {
      let result = false;

      if( this.value !== null ) {
        if( this.value.trim().length > 0 ) {
          result = true;
        }
      }

      return result; 
    }
  },
  methods: {
    clear: function() {
      this.$emit( 'clear' );
      this.$refs.input.focus();      
    },
    change: function() {
      this.$emit( 
        'change', 
        this.value.trim().length === 0 ? null : this.value 
      );
    }
  }
}
</script>

<style scoped>
button {
  background: none;
  background-image: url( /img/clear.svg );
  background-position: center;
  background-repeat: no-repeat;
  background-size: 20px;
  border: none;
  cursor: pointer;
  height: 47px;
  position: absolute;
  right: 0;
  top: 0;
  width: 47px;
}

/*
button:hover {
  background-color: #e5e5e5;
}
*/

img {
  cursor: text;
  left: 24px;
  position: absolute;
  top: 24px;
  transform: translate( -50%, -50% );
}

input {
  background: none;
  background-image: url( /img/search.svg );
  background-position: left 14px center;
  background-repeat: no-repeat;
  background-size: 20px;
  border: none;
  color: #161616;
  flex-basis: 0;
  flex-grow: 1;
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 14px;
  font-weight: 400;
  height: 47px;
  line-height: 45px;
  margin: 0;
  outline: solid 2px transparent;
  outline-offset: -2px;
  padding: 0 64px 0 47px;
}

input:focus {
  outline: solid 2px #0f62fe;
}

input::placeholder {
  color: #a8a8a8;
  font-size: 14px;
  font-weight: 400;
}      
</style>
