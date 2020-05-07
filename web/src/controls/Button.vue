<template>
  <button 
    :class="[kind, size]" 
    :disabled="disabled"
    :style="style"
    :title="title">
    <slot></slot>
  </button>  
</template>

<script>
export default {
  name: 'Button',
  props: {
    disabled: {default: false, type: Boolean},
    disabledIcon: {default: null, type: String},
    icon: {default: null, type: String},
    kind: {default: 'primary', type: String},
    size: {default: 'default', type: String},
    title: {default: null, type: String},
    width: {default: null, type: Number}
  },
  computed: {
    style: function() {
      let path = this.icon;

      if( this.disabled ) {
        path = this.disabledIcon;
      }

      return {
        backgroundImage: path === null ? '' : `url( ${path} )`,
        width: this.width === null ? '' : ( this.width + 'px' )
      };
    }
  }
}
</script>

<style scoped>
button {
  background: none;
  background-position: right 16px center;
  background-repeat: no-repeat;
  background-size: 16px;
  border: none;        
  border: solid 3px transparent;
  cursor: pointer;
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 14px;
  font-weight: 400;
  margin: 0;
  outline: none;
  padding: 0;
  text-align: left;
  white-space: nowrap;
}

button:focus {
  box-shadow: inset 0 0 0 1px;
}

button.default {
  height: 47px;
  padding: 0 60px 0 12px;
}

button.field {
  height: 40px;
  padding: 0 60px 0 12px;
}

button.modal {
  background-color: #0f62fe; 
  background-position: right 16px top 16px; 
  color: #ffffff;            
  flex-basis: 0;
  flex-grow: 1;
  height: 64px;
  padding: 16px 60px 24px 12px;
}

button.modal:hover {
  background-color: #0353e9;
}

button.modal:focus {
  border-color: #0f62fe;
}

button.modal:active {
  background-color: #002d9c;
}

button.primary {
  background-color: #0f62fe;  
  color: #ffffff;          
}

button.primary:hover {
  background-color: #0353e9;
}

button.primary:focus {
  border-color: #0f62fe;
}

button.primary:active {
  background-color: #002d9c;
}

button.secondary {
  background-color: #393939;  
  color: #ffffff;          
}

button.secondary:hover {
  background-color: #4c4c4c;
}

button.secondary:focus {
  border-color: #0f62fe;
}

button.secondary:active {
  background-color: #6f6f6f;
}

button.tertiary {
  background-color: none;  
  border: solid 1px #0f62fe;
  color: #0f62fe;
}

button.tertiary:hover {
  background-color: #0353e9;
  border: solid 1px #0353e9;  
  color: #ffffff; 
}

button.tertiary:active {
  background-color: #0f62fe; 
  border-color: #0f62fe;
  color: #ffffff;
}

button.tertiary:focus {
  background-color: #0f62fe; 
  border: solid 3px #0f62fe;
  color: #ffffff; 
}

button.danger {
  background-color: #da1e28;  
  color: #ffffff;          
}

button.danger:hover {
  background-color: #b81921;
}

button.danger:focus {
  border-color: #0f62fe;
}

button.danger:active {
  background-color: #750e13;
}

button.ghost {
  background-color: none;  
  color: #0f62fe;          
}

button.ghost:hover {
  background-color: #e5e5e5;
  color: #0043ce;
}

button.ghost:active {
  background-color: #c6c6c6;
  color: #0043ce;  
}

button.ghost:focus {
  background-color: none;
  border-color: #0f62fe;
  color: #0f62fe;
}

button:disabled {
  background-color: #c6c6c6;
  border-color: #c6c6c6;        
  color: #8d8d8d;
  cursor: not-allowed;
}

button.ghost:disabled {
  background-color: transparent;
  border-color: transparent;        
  color: #8d8d8d;
  cursor: not-allowed;
}   

button:disabled:hover {
  background-color: #c6c6c6;
}

button.ghost:disabled:hover {
  background-color: transparent;
}

button.tertiary:disabled:hover {
  background-color: #c6c6c6;
  border-color: #c6c6c6;        
  color: #8d8d8d;
  cursor: not-allowed;
}
</style>
