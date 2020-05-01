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
    width: {type: Number, default: null}
  },
  computed: {
    style: function() {
      return {
        backgroundColor: this.background,
        flexBasis: this.grow === 0 ? 'auto' : 0,
        flexGrow: this.grow,
        height: this.height === null ? 'auto' : ( this.height + 'px' ),
        width: this.width === null ? 'auto' : ( this.width + 'px' )
      };
    }
  }
}
</script>
