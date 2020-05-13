<template>
  <Box
    :grow="1"
    :margin-left="16"
    :margin-right="16"
    :margin-top="16">

    <Label
      :size="20">
      Activity Types ({{items.length}})
    </Label>

    <Box
      direction="row"
      :margin-bottom="5"
      :margin-top="16">
      <TextInput
        :error="error"
        helper="Descriptive label to help distinguish activities"        
        label="Name"
        placeholder="Name"
        :readonly="!editing"
        v-model="name"/>
      <Spacer
        :width="16"/>
      <Select
        helper="Visually distinguish tags"
        label="Color"
        label-field="name"
        :options="colors"
        :readonly="!editing"
        ref="color"
        v-model="color"
        :width="150"/>
      <Spacer
        :width="16"/>
      <TextInput
        :grow="0"
        label="Weight"
        helper="Quality of engagement"
        placeholder="0"
        type="number"
        :readonly="!editing"
        v-model="weight"
        value="0"
        :width="150"/>
      <Spacer
        :width="16"/>
      <Box
        :height="79"
        justify="flex-end">
        <Button
          @click.native="rule === true ? extra = true : rule = true"
          :disabled="!editing || extra"
          icon="/img/add.svg"
          size="field"
          :width="110">
          Rule
        </Button>        
      </Box>
    </Box>
    
    <Box
      align="flex-end"
      direction="row"
      :margin-bottom="5">
      <Select
        :disabled="!rule"
        :readonly="rule && !editing"
        label="Source"
        helper="Where activity takes place"
        :options="entities"
        v-model="line_one_entity"
        :width="210"/>
      <Spacer
        :width="16"/>
      <Select
        :disabled="!rule"
        :readonly="rule && !editing"
        label="Field"
        helper="Specific part of activity"
        :options="fields"
        v-model="line_one_field"
        :width="170"/>        
      <Spacer
        :width="16"/>
      <Select
        :disabled="!rule"
        :readonly="rule && !editing"
        label="Condition"
        helper="How to evaluate contents"
        :options="conditions"
        v-model="line_one_condition"
        :width="200"/>        
      <Spacer
        :width="16"/>
      <TextInput
        :readonly="rule && !editing"
        label="Value"
        helper="Comparison made against the condition (case-insensitive)"
        :disabled="line_one_condition === 1 || !rule ? true : false"
        placeholder="Value"
        v-model="line_one_value"
        :error="line_one_error"/>
      <Spacer
        :width="16"/>
      <Box
        :margin-bottom="19"
        v-show="ruleButton">
        <Button
          @click.native="clearRule"
          icon="/img/subtract.svg"      
          kind="tertiary"
          size="field"
          :width="110">
          Clear
        </Button>        
      </Box>
      <Spacer
        v-show="ruleSpacer"
        :width="110"/>
    </Box>

    <Box
      direction="row"
      :margin-bottom="5">
      <Select
        :disabled="!extra"
        :readonly="extra && !editing"
        :options="operators"
        v-model="line_two_clause"
        :width="210"/>
      <Spacer
        :width="16"/>
      <Select
        :disabled="!extra"
        :readonly="extra && !editing"
        :options="fields"
        v-model="line_two_field"
        :width="170"/>
      <Spacer
        :width="16"/>
      <Select
        :disabled="!extra"
        :readonly="extra && !editing"
        :options="conditions"
        v-model="line_two_condition"
        :width="200"/>
      <Spacer
        :width="16"/>
      <TextInput
        :disabled="!extra"
        :readonly="extra && !editing"
        placeholder="Value"
        v-model="line_two_value"
        :error="line_two_error"/>        
      <Spacer
        :width="16"/>
      <Button
        @click.native="clearExtra"
        icon="/img/subtract.svg"
        kind="tertiary"
        size="field"
        :width="110"
        v-show="editing && extra">
        Clear
      </Button>
      <Spacer
        :width="110"
        v-show="!editing || !extra"/>
    </Box>

    <Box
      direction="row"
      :margin-bottom="16">
      <Button
        @click.native="add"
        icon="/img/add.svg"
        v-show="!editing">
        Add
      </Button>      
      <Button
        @click.native="remove"
        disabled-icon="/img/delete-disabled.svg"
        icon="/img/delete.svg"
        kind="danger"
        v-show="editing && id !== null">
        Delete
      </Button>
      <Spacer
        :grow="1"/>
      <Button
        @click.native="cancel"
        kind="secondary"
        v-show="editing">
        Cancel
      </Button>
      <Spacer
        :width="16"/>
      <Button
        @click.native="edit"
        :disabled="account === null"
        disabled-icon="/img/edit-disabled.svg"
        icon="/img/edit.svg"
        v-show="id !== null && !editing"
        :width="110">
        Edit
      </Button>      
      <Button
        @click.native="save"
        icon="/img/save.svg"
        v-show="editing"
        :width="110">
        Save
      </Button>
    </Box>

    <DataTable
      @change="change( $event )"
      :data="items"
      :margin-bottom="24"
      :selectable="true">
      <DataTableColumn
        field="name"
        :grow="1"
        :sortable="true"
        text="Name"/>
      <DataTableColumn
        field="color_id"
        label="coloring"
        :sortable="true"
        text="Color"
        :width="166"/>        
      <DataTableColumn
        field="weight"
        :sortable="true"
        text="Weight"
        :width="166"/>        
      <DataTableColumn
        field="count"
        :sortable="true"
        text="Count"
        :width="150"/>                        
    </DataTable>

  </Box>
