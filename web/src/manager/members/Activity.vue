<template>
  <Box
    v-show="active"
    background="#f4f4f4"
    :grow="1"
    :margin-left="16"
    :margin-right="16">

    <Box
      direction="row"
      :margin-bottom="5"
      :margin-left="16"
      :margin-right="16"
      :margin-top="16">
      <DatePicker
        label="Date"
        :readonly="!editing"
        theme="light"
        title="Date the activity took place"
        v-model="contributed"/>
      <Spacer
        :width="16"/>
      <TextInput
        :grow="1"
        label="Description"
        placeholder="Description"
        :readonly="!editing"
        theme="light"
        v-model="selected.description"/>
      <Spacer
        :width="16"/>
      <Select
        label="Type"
        label-field="name"
        :options="capacities"
        :readonly="!editing"
        ref="capacity"
        theme="light"
        v-model="capacity"
        :width="220"/>
    </Box>

    <Box
      direction="row"
      :margin-bottom="5"
      :margin-left="16"
      :margin-right="16">
      <TextInput
        helper="External URL, including HTTP/S"
        :grow="1"
        label="Link"
        placeholder="Link"
        :readonly="!editing"
        theme="light"
        v-model="selected.link"/>
      <Spacer
        :width="16"/>
      <TagInput
        helper="Assigned roles to which this applies"
        :grow="1"
        label="Areas of contribution"
        label-field="name"
        :limit="true"
        :menu="roles"
        placeholder="Areas of contribution"
        :readonly="!editing"
        theme="light"
        :value="selected.roles"/>
      <Spacer
        :width="16"/>
      <Select
        helper="Include on website"
        label="Publish"
        label-field="label"
        :options="yesno"
        :readonly="!editing"
        theme="light"
        v-model="publish"
        :width="155"/>
    </Box>

    <Box
      direction="row"
      :margin-bottom="16"
      :margin-left="16"
      :margin-right="16">
      <Button
        :disabled="readonly"
        disabled-icon="/img/add-disabled.svg"
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
        v-show="editing && selected.id !== null">
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
        :disabled="selected.account_id === null || readonly"
        disabled-icon="/img/edit-disabled.svg"
        icon="/img/edit.svg"
        v-show="selected.id !== null && !editing">
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
      direction="row"
      :margin-left="16"
      :margin-right="16">
      <Label
        background="#e0e0e0"
        :weight="600"
        :height="47"
        :padding-left="16"
        :width="110">
        Date
      </Label>
      <Label
        background="#e0e0e0"
        :weight="600"
        :grow="1"
        :height="47"
        :padding-left="16">
        Description
      </Label>
      <Label
        background="#e0e0e0"
        :weight="600"
        :height="47"
        :padding-left="16"
        :width="200">
        Type
      </Label>
      <Label
        background="#e0e0e0"
        :weight="600"
        :height="47"
        :padding-right="16"
        :width="220">
        Areas
      </Label>
    </Box>

    <div
      class="list">

      <Box
        class="item"
        @click.native="change( index )"
        direction="row"
        :key="index"
        v-for="( item, index ) in contributions">
        <Label
          :height="47"
          :padding-left="16"
          :width="110">
          {{item.contributed_at | long}}
        </Label>

        <Label
          :grow="1"
          :height="47"
          :padding-left="16"
          v-if="item.link === null">
          {{item.description}}
        </Label>
        <Box
          :basis="0"
          direction="row"
          :grow="1">
          <LinkButton
            @click.native="show( item.link )"
            :grow="0"
            :padding-bottom="1"
            :padding-left="16"
            v-if="item.link !== null">
            {{item.description}}
          </LinkButton>                
        </Box>

        <Label
          :height="47"
          :padding-left="16"
          :width="200">
          {{item.capacity_name}}
        </Label>
        <Box
          direction="row"
          :grow="0"
          :height="47"
          :width="220">
          <Tag
            :background="role.background"
            cursor="default"
            :disabled="true"
            :foreground="role.foreground"
            :key="role.id"
            style="margin-top: 11px;"
            v-for="role in item.roles">
            {{role.name}}
          </Tag>
        </Box>
      </Box>

    </div>

  </Box>
</template>

<script>
import Box from '../../containers/Box.vue';
import Button from '../../controls/Button.vue';
import DatePicker from '../../controls/DatePicker.vue';
import Label from '../../controls/Label.vue';
import LinkButton from '../../controls/LinkButton.vue';
import Select from '../../controls/Select.vue';
import Spacer from '../../controls/Spacer.vue';
import Tag from '../../controls/Tag.vue';
import TagInput from '../../controls/TagInput.vue';
import TextInput from '../../controls/TextInput.vue';

