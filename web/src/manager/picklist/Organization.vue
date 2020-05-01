<template>
  <Box
    :grow="1"
    :margin-left="16"
    :margin-right="16"
    :margin-top="16">

    <Label
      :size="20">
      Organization ({{items.length}})
    </Label>

    <Box
      direction="row"
      :margin-bottom="5"
      :margin-top="16">
      <TextInput
        :error="error"
        helper="Company name and/or team nomenclature"        
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
        label="Count"
        helper="Number of times used"
        placeholder="0"
        :readonly="true"
        v-model="count"
        :width="150"/>
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
        v-show="editing">
        Save
      </Button>
    </Box>

    <Box
      background="#e0e0e0"
      direction="row">
      <Label
        :grow="1"
        :height="47"
        :padding-left="16"
        :padding-right="16"
        :weight="600">
        Name
      </Label>
      <Label
        :weight="600"
        :height="47"
        :padding-left="16"
        :padding-right="16"
        :width="150">
        Color
      </Label>
      <Spacer
        :width="16"/>
      <Label
        :weight="600"
        :height="47"
        :padding-left="16"
        :padding-right="16"
        :width="150">
        Count
      </Label>
    </Box>

    <div
      class="list">

      <Box
        class="item"
        :class="{selected: id === item.id ? true : false}"
        @click.native="change( index )"
        direction="row"
        :grow="1"
        :key="item.id"
        v-for="( item, index ) in items">
        <Label
          :grow="1"
          :height="47"
          :padding-left="16"
          :padding-right="16">
          {{item.name}}
        </Label>
        <Label
          :height="47"
          :width="150"
          :padding-left="16"
          :padding-right="16">
          {{coloring( item.color_id )}}
        </Label>
        <Spacer
          :width="16"/>
        <Label
          :height="47"
          :width="150"
          :padding-left="16"
          :padding-right="16">
          {{item.count}}
        </Label>
      </Box>

    </div>

  </Box>
</template>

<script>
import Box from '../../containers/Box.vue';
import Button from '../../controls/Button.vue';
import Label from '../../controls/Label.vue';
import Select from '../../controls/Select.vue';
import Spacer from '../../controls/Spacer.vue';
import TextInput from '../../controls/TextInput.vue';

export default {
  name: 'Organization',
  components: {
    Box,
    Button,
    Label,
    Select,
    Spacer,
    TextInput
  },
  data: function() {
    return {
      editing: false,
      error: null
    };
  },
  computed: {
    account: {
      get: function() {
        return this.$store.getters['picklist/organizations/ACCOUNT'];
      },
      set: function( value ) {
        this.$store.dispatch( 'picklist/organizations/SET_ACCOUNT', value );
      }
    },
    color: {
      get: function() {
        return this.$store.getters['picklist/organizations/COLOR'];
      },
      set: function( value ) {
        this.$store.dispatch( 'picklist/organizations/SET_COLOR', value );
      }
    },
    color_id: {
      get: function() {
        return this.$store.getters['picklist/organizations/COLOR_ID'];
      },
      set: function( value ) {
        this.$store.dispatch( 'picklist/organizations/SET_COLOR_ID', value );
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
    count: {
      get: function() {
        return this.$store.getters['picklist/organizations/COUNT'].toString();
      },
      set: function( value ) {
        this.$store.dispatch( 'picklist/organizations/SET_COUNT', value );
      }
    },
    id: {
      get: function() {
        return this.$store.getters['picklist/organizations/ID'];
      },
      set: function( value ) {
        return this.$store.dispatch( 'picklist/organizations/SET_ID', value );
      }
    },        
    items: {
      get: function() {
        return this.$store.getters.ORGANIZATIONS;
      },
      set: function( value ) {
        this.$store.dispatch( 'SET_ORGANIZATIONS', value );
      }
    },
    name: {
      get: function() {
        return this.$store.getters['picklist/organizations/NAME'];
      },
      set: function( value ) {
        this.$store.dispatch( 'picklist/organizations/SET_NAME', value );
      }
    },
    original: {
      get: function() {
        return this.$store.getters['picklist/organizations/ORIGINAL'];
      },
      set: function( value ) {
        this.$store.dispatch( 'picklist/organizations/SET_ORIGINAL', value );
      }
    }
  },
  methods: {
    add: function() {
      this.id = null;
      this.account = null;
      this.name = null;
      this.count = 0;

      this.editing = true;
    },
    cancel: function() {
      this.editing = false;
      this.error = null;

      if( this.id === null ) {
        this.account = null;
        this.name = null;
        this.count = 0;
      } else {
        this.account = this.items[this.original].account_id;
        this.name = this.items[this.original].name;
        this.color_id = this.items[this.original].color_id;
        this.count = this.items[this.original].count;
      }     
    },
    change: async function( index ) {
      if( this.editing ) {
        let confirm = window.confirm( `Want to save your changes to ${this.name}?` );

        if( confirm ) {
          this.save();
        }
      }

      this.editing = false;
      this.error = null;

      this.original = index;
      this.id = this.items[index].id;
      this.account = this.items[index].account_id;
      this.color_id = this.items[index].color_id;
      this.name = this.items[index].name;
      this.count = this.items[index].count;
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

      this.id = null;
      this.account = null;
      this.name = null;
      this.count = 0;

      this.items.splice( this.original, 1 );

      this.$store.dispatch( 'picklist/organizations/REMOVE_ORGANIZATION', id );
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

      this.editing = false;
      this.error = null;
      
      if( this.id === null ) {
        this.$store.dispatch( 'picklist/organizations/CREATE_ORGANIZATION' );
      } else {
        this.$store.dispatch( 'picklist/organizations/UPDATE_ORGANIZATION' );
      }
    }
  }
}
</script>

<style scoped>
.item {
  border-bottom: solid 1px #e0e0e0;
}

.item:hover {
  background-color: #e5e5e5;
}

.item.selected {
  background-color: #e0e0e0;
}

.item.selected:hover {
  background-color: #cacaca;
}

.list {
  background-color: #f4f4f4;
  flex-basis: 0;
  flex-grow: 1;
  margin-bottom: 24px;
  margin-top: 0;
  overflow: scroll;
}
</style>
