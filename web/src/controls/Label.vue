<template>
  <p 
    class="label" 
    :class="{truncate: truncate}"
    :style="style">
    <slot></slot>
  </p>
</template>

<script>
export default {
  name: 'Label',
  props: {
    background: {type: String, default: 'transparent'},
    color: {type: String, default: '#161616'},
    crop: {type: Boolean, default: false},
    cursor: {type: String, default: 'default'},
    grow: {type: Number, default: 0},
    height: {type: Number, default: null},
    marginBottom: {type: Number, default: 0},
    marginLeft: {type: Number, default: 0},
    marginRight: {type: Number, default: 0},        
    marginTop: {type: Number, default: 0},
    paddingBottom: {type: Number, default: 0},    
    paddingLeft: {type: Number, default: 0},
    paddingRight: {type: Number, default: 0},
    paddingTop: {type: Number, default: 0},    
    size: {type: Number, default: 14},
    textAlign:{type: String, default: 'left'},
    truncate: {type: Boolean, default: true},
    weight: {type: Number, default: 400},
    width: {type: Number, default: null}
  },
  computed: {
    style: function() {
      return {
        backgroundColor: this.background,
        color: this.color,
        cursor: this.cursor,
        flexGrow: this.grow,
        height: this.height === null ? '' : ( this.height + 'px' ),
        lineHeight: this.height === null ? '' : ( this.height + 'px' ),        
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
        minWidth: this.width === null ? '' : ( this.width + 'px' ),
        textAlign: this.textAlign,
        width: this.width === null ? '' : ( this.width + 'px' )
      };
    }
  }
}
</script>

<style scoped>
p.label {
  box-sizing: border-box;
  font-family: 'IBM Plex Sans', sans-serif;
  margin: 0;
  padding: 0;
  text-align: left;
}

p.label.truncate {
  overflow: hidden;  
  text-overflow: ellipsis;   
  white-space: nowrap;  
}
</style>
