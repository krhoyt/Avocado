<template>
  <Box
    align="center"
    :background="backgroundColor"
    class="tag"
    :cursor="cursored"
    direction="row"
    :grow="0"
    :height="24"
    :margin-right="8"
    :margin-top="8"
    :style="style">
    <Label
      :color="foregroundColor"
      :cursor="cursored"
      :padding-left="8">
      <slot></slot>
    </Label>
    <button 
      v-show="!disabled"
      @click="$emit( 'remove' )">
    </button>
  </Box>
</template>

<script>
import Box from '../containers/Box.vue';
import Label from '../controls/Label.vue';

export default {
  name: 'Tag',
  components: {
    Box,
    Label
  },
  props: {
    background: {type: String, default: '#393939'},
    cursor: {type: String, default: null},
    disabled: {type: Boolean, default: false},
    foreground: {type: String, default: '#ffffff'}
  },
  computed: {
    backgroundColor: function() {
      let result = '#393939';

      if( this.disabled ) {
        if( this.background === null ) {
          result = '#e0e0e0';
        } else {
          result = this.background;
        }
      }

      return result;
    },
    cursored: function() {
      if( this.cursor !== null ) {
        return this.cursor;
      } else {
        if( this.disabled ) {
          return 'not-allowed';
        } else {
          return 'default';
        }
      }
    },
    foregroundColor: function() {
      let result = '#ffffff';

      if( this.disabled ) {
        if( this.foreground === null ) {
          result = '#161616';
        } else {
          result = this.foreground;
        }
      }

      return result;
    },    
    style: function() {
      return `
        padding-right: ${this.disabled ? ( 8 + 'px' ) : 0};
      `;
    }
  }
}
</script>

<style scoped>
.tag {
  border-radius: 12px;  
}

button {
  background: none;
  background-image: url( /img/close.svg );
  background-position: center;
  background-repeat: no-repeat;
  background-size: 14px;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  height: 20px;
  margin: 0 2px 0 4px;
  outline: none;
  padding: 0;
  transition: background-color 0.30s;
  width: 20px;  
}

button:hover {
  background-color: #4c4c4c;
}
</style>
