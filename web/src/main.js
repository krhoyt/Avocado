import Vue from 'vue';
import App from './App.vue';
import HighchartsVue from 'highcharts-vue';

import store from './store';

Vue.config.productionTip = false;

Vue.use( HighchartsVue );

new Vue( {
  el: '#avocado',
  store,
  render: function( h ) { 
    return h( App ) 
  }
} );
