<template>
  <div 
    :style="style">
  </div>
</template>

<script>
export default {
  name: 'Spacer',
  props: {
    background: {type: String, default: 'transparent'},
    grow: {type: Number, default: 0},
    height: {type: Number, default: null},
    marginBottom: {type: Number, default: 0},
    marginLeft: {type: Number, default: 0},
    marginRight: {type: Number, default: 0},    
    marginTop: {type: Number, default: 0},    
    width: {type: Number, default: null}
  },
  computed: {
    style: function() {
      return {
        backgroundColor: this.background,
        boxSizing: 'border-box',
        flexBasis: this.grow === 0 ? '' : 0,
        flexGrow: this.grow,
        height: this.height === null ? '' : ( this.height + 'px' ),
        marginBottom: this.marginBottom === 0 ? 0 : ( this.marginBottom + 'px' ),
        marginLeft: this.marginLeft === 0 ? 0 : ( this.marginLeft + 'px' ),        
        marginRight: this.marginRight === 0 ? 0 : ( this.marginRight + 'px' ),        
        marginTop: this.marginTop === 0 ? 0 : ( this.marginTop + 'px' ),        
        width: this.width === null ? '' : ( this.width + 'px' )
      };
    }
  }
}
</script>
