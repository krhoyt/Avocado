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
        helper="Type of involvement during an activity"        
        label="Name"
        placeholder="Name"
        :readonly="!editing"
        v-model="name"/>
      <Spacer
        :width="16"/>
      <Select
        helper="Easily distinguish tags"
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
          :disabled="extra"
          icon="/img/add.svg"
          size="field"
          :width="110">
          Rule
        </Button>        
      </Box>
    </Box>
    
    <Box
      direction="row"
      :margin-bottom="5"
      v-show="rule">
      <Select
        :options="entities"
        v-model="entity"
        :width="170"/>
      <Spacer
        :width="16"/>
      <Select
        :options="fields"
        v-model="field"
        :width="170"/>        
      <Spacer
        :width="16"/>
      <Select
        :options="conditions"
        v-model="expression"
        :width="200"/>        
      <Spacer
        :width="16"/>
      <TextInput
        :disabled="expression === 1 ? true : false"/>
      <Spacer
        :width="16"/>
      <Button
        @click.native="rule = false"
        icon="/img/subtract.svg"      
        kind="tertiary"
        size="field"
        v-show="!extra"
        :width="110">
        Clear
      </Button>
      <Spacer
        v-show="extra"
        :width="110"/>
    </Box>

    <Box
      direction="row"
      :margin-bottom="5"
      v-show="extra">
      <Select
        :options="[{label: 'And'}]"
        :v-model="clause"
        :width="170"/>
      <Spacer
        :width="16"/>
      <Select
        :options="fields"
        :width="170"/>
      <Spacer
        :width="16"/>
      <Select
        :options="conditions"
        :width="200"/>
      <Spacer
        :width="16"/>
      <TextInput/>        
      <Spacer
        :width="16"/>
      <Button
        @click.native="extra = false"
        icon="/img/subtract.svg"
        kind="tertiary"
        size="field"
        :width="110">
        Clear
      </Button>
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
        v-show="id !== null && !editing">
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
        :width="110"/>                        
    </DataTable>

  </Box>
</template>

<script>
import Box from '../../containers/Box.vue';
import Button from '../../controls/Button.vue';
import DataTable from '../../controls/DataTable.vue';
import DataTableColumn from '../../controls/DataTableColumn.vue';
import Label from '../../controls/Label.vue';
import Select from '../../controls/Select.vue';
import Spacer from '../../controls/Spacer.vue';
import TextInput from '../../controls/TextInput.vue';

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
      account: null,
      clause: 0,
      condition: 0,
      editing: true,
      entity: 0,
      error: null,
      expression: 0,
      extra: false,
      field: 0,
      id: null,
      name: null,
      rule: false,
      weight: '0'
    };
  },
  computed: {
    color: {
      get: function() {
        return this.$store.getters['picklist/capacity/COLOR'];
      },
      set: function( value ) {
        this.$store.dispatch( 'picklist/capacity/SET_COLOR', value );
      }
    },
    color_id: {
      get: function() {
        return this.$store.getters['picklist/capacity/COLOR_ID'];
      },
      set: function( value ) {
        this.$store.dispatch( 'picklist/capacity/SET_COLOR_ID', value );
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
      return this.$store.getters.CONDITIONS;
    },
    entities: function() {
      return this.$store.getters.ENTITIES;
    },
    fields: function() {
      return this.$store.getters.FIELDS[this.$store.getters.ENTITIES[this.entity].label];
    },
    items: {
      get: function() {
        return this.$store.getters.CAPACITIES;
      },
      set: function( value ) {
        this.$store.dispatch( 'SET_CAPACITIES', value );
      }
    },
  },
  methods: {
    change: function( index ) {},
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
  }
}
</script>
