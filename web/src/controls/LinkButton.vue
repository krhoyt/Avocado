<template>
  <button
    :class="{truncate: truncate}"
    :disabled="disabled" 
    :style="style"
    :title="title">
    <slot></slot>
  </button>
</template>

<script>
export default {
  name: 'LinkButton',
  props: {
    align: {type: String, default: 'left'},
    background: {type: String, default: 'transparent'},
    disabled: {type: Boolean, default: false},
    grow: {type: Number, default: 0},
    inline: {type: Boolean, default: false},
    marginBottom: {type: Number, default: 0},
    marginLeft: {type: Number, default: 0},
    marginRight: {type: Number, default: 0},        
    marginTop: {type: Number, default: 0},
    paddingBottom: {type: Number, default: 0},    
    paddingLeft: {type: Number, default: 0},
    paddingRight: {type: Number, default: 0},
    paddingTop: {type: Number, default: 0},    
    size: {type: Number, default: 14},
    truncate: {type: Boolean, default: true},
    title: {type: String, default: null},
    weight: {type: Number, default: 400}
  },
  computed: {
    style: function() {
      return {
        backgroundColor: this.background,
        flexBasis: this.grow > 0 ? 0 : '',
        flexGrow: this.grow,
        marginBottom: this.marginBottom === 0 ? 0 : ( this.marginBottom + 'px' ),
        marginLeft: this.marginLeft === 0 ? 0 : ( this.marginLeft + 'px' ),
        marginRight: this.marginRight === 0 ? 0 : ( this.marginRight + 'px' ),
        marginTop: this.marginTop === 0 ? 0 : ( this.marginTop + 'px' ),                        
        paddingBottom: this.paddingBottom === 0 ? 0 : ( this.paddingBottom + 'px' ),
        paddingLeft: this.paddingLeft === 0 ? 0 : ( this.paddingLeft + 'px' ),
        paddingRight: this.paddingRight === 0 ? 0 : ( this.paddingRight + 'px' ),
        paddingTop: this.paddingTop === 0 ? 0 : ( this.paddingTop + 'px' ),
        fontSize: this.size + 'px',
        fontWeight: this.weight,
        textAlign: this.align,
        textDecoration: this.inline ? 'underline' : ''
      };
    }
  }
}
</script>

<style scoped>
button {
  background: none;
  border: none;
  color: #0f62fe;
  cursor: pointer;
  font-family: 'IBM Plex Sans', sans-serif;  
  margin: 0;
  outline: none;
  padding: 0;
  transition: color 0.30s;
  max-width: 300px;
}

button:disabled {
  color: #8d8d8d;
  cursor: default;
}

button:hover {
  color: #0353e9;  
  text-decoration: underline;
}

button:focus {
  color: #0f62fe;
}

button:active {
  color: #002d9c;
}

button:disabled {
  color: #c6c6c6;
  cursor: default;
}

button:disabled:hover {
  color: #c6c6c6;
  cursor: default;
  text-decoration: none;
}

button.truncate {
  display: inline-block;
  overflow: hidden;  
  text-overflow: ellipsis;   
  white-space: nowrap;    
}
</style>
