<template>
  <Box
    :basis="0"
    :grow="1">

    <Label 
      color="#393939" 
      cursor="default"
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
      v-show="helper">
      {{helper}}
    </Label>

    <div 
      class="tagarea"
      :class="{
        error: isError, 
        default: isDefault, 
        light: isLight, 
        outlined: outlined,
        readonly: readonly
      }"
      @click="focus">

      <Tag  
        :background="tag.background"
        :disabled="readonly"
        :foreground="tag.foreground"
        :key="tag.id"
        @remove="close( tag.id )"
        v-for="tag in value">
        {{tag[labelField]}}
      </Tag>

      <input 
        @blur="blur"
        :disabled="disabled"        
        @focus="focus"
        @input="$emit( 'input', $event.target.value )"
        @keydown.delete="remove"
        @keydown.enter="enter"
        :placeholder="contents"
        :readonly="readonly"
        ref="field"
        v-model="content"
        v-show="!disabled && !readonly"/>

      <!-- TODO: Make an actual menu component -->
      <!-- TODO: Limit the length of the menu -->
      <!-- TODO: Move menu to input field -->
      <Box 
        class="menu"
        position="absolute"
        v-show="hasContent">
        <button 
          @click="selected( item )"
          :key="item.id"
          v-for="item in matches">
          {{item[labelField]}}
        </button>
      </Box>                

    </div>

    <Label 
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
import Tag from './Tag.vue';

export default {
  name: 'TagInput',
  components: {
    Box,
    Label,
    Tag
  },
  data: function() {
    return {
      content: null,
      outlined: false
    };
  },
  props: {
    // TODO: Distinct error messages 
    count: {default: 5, type: Number},
    disabled: {default: false, type: Boolean},
    error: {default: null, type: String},
    helper: {default: null, type: String},
    label: {default: null, type: String},
    limit: {default: false, type: Boolean},
    labelField: {default: 'label', type: String},
    menu: {
      type: Array,
      default: function() {
        return [];
      }
    },
    menuLength: {default: 1, type: Number},
    placeholder: {default: null, type: String},
    readonly: {default: false, type: Boolean},
    theme: {default: 'default', type: String},
    value: {
      type: Array,
      default: function() {
        return [];
      }
    },     
  },
  computed: {
    contents: function() {
      let result = this.placeholder;

      if( this.readonly ) {
        if( this.value !== null ) {
          if( this.value.length > 0 ) {
            result = null;
          }
        }
      }

      return result;
    },
    hasContent: function() {
      let result = false;

      if( this.content !== null ) {
        if( this.content.trim().length >= this.menuLength ) {
          result = true;
        }
      }
      
      return result;
    },
    isError: function() {
      return this.error === null ? false : true;
    },
    isDefault: function() {
      return this.theme === 'default' ? true : false;
    },    
    isLight: function() {
      return this.theme === 'light' ? true : false;
    },
    matches: function() {      
      let content = this.content;
      let labelField = this.labelField;

      if( content === null ) {
        content = '';
      } else {
        content = content.trim().toLowerCase();
      }

      return this.menu.filter( function( item ) {
        return item[labelField].toLowerCase().indexOf( content ) >= 0 ? true : false;
      } ).slice( 0, this.count );      
    }
  },
  methods: {
    blur: function() {
      if( !this.hasContent ) {
        this.outlined = false;
        this.content = null;
      }
    },
    close: function( id ) {
      for( let v = 0; v < this.value.length; v++ ) {
        if( this.value[v].id === id ) {
          this.value.splice( v, 1 );
          break;
        }
      }
    },
    enter: function() {
      if( this.limit ) {
        return;
      }

      if( this.content === null ) {
        return;
      }

      if( this.content.trim().length > 0 ) {
        let found = false;
        let value = this.content.trim();

        for( let v = 0; v < this.value.length; v++ ) {
          if( this.value[v][this.labelField] === value ) {
            found = true;
            this.$emit( 'duplicate' );
            break;
          }
        }

        if( !found ) {
          let tag = {
            id: 'new-' + value.toLowerCase()
          };

          tag[this.labelField] = value;                    
          this.value.push( tag );

          this.content = '';          
        }
      }
    },
    focus: function() {
      if( !this.readonly ) {
        this.outlined = true;
        this.$refs.field.focus();
      }
    },
    remove: function( evt ) {
      if( this.$refs.field.value.trim().length === 0 ) {
        if( this.value.length > 0 ) {
          this.value.pop();
        }
      }
    },
    selected: function( item ) {
      let found = false;

      for( let v = 0; v < this.value.length; v++ ) {
        if( this.value[v][this.labelField] === item[this.labelField] ) {
          found = true;
        }
      }

      if( !found ) {
        this.value.push( item );
        this.$emit( 'change', {
          value: this.value,
          item: item
        } );
      }

      this.content = null;
      this.focus();      
    }
  }
}
</script>

<style scoped>
div.tagarea {
  border-bottom: solid 1px #8d8d8d;  
  cursor: text;
  display: flex;
  flex-basis: 0;
  flex-direction: row;
  flex-grow: 1;
  margin: 0 0 19px 0;
  min-height: 40px;
  outline: solid 2px transparent;  
  outline-offset: -2px;
  padding: 0 0 0 16px;
  position: relative;
}

div.tagarea.default {
  background-color: #f4f4f4;
}

div.tagarea.light {
  background-color: #ffffff;
}

div.tagarea.outlined {
  outline: solid 2px #0f62fe;
}

div.tagarea.error {
  background-image: url( /img/textinput/error.svg );
  background-position: right 16px top 16px;
  background-repeat: no-repeat;
  background-size: 20px;
  margin: 0;
  border: solid 2px #da1e28;
}

div.tagarea.readonly {
  border-bottom: solid 1px transparent;
  cursor: not-allowed;
}

.menu {
  box-shadow: 0 2px 6px 0 rgba( 0, 0, 0, 0.30 );  
  left: 0;   
  position: absolute; 
  right: 0; 
  top: 41px; 
  z-index: 1000;
}

.menu button {
  background: none;
  background-color: #ffffff;    
  border: none;
  cursor: pointer;
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 14px;
  font-weight: 400;
  height: 40px;
  text-align: left;
}

.menu button:hover {
  background-color: #e5e5e5;
}

div.tagarea input {
  background: none;
  border: none;
  color: #161616;
  flex-grow: 1;
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 14px;
  font-weight: 400;
  height: 40px;
  line-height: 40px;
  margin: 0;
  min-height: 40px;
  min-width: 80px;
  outline: none;
  padding: 0;
}

div.tagarea input:read-only {
  cursor: not-allowed;
}

div.tagarea input::placeholder {
  color: #a8a8a8;
  font-size: 14px;
  font-weight: 400;
}
</style>
