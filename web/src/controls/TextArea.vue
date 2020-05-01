<template>
  <Box 
    :grow="1">

    <Label 
      color="#393939" 
      :margin-bottom="helper === null ? 6 : 8"
      :size="12"       
      v-show="label">
      {{label}}
    </Label>
    <Label   
      color="#6f6f6f" 
      :margin-bottom="6" 
      :margin-top="-6"
      :size="12"       
      v-if="helper">
      {{helper}}
    </Label>
    
    <textarea
      :class="{error: isError, default: isDefault, light: isLight}"
      :disabled="disabled"      
      @input="$emit( 'input', $event.target.value )"
      :placeholder="placeholder" 
      :readonly="readonly"
      :title="title"
      :value="value">
    </textarea>
    
    <Label 
      v-if="error" 
      color="#da1e28" 
      :margin-top="4"
      :size="12">
      {{error}}
    </Label>
      
  </Box>  
</template>

<script>
import Box from '../containers/Box.vue';
import Label from './Label.vue';

export default {
  name: 'TextArea',
  components: {
    Box,
    Label
  },
  props: {
    disabled: {default: false, type: Boolean},
    error: {default: null, type: String},
    helper: {default: null, type: String},
    label: {default: null, type: String},
    placeholder: {default: null, type: String},
    readonly: {default: false, type: Boolean},
    theme: {default: 'default', type: String},
    title: {default: null, type: String},
    value: {default: null, type: String}
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
    }
  },
  methods: {
    change: function( evt ) {
      const value = evt.currentTarget.value;

      this.$emit( 
        'change',
        value.trim().length === 0 ? null : value
      );
    }
  }
}
</script>

<style scoped>
textarea {
  border: none;
  border-bottom: solid 1px #8d8d8d;
  color: #161616;
  flex-basis: 0;
  flex-grow: 1;
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.25rem;
  margin: 0 0 19px 0;
  min-height: 39px;
  outline: solid 2px transparent;
  outline-offset: -2px;
  padding: 11px 40px 11px 16px;
  resize: none;
}

textarea.default {
  background-color: #f4f4f4;
}

textarea.light {
  background-color: #ffffff;
}

textarea:focus {
  outline: solid 2px #0f62fe;
}

textarea:disabled {
  border-bottom: solid 1px transparent;
  color: #c6c6c6;
  cursor: not-allowed;
  outline: none;
}

textarea:read-only {
  border-bottom: solid 1px transparent;
  cursor: not-allowed;
  outline: none;  
}

textarea::placeholder {
  color: #a8a8a8;
  font-size: 14px;
  font-weight: 400;
}      

textarea.error {
  background-image: url( /img/warning.svg );
  background-position: right 16px top 16px;
  background-repeat: no-repeat;
  background-size: 20px;
  margin: 0;
  outline: solid 2px #da1e28;
}
</style>
