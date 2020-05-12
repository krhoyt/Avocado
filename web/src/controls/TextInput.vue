<template>
  <Box 
    :basis="0"
    :grow="grow">

    <Label 
      color="#393939" 
      cursor="default"
      :disabled="disabled"
      :margin-bottom="helper === null ? 6 : 8"
      :size="12"       
      v-show="label">
      {{label}}
    </Label>
    <Label 
      color="#6f6f6f" 
      :disabled="disabled"
      :margin-bottom="6" 
      :margin-top="-6"
      :size="12"       
      v-show="helper">
      {{helper}}
    </Label>
    
    <input
      :class="{error: isError, default: isDefault, light: isLight}"       
      :disabled="disabled"
      @keydown.enter="$emit( 'enter', $event.target.value )"
      @input="$emit( 'input', $event.target.value )"
      :placeholder="placeholder"       
      :readonly="readonly"    
      ref="input"  
      :style="style"
      :title="title"
      :type="type"
      :value="value">
    
    <Label 
      :class="{error: isError}"
      color="#da1e28" 
      :margin-top="4"      
      :size="12"
      v-show="error">
      {{error}}
    </Label>
      
  </Box>  
</template>

<script>
import Box from '../containers/Box.vue';
import Label from './Label.vue';

export default {
  name: 'TextInput',
  components: {
    Box,
    Label
  },
  props: {
    disabled: {default: false, type: Boolean},
    error: {default: null, type: String},
    grow: {default: 1, type: Number},
    helper: {default: null, type: String},
    label: {default: null, type: String},
    placeholder: {default: null, type: String},
    readonly: {default: false, type: Boolean},
    theme: {default: 'default', type: String},
    title: {default: null, type: String},
    type: {default: 'text', type: String},
    value: {default: null, type: String},
    width: {default: null, type: Number}
  },
  computed: {
    isError: function() {
      return this.error === null ? false : true;
    },
    isDefault: function() {
      return this.theme === 'default' ? true : false;
    },
    isLight: function() {
      return this.theme === 'light' ? true : false;
    },
    style: function() {
      return `
        width: ${this.width === null ? 'auto' : ( this.width + 'px' )}
      `;
    }
  },
  methods: {
    focus: function() {
      this.$refs.input.focus();
    }
  }
}
</script>

<style scoped>
input {
  border: none;
  box-sizing: border-box;
  border-bottom: solid 1px #8d8d8d;
  color: #161616;
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 14px;
  font-weight: 400;
  height: 40px;
  line-height: 20px;
  margin: 0 0 19px 0;
  outline: solid 2px transparent;
  outline-offset: -2px;
  padding: 0 16px 0 16px;
}

input.default {
  background-color: #f4f4f4;
}

input.light {
  background-color: #ffffff;
}

input:focus {
  outline: solid 2px #0f62fe;
}

input:disabled {
  border-bottom: solid 1px transparent;
  color: #c6c6c6;
  cursor: not-allowed;
  outline: none;
}

input:read-only {
  border-bottom: solid 1px transparent;
  cursor: not-allowed;
  outline: none;  
}

input::placeholder {
  color: #a8a8a8;
  font-size: 14px;
  font-weight: 400;
}      

input.error {
  background-image: url( /img/warning.svg );
  background-position: right 16px center;
  background-repeat: no-repeat;
  background-size: 20px;
  margin: 0;
  outline: solid 2px #da1e28;
  padding: 0 52px 0 16px;
}
</style>
