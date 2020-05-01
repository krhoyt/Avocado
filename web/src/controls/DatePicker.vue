<template>
  <Box
    class="date">

    <Label 
      v-if="label" 
      color="#393939" 
      cursor="default"
      :size="12" 
      :margin-bottom="helper === null ? 6 : 8">{{label}}</Label>
    <Label 
      v-if="helper" 
      color="#6f6f6f" 
      :size="12" 
      :margin-bottom="6" 
      :margin-top="-6">{{helper}}</Label>

    <input 
      :class="{light: isLight}"
      @input="$emit( 'input', $event.target.value )"      
      :readonly="readonly"
      :style="style"
      :title="title"
      type="date"
      :value="value">

  </Box>
</template>

<script>
import Box from '../containers/Box.vue';
import Label from './Label.vue';

export default {
  name: 'DatePicker',
  components: {
    Box,
    Label
  },
  props: {
    helper: {type: String, default: null},
    label: {type: String, default: null},
    readonly: {type: Boolean, default: false},
    theme: {type: String, default: 'default'},
    title: {type: String, default: null},
    width: {type: Number, default: null},
    value: {type: String, default: null}
  },
  computed: {
    isLight: function() {
      return this.theme === 'light' ? true : false;
    },
    style: function() {
      return `
        width: ${this.width === null ? 'auto' : ( this.width + 'px' )};      
      `;
    }
  }
}
</script>

<style scoped>
div.date input[type="date"] {
  background: none;  
  background-image: url( /img/calendar.svg );
  background-position: right 16px center;
  background-repeat: no-repeat;
  background-size: 16px;
  border: none;
  border-bottom: solid 1px #8d8d8d;
  color: #161616;
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 14px;
  font-weight: 400;
  height: 39px;
  margin: 0 0 19px 0;
  min-width: 115px;
  outline: solid 2px transparent;
  outline-offset: -2px;
  padding: 0 40px 0 16px;
  position: relative;
}

div.date input[type="date"]:focus {
  outline: solid 2px #0f62fe;
}

div.date input[type="date"].light {
  background-color: white;
}

input[type="date"]:after {
    background: none;
    content: ' ';
}

input[type="date"]::-webkit-calendar-picker-indicator {
  cursor: pointer;  
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: auto;
    height: auto;
    color: transparent;
    background: transparent;
}

div.date input[type="date"]:read-only {
  background-image: none;
  border-bottom: solid 1px transparent;
  cursor: not-allowed;
  outline: none;  
}

div.date input[type="date"]:read-only:focus {
  border-bottom: solid 1px transparent;
  cursor: not-allowed;
  outline: none;  
}

input[type="date"]::-webkit-inner-spin-button {
  display: none;
}

input[type="date"]::-webkit-clear-button {
  display: none;
}
</style>