export default {
  name: 'Activity',
  components: {
    Box,
    Button,
    DatePicker,
    Label,
    LinkButton,
    Select,
    Spacer,
    Tag,
    TagInput,
    TextInput
  },
  props: {
    disabled: {type: Boolean, default: false},
    label: {type: String, default: null},
    readonly: {type: Boolean, default: false}
  },
  data: function() {
    return {
      active: false,
      editing: false,
      error: null
    };
  },
  computed: {
    capacities: function() {
      return this.$store.getters['capacity/CAPACITIES'];
    },
    capacity: {
      get: function() {
        return this.$store.getters['community/activity/CAPACITY'];
      },
      set: function( value ) {
        this.$store.dispatch( 'community/activity/SET_CAPACITY', value );
      }
    },
    contributions: function() {
      return this.$store.getters['community/activity/CONTRIBUTIONS'];
    },
    contributed: {
      get: function() {
        return this.$store.getters['community/activity/CONTRIBUTED'];
      },
      set: function( value ) {
        this.$store.dispatch( 'community/activity/SET_CONTRIBUTED', value );
      }
    },
    description: function() {
      return this.$store.getters['community/activity/DESCRIPTION'];
    },
    member_id: function() {
      return this.$store.getters.MEMBER_ID;
    },
    original: {
      get: function() {
        return this.$store.getters['community/activity/ORIGINAL'];
      },
      set: function( value ) {
        this.$store.dispatch( 'community/activity/SET_ORIGINAL', value );
      }
    },
    publish: {
      get: function() {
        return this.$store.getters['community/activity/PUBLIC'] === 0 ? 1 : 0;
      },
      set: function( value ) {
        this.$store.dispatch( 'community/activity/SET_PUBLIC', value === 0 ? 1 : 0 );
      }
    },
    roles: function() {
      return this.$store.getters.ROLES;
    },
    selected: {
      get: function() {
        return this.$store.getters['community/activity/SELECTED'];
      },
      set: function( value ) {
        this.$store.dispatch( 'community/activity/SET_SELECTED', value );
      }
    },
    token: function() {
      return this.$store.getters.TOKEN;
    },
    yesno: function() {
      return this.$store.getters.YESNO;
    }    
  },
  methods: {
    add: function() {
      this.clear();
      this.editing = true;
    },
    cancel: function() {
      this.editing = false;
      this.error = null;

      if( this.selected.id === null ) {
        this.clear()
      } else {
        this.restore();

        for( let c = 0; c < this.capacities.length; c++ ) {
          if( this.capacities[c].id === this.selected.capacity_id ) {
            this.capacity = c;
            break;
          }
        }
      }
    },
    clear: function() {
      this.$store.dispatch( 'community/activity/CLEAR_SELECTED' );
    },
    copy: function() {
      this.$store.dispatch( 'community/activity/COPY_SELECTED' );      
    },
    change: function( index ) {
      if( this.editing ) {
        let confirm = window.confirm( `Want to save your changes?` );

        if( confirm ) {
          this.save();
        }
      }

      this.editing = false;
      this.error = null;

      this.selected = this.contributions[index];

      const contributed = new Date( this.selected.contributed_at );
      const year = contributed.getFullYear();
      const month = String( contributed.getMonth() + 1 ).padStart( 2, '0' );
      const date = String( contributed.getDate() ).padStart( 2, '0' );
      this.contributed = `${year}-${month}-${date}`;

      for( let c = 0; c < this.capacities.length; c++ ) {
        if( this.capacities[c].id === this.selected.capacity_id ) {
          this.capacity = c;
          break;
        }
      }
    },
    edit: function() {
      this.copy();
      this.editing = true;
    },
    remove: function() {
      this.editing = false;
      this.error = null;

      this.$store.dispatch( 'community/activity/REMOVE_CONTRIBUTION' );
    },
    restore: function() {
      this.$store.dispatch( 'community/activity/RESTORE_ORIGINAL' );
    },
    save: function() {
      if( this.description === null ) {
        this.error = 'You must provide a description';
        return;
      }

      this.editing = false;
      this.error = null;

      if( this.selected.id === null ) {
        this.$store.dispatch( 'community/activity/CREATE_CONTRIBUTION' );
      } else {
        this.$store.dispatch( 'community/activity/UPDATE_CONTRIBUTION' );
      }
    },
    show: function( link ) {
      window.open( link, '_blank' );
    }
  },
  filters: {
    long: function( value ) {
      const months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ];
      const at = new Date( value );

      return `${at.getDate()} ${months[at.getMonth()]} ${at.getFullYear()}`;
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
  background-color: white;
  flex-basis: 0;
  flex-grow: 1;
  margin-bottom: 24px;
  margin-left: 16px;
  margin-right: 16px;
  margin-top: 0;
  overflow: scroll;
}
</style>
