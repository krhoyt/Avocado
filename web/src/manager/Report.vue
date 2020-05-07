<template>

  <Box
    direction="row"
    :grow="1">

    <Box
      :basis="0"
      :grow="1">

      <DataTable
        :data="report"
        :selectable="true">
        <DataTableColumn
          field="name"
          :grow="1"
          :sortable="true"
          text="Name"/>
        <DataTableColumn
          field="level"
          label="level"
          :sortable="true"
          text="Level"
          :width="150"/>        
        <DataTableColumn
          field="love"
          :sortable="true"
          text="Love"
          :width="125"/>        
        <DataTableColumn
          field="reach"
          :sortable="true"
          text="Reach"
          :width="125"/>                      
        <DataTableColumn
          field="activity"
          :sortable="true"
          text="Activity"
          :width="125"/>                      
        <DataTableColumn
          field="gravity"
          :sortable="true"
          text="Gravity"
          :width="125"/>                                            
      </DataTable>

      <Box
        background="#e0e0e0"
        direction="row">
        <Label
          :grow="1"
          :weight="600"
          :height="47"
          :padding-left="16">
          {{report.length}} members
        </Label>            
        <Spacer 
          :width="150"/>    
        <Label
          :weight="600"
          :width="125"
          :height="47"
          :padding-left="16">
          {{love}}
        </Label>                           
        <Label
          :weight="600"
          :width="125"
          :height="47"
          :padding-left="16">
          {{reach}} (Avg)
        </Label>      
        <Label
          :weight="600"
          :width="125"
          :height="47"
          :padding-left="16">
          {{activity}}
        </Label>                             
        <Label
          :weight="600"
          :width="125"
          :height="47"
          :padding-left="16">
          {{gravity}}
        </Label>
      </Box>

    </Box>

    <Box>
      <div 
        class="list" 
        style="background-color: #ffffff; width: 425px;">
        <Label
          background="#e0e0e0"
          :weight="600"
          :height="47"
          :padding-left="16">
          Members by Level
        </Label>       
        <highcharts
          :options="byLevel">
        </highcharts>
        <Label
          background="#e0e0e0"
          :weight="600"
          :height="47"
          :padding-left="16">        
          Love and Reach
        </Label>       
        <highcharts
          :options="loveAndReach">
        </highcharts>
        <!--
        <Label
          background="#e0e0e0"
          :weight="600"
          :height="47"
          :padding-left="16">
          Most Active Organizations
        </Label>       
        <Box
          direction="row">
          <Label
            :grow="1"
            :height="47"
            :padding-left="16">
            IBM   
          </Label>   
          <Label
            :height="47"
            :padding-right="16"
            :width="100">
            999   
          </Label>                         
        </Box>
        -->
        <Label
          background="#e0e0e0"
          :weight="600"
          :height="47"
          :padding-left="16">
          Member Count by Level and Location
        </Label>       
        <highcharts
          :options="memberByLevelLocation">
        </highcharts>
        <Label
          background="#e0e0e0"
          :weight="600"
          :height="47"
          :padding-left="16">
          Gravity by Level and Location
        </Label>       
        <highcharts
          :options="gravityByLevelLocation">
        </highcharts>
        <Label
          background="#e0e0e0"
          :weight="600"
          :height="47"
          :padding-left="16">
          Gravity by Location and Level
        </Label>       
        <highcharts
          :options="gravityByLocationLevel">
        </highcharts>
        <Label
          background="#e0e0e0"
          :weight="600"
          :height="47"
          :padding-left="16">
          Highest Love Members (10)
        </Label>       
        <div class="list" style="background-color: #ffffff; max-height: 225px;">
          <Box
            class="item"
            direction="row"
            v-for="( member, index ) in highestLove"
            :key="index">
            <Label
              :grow="1"
              :height="47"
              :padding-left="16">
              {{member.name}}
            </Label>      
            <Label
              :height="47"
              :padding-right="16"
              :width="70">
              {{member.love === null ? 0 : member.love.toLocaleString()}}   
            </Label>
            <Label
              :height="47"
              :padding-right="16"
              :width="70">
              {{member.twitter === null ? 0 : member.twitter.toLocaleString()}}   
            </Label>
            <Label
              :height="47"
              :padding-right="16"
              :width="70">
              {{member.github === null ? 0 : member.github.toLocaleString()}}   
            </Label>                              
          </Box>
        </div>
      </div>
    </Box>

  </Box>
</template>

