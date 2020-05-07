<template>
  <div 
    class="box" 
    :style="style">
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: 'Box',
  props: {
    align: {type: String, default: 'auto'},
    background: {type: String, default: 'auto'},
    basis: {type: Number, default: null},
    cursor: {type: String, default: 'default'},
    direction: {type: String, default: 'column'},
    grow: {type: Number, default: 0},
    height: {type: Number, default: null},
    justify: {type: String, default: null},
    label: {type: String, default: null},
    marginBottom: {type: Number, default: 0},
    marginLeft: {type: Number, default: 0},
    marginRight: {type: Number, default: 0},    
    marginTop: {type: Number, default: 0},    
    position: {type: String, default: 'relative'},
    width: {type: Number, default: null}
  },
  computed: {
    style: function() {
      return {
        alignItems: this.align,
        backgroundColor: this.background,
        basis: this.basis === null ? '' : this.basis,
        cursor: this.cursor,
        flexDirection: this.direction,
        flexBasis: this.basis === null ? '' : this.basis,
        flexGrow: this.grow,
        height: this.height === null ? '' : ( this.height + 'px' ),
        justifyContent: this.justify === null ? '' : this.justify,
        minWidth: this.width === null ? '' : ( this.width + 'px' ),
        marginBottom: this.marginBottom === 0 ? 0 : ( this.marginBottom + 'px' ),
        marginLeft: this.marginLeft === 0 ? 0 : ( this.marginLeft + 'px' ),        
        marginRight: this.marginRight === 0 ? 0 : ( this.marginRight + 'px' ),        
        marginTop: this.marginTop === 0 ? 0 : ( this.marginTop + 'px' ),
        position: this.position,
        width: this.width === null ? '' : ( this.width + 'px' ),
      };
    }
  }
}
</script>

<style scoped>
.box {
  display: flex;
}
</style>
