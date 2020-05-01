<template>
  <Box
    direction="row" 
    :grow="1">

    <Master/>
    <Detail/>

  </Box>
</template>

<script>
import Box from '../../containers/Box.vue';
import Detail from './Detail.vue';
import Master from './Master.vue';

export default {
  name: 'Members',
  components: {
    Box,
    Detail,
    Master
  }
}
</script>