<script>
import Box from '../containers/Box.vue';
import DataTable from '../controls/DataTable.vue';
import DataTableColumn from '../controls/DataTableColumn.vue';
import Label from '../controls/Label.vue';
import Spacer from '../controls/Spacer.vue';

export default {
  name: 'Report',
  components: {
    Box,
    DataTable,
    DataTableColumn,
    Label,
    Spacer
  },
  data: function() {
    return {
      colors: [
        '#6929c4', '#1192e8', '#005d5d', '#9f1853', '#fa4d56'
      ]
    };
  },
  computed: {
    activity: function() {
      let total = 0;

      for( let r = 0; r < this.report.length; r++ ) {
        total = total + this.report[r].activity;
      }

      return total;
    },        
    byLevel: function() {
      let data = [0, 0, 0, 0];

      for( let r = 0; r < this.report.length; r++ ) {
        data[this.report[r].level - 1] += 1;
      }

      return {
        chart: {
          type: 'column',
          height: 225,
          spacing: 16,
          style: {
            fontFamily: 'IBM Plex Sans, sans-serif',
            fontSize: '14px'
          }
        },
        title: null,
        legend: {
          enabled: false
        },
        credits: {
          enabled: false
        },
        xAxis: {
          categories: [
            'Ambassadors',
            'Fans',
            'Users',
            'Observers'
          ]
        },
        yAxis: {
          min: 0,
          title: {
            text: 'Number of Members'
          }
        },
        series: [{
          name: 'Level',
          data: data,
          color: '#6929c4'
        }]
      };
    },
    gravity: function() {
      let total = 0;

      for( let r = 0; r < this.report.length; r++ ) {
        total = total + this.report[r].gravity;
      }

      return total;
    },
    gravityByLevelLocation: function() {
      const series = [];

      for( let r = 0; r < this.report.length; r++ ) {
        let found = false;

        for( let s = 0; s < series.length; s++ ) {
          if( series[s].name === this.report[r].country ) {
            series[s].data[this.report[r].level - 1] += this.report[r].gravity;
            found = true;
          }
        }

        if( !found ) {
          const data = {
            name: this.report[r].country, 
            data: [0, 0, 0, 0],
            color: this.colors[series.length]
          };
          data.data[this.report[r].level - 1] += this.report[r].gravity;

          series.push( data );
        }
      }

      return {
        chart: {
          type: 'column',
          height: 225,
          spacing: 16,
          style: {
            fontFamily: 'IBM Plex Sans, sans-serif',
            fontSize: '14px'
          }          
        },
        title: null,
        credits: {
          enabled: false
        },        
        xAxis: {
          categories: ['Ambassadors', 'Fans', 'Users', 'Observers']
        },
        yAxis: {
          min: 0,
          title: {
            text: 'Number of Members'
          },
        },
        legend: {
          enabled: false
        },
        plotOptions: {
          column: {
            stacking: 'normal'
          }
        },
        series: series
      };
    },
    gravityByLocationLevel: function() {
      const locations = {};
      const series = [
        {name: 'Observers', data: [], color: this.colors[0]},
        {name: 'Users', data: [], color: this.colors[1]},
        {name: 'Fans', data: [], color: this.colors[2]},
        {name: 'Ambassadors', data: [], color: this.colors[3]}
      ];

      for( let r = 0; r < this.report.length; r++ ) {
        if( locations.hasOwnProperty( this.report[r].country ) ) {
          locations[this.report[r].country][this.report[r].level - 1] += this.report[r].gravity;
        } else {
          locations[this.report[r].country] = [0, 0, 0, 0];
          locations[this.report[r].country][this.report[r].level - 1] = this.report[r].gravity;
        }
      }

      const keys = Object.keys( locations );

      for( let k = 0; k < keys.length; k++ ) {
        series[3].data.push( locations[keys[k]][0] );
        series[2].data.push( locations[keys[k]][1] );
        series[1].data.push( locations[keys[k]][2] );
        series[0].data.push( locations[keys[k]][3] );                        
      }

      return {
        chart: {
          type: 'column',
          height: 225,
          spacing: 16,
          style: {
            fontFamily: 'IBM Plex Sans, sans-serif',
            fontSize: '14px'
          }          
        },
        title: null,
        credits: {
          enabled: false
        },        
        xAxis: {
          categories: keys
        },
        yAxis: {
          min: 0,
          title: {
            text: 'Number of Members'
          },
        },
        legend: {
          enabled: false
        },
        plotOptions: {
          column: {
            stacking: 'normal'
          }
        },
        series: series
      };
    },    
    highestLove: function() {
      const members = this.report.slice();
      members.sort( ( a, b ) => {
        if( a.love > b.love ) return -1;
        if( a.love < b.love ) return 1;
        return 0;
      } );
      return members.slice( 0, 10 );
    },
    love: function() {
      let total = 0;

      for( let r = 0; r < this.report.length; r++ ) {
        total = total + this.report[r].love;
      }

      return total;
    },    
    loveAndReach: function() {
      let series = [
        {name: 'Ambassadors', data: [], color: this.colors[3]},
        {name: 'Fans', data: [], color: this.colors[2]},
        {name: 'Users', data: [], color: this.colors[1]},
        {name: 'Observers', data: [], color: this.colors[0]}
      ];

      for( let r = 0; r < this.report.length; r++ ) {
        series[this.report[r].level - 1].data.push( [this.report[r].reach, this.report[r].love] );
      }

      return {
        chart: {
          type: 'scatter',
          zoomType: 'xy',
          height: 225,
          spacing: 16,
          style: {
            fontFamily: 'IBM Plex Sans, sans-serif',
            fontSize: '14px'
          }                    
        },
        title: null,
        credits: {
          enabled: false
        },      
        legend: {
          enabled: false
        },
        xAxis: {
          allowDecimals: false,
          min: 0,
          title: {
            enabled: true,
            text: 'Reach'
          }
        },
        yAxis: {
          allowDecimals: false,
          min: 0,
          title: {
            enabled: true,
            text: 'Love'
          }
        },
        plotOptions: {
          scatter: {
            marker: {
              radius: 5,
              states: {
                hover: {
                  enabled: true,
                  lineColor: 'rgb( 100, 100, 100 )'
                }
              }
            },
            states: {
              hover: {
                marker: {
                  enabled: false
                }
              }
            },
            tooltip: {
              headerFormat: '<b>{series.name}</b><br>',
              pointFormat: '{point.x} reach, {point.y} love'
            }
          }
        },
        series: series
      };
    },
    memberByLevelLocation: function() {
      const data = {};
      const observers = [];
      const users = [];
      const fans = [];
      const ambassadors = [];

      for( let r = 0; r < this.report.length; r++ ) {
        if( data.hasOwnProperty( this.report[r].country ) === false ) {
          data[this.report[r].country] = [0, 0, 0, 0];
        }

        data[this.report[r].country][this.report[r].level - 1] += 1;
      }

      const keys = Object.keys( data );

      for( let k = 0; k < keys.length; k++ ) {
        ambassadors.push( data[keys[k]][0] );
        fans.push( data[keys[k]][1] );
        users.push( data[keys[k]][2] );        
        observers.push( data[keys[k]][3] );        
      }

      return {
        chart: {
          type: 'column',
          height: 225,
          spacing: 16,
          style: {
            fontFamily: 'IBM Plex Sans, sans-serif',
            fontSize: '14px'
          }          
        },
        title: null,
        credits: {
          enabled: false
        },        
        xAxis: {
          categories: Object.keys( data )
        },
        yAxis: {
          min: 0,
          title: {
            text: 'Number of Members'
          },
        },
        legend: {
          enabled: false
        },
        plotOptions: {
          column: {
            stacking: 'normal'
          }
        },
        series: [{
          name: 'Observer',
          data: observers,
          color: '#6929c4'
        }, {
          name: 'User',
          data: users,
          color: '#1192e8'
        }, {
          name: 'Fan',
          data: fans,
          color: '#005d5d'
        }, {
          name: 'Ambassador',
          data: ambassadors,
          color: '#9f1853'
        }]
      };
    },    
    reach: function() {
      let total = 0;

      for( let r = 0; r < this.report.length; r++ ) {
        total = total + this.report[r].reach;
      }

      return Math.round( total / this.report.length );
    },            
    report: {
      get: function() {
        return this.$store.getters.REPORT;
      },
      set: function( value ) {
        this.$store.dispatch( 'SET_REPORT', value );
      }
    }
  },
  methods: {
    level: function( value ) {
      let result = null;

      switch( value ) {
        case 4:
          result = '4 - Observer';
          break;
        case 3:
          result = '3 - User';
          break;
        case 2:
          result = '2 - Fan';
          break;
        case 1:
          result = '1 - Ambassador';
          break;
      }

      return result;
    }    
  }
}
</script>