</template>

<script>
import Box from '../containers/Box.vue';
import Button from '../controls/Button.vue';
import DataTable from '../controls/DataTable.vue';
import DataTableColumn from '../controls/DataTableColumn.vue';
import Label from '../controls/Label.vue';
import Select from '../controls/Select.vue';
import Spacer from '../controls/Spacer.vue';
import TextInput from '../controls/TextInput.vue';

export default {
  name: 'Capacity',
  components: {
    Box,
    Button,
    DataTable,
    DataTableColumn,
    Label,
    Select,
    Spacer,
    TextInput
  },
  data: function() {
    return {
      editing: false,
      error: null,
      extra: false,
      rule: false,

      line_one_entity: 0,
      line_one_field: 0,
      line_one_condition: 0,
      line_one_value: null,
      line_one_error: null,
      line_two_clause: 0,
      line_two_field: 0,
      line_two_condition: 0,
      line_two_value: null,
      line_two_error: null
    };
  },
  computed: {
    account: {
      get: function() {
        return this.$store.getters['capacity/ACCOUNT'];
      },
      set: function( value ) {
        this.$store.dispatch( 'capacity/SET_ACCOUNT', value );
      }
    },
    color: {
      get: function() {
        return this.$store.getters['capacity/COLOR'];
      },
      set: function( value ) {
        this.$store.dispatch( 'capacity/SET_COLOR', value );
      }
    },
    color_id: {
      get: function() {
        return this.$store.getters['capacity/COLOR_ID'];
      },
      set: function( value ) {
        this.$store.dispatch( 'capacity/SET_COLOR_ID', value );
      }
    },
    colors: {
      get: function() {
        return this.$store.getters.COLORS;
      },
      set: function( value ) {
        this.$store.dispatch( 'SET_COLORS', value );
      }
    },
    conditions: function() {
      return this.$store.getters['capacity/CONDITIONS'];
    },    
    count: {
      get: function() {
        return this.$store.getters['capacity/COUNT'].toString();
      },
      set: function( value ) {
        this.$store.dispatch( 'capacity/SET_COUNT', value );
      }
    },
    criteria: {
      get: function() {
        return this.$store.getters['capacity/CRITERIA'];
      },
      set: function( value ) {
        this.$store.dispatch( 'capacity/SET_CRITERIA', value );
        
        let result = value;

        if( result !== null ) {
          result = value.split( ',' );

          this.rule = true;

          this.line_one_entity = parseInt( result[0] );
          this.line_one_field = parseInt( result[1] );
          this.line_one_condition = parseInt( result[2] );
          this.line_one_value = result[3];          

          if( result.length > 4 ) {
            this.extra = true;

            this.line_two_clause = parseInt( result[4] );
            this.line_two_field = parseInt( result[5] );
            this.line_two_condition = parseInt( result[6] );
            this.line_two_value = result[7];
          }          
        } else {
          this.rule = false;
          this.line_one_entity = 0;
          this.line_one_field = 0;
          this.line_one_condition = 0;
          this.line_one_value = null;

          this.extra = false;
          this.line_two_clause = 0;
          this.line_two_field = 0;
          this.line_two_condition = 0;
          this.line_two_value = null;
        }
      }
    },
    entities: function() {
      return this.$store.getters['capacity/ENTITIES'];
    },
    fields: function() {
      let result = [];

      if( this.$store.getters['capacity/FIELDS'] !== null &&
          this.$store.getters['capacity/ENTITIES'].length > 0 )
        result = this.$store.getters['capacity/FIELDS'][this.$store.getters['capacity/ENTITIES'][this.line_one_entity].label];

      return result;
    },
    id: {
      get: function() {
        return this.$store.getters['capacity/ID'];
      },
      set: function( value ) {
        return this.$store.dispatch( 'capacity/SET_ID', value );
      }
    },        
    items: {
      get: function() {
        return this.$store.getters['capacity/CAPACITIES'];
      },
      set: function( value ) {
        this.$store.dispatch( 'capacity/SET_CAPACITIES', value );
      }
    },
    operators: function() {
      return this.$store.getters['capacity/OPERATORS'];
    },
    name: {
      get: function() {
        return this.$store.getters['capacity/NAME'];
      },
      set: function( value ) {
        this.$store.dispatch( 'capacity/SET_NAME', value );
      }
    },
    original: {
      get: function() {
        return this.$store.getters['capacity/ORIGINAL'];
      },
      set: function( value ) {
        this.$store.dispatch( 'capacity/SET_ORIGINAL', value );
      }
    },
    ruleButton: function() {
      let result = false;

      if( this.editing ) {
        if( this.rule ) {
          if( this.extra ) {
            result = false;
          } else {
            result = true;
          }
        } else {
          result = false;
        }
      } else {
        result = false;
      }

      return result;
    },  
    ruleSpacer: function() {
      let result = false;

      if( this.editing ) {
        if( this.rule ) {
          if( this.extra ) {
            result = true;
          } else {
            result = false;
          }
        } else {
          result = true;
        }
      } else {
        result = true;
      }

      return result;
    }, 
    weight: {
      get: function() {
        return this.$store.getters['capacity/WEIGHT'].toString();
      },
      set: function( value ) {
        this.$store.dispatch( 'capacity/SET_WEIGHT', value );
      }
    }
  },
  methods: {
    add: function() {
      this.id = null;
      this.account = null;
      this.name = null;
      this.weight = 0;
      this.criteria = null;
      this.count = 0;

      this.editing = true;
    },
    cancel: function() {
      this.editing = false;
      this.error = null;
      this.line_one_error = null;
      this.line_two_error = null;
      this.rule = false;
      this.extra = false;

      if( this.id === null ) {
        this.account = null;
        this.name = null;
        this.weight = 0;
        this.count = 0;
      } else {
        this.account = this.items[this.original].account_id;
        this.name = this.items[this.original].name;
        this.color_id = this.items[this.original].color_id;
        this.weight = this.items[this.original].weight;
        this.count = this.items[this.original].count;
      }
    },
    change: function( index ) {
      if( this.editing ) {
        let confirm = window.confirm( `Want to save your changes to ${this.name}?` );

        if( confirm ) {
          this.save();
        }
      }

      this.editing = false;
      this.error = null;
      this.line_one_error = null;
      this.line_two_error = null;
      this.rule = false;
      this.extra = false;

      this.original = index;
      this.id = this.items[index].id;
      this.account = this.items[index].account_id;
      this.color_id = this.items[index].color_id;
      this.name = this.items[index].name;
      this.weight = this.items[index].weight;
      this.criteria = this.items[index].criteria;
      this.count = this.items[index].count;
    },
    clearExtra: function() {
      this.extra = false;
      this.line_two_clause = 0;
      this.line_two_field = 0;
      this.line_two_condition = 0;
      this.line_two_value = null;
    },
    clearRule: function() {
      this.rule = false;
      this.line_one_entity = 0;
      this.line_one_field = 0;
      this.line_one_condition = 0;
      this.line_one_value = null;
    },
    coloring: function( color ) {
      let result = null;

      if( color === null ) {
        result = 'Gray';
      } else {
        for( let c = 0; c < this.colors.length; c++ ) {
          if( this.colors[c].id === color ) {
            result = this.colors[c].name;
            break;
          }
        }
      }
      
      return result;
    },
    edit: function() {
      this.editing = true;
    },
    remove: function() {
      const id = this.id;
    
      this.editing = false;
      this.error = null;
      this.line_one_error = null;
      this.line_two_error = null;
      this.rule = false;
      this.extra = false;

      this.id = null;
      this.account = null;
      this.name = null;
      this.weight = 0;
      this.count = 0;

      this.items.splice( this.original, 1 );

      this.$store.dispatch( 'capacity/REMOVE_CAPACITY', id );
    },
    save: function() {
      if( this.name === null ) {
        this.error = 'You must provide a name value';
        return;
      } else {
        if( this.name.trim().length === 0 ) {
          this.error = 'You must provide a name value';
          return;
        }
      }

      if( this.rule && this.line_one_condition !== 1 ) {
        if( this.line_one_value === null ) {
          this.line_one_error = 'You must provide a value for this condition';
          return;
        } else {
          if( this.line_one_value.trim().length === 0 ) {
            this.line_one_error = 'You must provide a value for this condition';
            return;            
          }
        }
      }

      if( this.extra && this.line_two_condition !== 1 ) {
        if( this.line_two_value === null ) {
          this.line_two_error = 'You must provide a value for this condition';
          return;
        } else {
          if( this.line_two_value.trim().length === 0 ) {
            this.line_two_error = 'You must provide a value for this condition';
            return;            
          }
        }
      }      

      this.editing = false;
      this.error = null;
      this.line_one_error = null;
      this.line_two_error = null;
      
      let criteria = null;

      if( this.rule !== false ) {
        criteria = [
          this.line_one_entity,
          this.line_one_field,
          this.line_one_condition,
          this.line_one_value
        ];
      }

      if( this.extra !== false ) {
        criteria.push( this.line_two_clause );
        criteria.push( this.line_two_field );
        criteria.push( this.line_two_condition );
        criteria.push( this.line_two_value );
      }

      this.$store.dispatch( 'capacity/SET_CRITERIA', criteria );

      if( this.id === null ) {
        this.$store.dispatch( 'capacity/CREATE_CAPACITY' );
      } else {
        this.$store.dispatch( 'capacity/UPDATE_CAPACITY' );
      }
    }
  }
}
</script>
