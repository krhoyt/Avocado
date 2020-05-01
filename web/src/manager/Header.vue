<template>
  <Box 
    align="center" 
    background="#161616"    
    direction="row"
    :height="47">

    <button 
      class="menu" 
      @click="$emit( 'menu' )"
      title="Menu"
      v-show="decorate">
    </button>

    <Label 
      color="#ffffff"
      :padding-left="16"
      :padding-right="5">
      Avocado
    </Label>
    <Label 
      color="#ffffff" 
      :grow="1"
      :weight="600">
      Community Manager
    </Label>

    <button 
      class="token" 
      @click="$emit( 'token' )"
      title="API token"
      v-show="decorate">
    </button>    
    <button 
      class="logout" 
      @click="$emit( 'logout' )"
      title="Log out"
      v-show="decorate">
    </button>
    
  </Box>
</template>

<script>
import Box from '../containers/Box.vue';
import Label from '../controls/Label.vue';
import Spacer from '../controls/Spacer.vue';

export default {
  name: 'Header',
  components: {
    Box,
    Label,
    Spacer
  },
  props: {
    decorate: {type: Boolean, default: true}
  }
}
</script>

<style scoped>
button {
  background: none;
  background-position: center;
  background-repeat: no-repeat;
  background-size: 20px;
  border: solid 2px transparent;
  cursor: pointer;
  height: 47px;
  outline: none;
  transition: background-color 0.30s;
  width: 47px;
}

button:hover {
  background-color: #353535;
}

button:focus {
  border: solid 2px #ffffff;
}

button.logout {
  background-image: url( /img/logout.svg );
}

button.menu {
  background-image: url( /img/menu.svg );
}

button.token {
  background-image: url( /img/key.svg );
}
</style>
