<template>
  <Box>

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

    <select
      @change="$emit( 'input', parseInt( $event.target.value ) )"
      :class="{error: isError, default: isDefault, light: isLight}"       
      :disabled="disabled"
      ref="input"
      :style="style"
      :title="title"
      v-show="!readonly"
      :value="value">
      <option
        :key="index"
        v-for="( item, index ) in options"
        :value="index">
        {{item[labelField]}}
      </option>
    </select>

    <Label
      :background="theme === 'light' ? '#ffffff' : '#f4f4f4'"
      :class="{readonly: readonly}"
      cursor="not-allowed"
      :height="40"
      :margin-bottom="19"
      :padding-left="16"  
      :padding-right="16"
      :style="style"
      :title="title"
      v-show="readonly">
      {{options.length > 0 ? options[value][labelField] : ''}}
    </Label>

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
  name: 'Select',
  components: {
    Box,
    Label
  },
  props: {
    disabled: {type: Boolean, default: false},
    error: {type: String, default: null},
    helper: {type: String, default: null},
    label: {type: String, default: null},
    labelField: {type: String, default: 'label'},
    options: {
      type: Array,
      default: function() {
        return [];
      }
    },    
    readonly: {type: Boolean, default: false},
    theme: {type: String, default: 'default'},
    title: {type: String, default: null},
    value: {type: Number, default: 0},
    width: {type: Number, default: null}
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
      return {
        boxSizing: 'border-box',
        minWidth: this.width === null ? 'auto' : ( this.width + 'px' ),
        width: this.width === null ? 'auto' : ( this.width + 'px' )
      };
    }
  }
}
</script>

<style scoped>
select {
  appearance: none;
  background: none;
  background-image: url( '/img/chevron.svg' );
  background-position: right 16px center;
  background-repeat: no-repeat;
  background-size: 16px;
  border: none;
  border-bottom: solid 1px #8d8d8d;
  border-radius: 0;
  color: #161616;
  cursor: pointer;
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 14px;
  font-weight: 400;
  height: 40px;
  margin: 0 0 19px 0;
  outline: solid 2px transparent;
  outline-offset: -2px;
  padding: 0 16px 0 16px;
}

select.default {
  background-color: #f4f4f4;
}

select.light {
  background-color: #ffffff;
}

select.light:hover {
  background-color: #e5e5e5;
}

select:focus {
  outline: solid 2px #0f62fe;
}

select:disabled {
  background-image: url( '/img/chevron-disabled.svg' );      
  border-bottom: solid 1px transparent;
  color: #c6c6c6;
  cursor: not-allowed;
  outline: none;
}

select.readonly {
  background-image: url( '/img/chevron-disabled.svg' );        
  border-bottom: solid 1px transparent;
  cursor: not-allowed;
  outline: none;  
}

select.readonly:hover {
  background-color: #ffffff;
}

select.error {
  background-image: url( /img/textinput/error.svg );
  background-position: right 16px center;
  background-repeat: no-repeat;
  background-size: 20px;
  margin: 0;
  outline: solid 2px #da1e28;
  padding: 0 52px 0 16px;
}

p.readonly {
  background-image: url( '/img/chevron-disabled.svg' );        
  background-position: right 16px center;
  background-repeat: no-repeat;
  background-size: 16px;  
}

.default {
  background-color: #f4f4f4;
}

.light {
  background-color: #ffffff;
}
</style>
