<template>
  <button 
    :disabled="disabled"
    :style="style"
    :title="title">
    {{label}}
  </button>
</template>

<script>
export default {
  name: 'Photo',
  props: {
    disabled: {type: Boolean, default: false},    
    label: {type: String, default: null},    
    image: {type: String, default: null},
    title: {type: String, default: null}
  },
  computed: {
    style: function() {
      let count = this.label === null ? 0 : this.label.length;
      let font = 20;

      switch( count ) {
        case 4:
          font = 18;
          break;
        case 5:
          font = 14;
          break;
      }

      return {
        backgroundImage: this.image === null ? 'none' : `url( ${this.image} )`,
        fontSize: ( font + 'px' )
      };
    }
  }
}
</script>

<style scoped>
button {
  background-color: #f4f4f4; 
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  border: none;
  border-radius: 61px;   
  color: #a8a8a8; 
  cursor: pointer;
  font-family: 'IBM Plex Sans', sans-serif; 
  font-size: 20px; 
  font-weight: 400;   
  height: 61px;   
  line-height: 61px;   
  margin: 0;   
  outline: none;
  padding: 0;   
  text-align: center;  
  width: 61px; 
}

button[disabled] {
  cursor: not-allowed;
}
</style>
