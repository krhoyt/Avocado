<template>
  <Box
    :grow="1">

    <Box
      direction="row"
      :margin-bottom="5"
      :margin-left="16"
      :margin-right="16"
      :margin-top="16">

      <Photo
        :disabled="true"
        :label="initials"
        title="Profile image - coming soon"/>
      <Spacer
        :width="16"/>
      <TextInput
        :error="error"
        label="Full name"
        placeholder="Full name"
        :readonly="readonly"
        ref="name"
        title="Full name"
        v-model="name"/>
      <Spacer
        :width="16"/>
      <TextInput
        label="Email address"
        placeholder="Email address"
        :readonly="readonly"
        ref="email"
        title="Email address"
        v-model="email"/>

    </Box>
    <Tabs>

      <Overview
        label="Overview"
        :readonly="readonly"/>
      <Profile
        label="Profile"
        :readonly="readonly"/>
      <Social
        :disabled="selected === null ? true : false"
        :label="social_count"
        :readonly="readonly"/>
        <!--
      <Activity
        :disabled="selected === null ? true : false"      
        :label="activity_count"
        :readonly="readonly"/>
        -->
      <Note
        :disabled="selected === null ? true : false"      
        :label="notes_count"
        :readonly="readonly"/>

    </Tabs>

    <Box
      direction="row"
      :height="47"
      :margin-bottom="16"
      :margin-left="16"
      :margin-right="16"
      :margin-top="16">
      <Button
        @click.native="cancel"
        kind="secondary"
        v-show="editing">
        Cancel
      </Button>
      <Button
        @click.native="edit"
        :disabled="account === null"
        disabled-icon="/img/edit-disabled.svg"
        icon="/img/edit.svg"
        v-show="selected !== null && !editing">
        Edit
      </Button>
      <Button
        @click.native="save"
        icon="/img/save.svg"
        v-show="editing">
        Save
      </Button>      
      <Spacer
        :grow="1"/>
      <Button
        icon="/img/export.svg"
        kind="ghost"
        title="Export vCard"
        v-show="selected !== null && !editing"/>
      <Button
        @click.native="remove"
        disabled-icon="/img/delete-disabled.svg"
        icon="/img/delete.svg"
        kind="danger"
        v-show="editing && selected !== null">
        Delete
      </Button>
    </Box>

  </Box>
</template>

<script>
import Activity from '../../manager/members/Activity.vue';
import Box from '../../containers/Box.vue';
import Button from '../../controls/Button.vue';
import Label from '../../controls/Label.vue';
import Note from '../../manager/members/Note.vue';
import Overview from './Overview.vue';
import Photo from '../Photo.vue';
import Profile from '../../manager/members/Profile.vue';
import Social from '../../manager/members/Social.vue';
import Spacer from '../../controls/Spacer.vue';
import Tabs from '../../containers/Tabs.vue';
import TextInput from '../../controls/TextInput.vue';

export default {
  name: 'Detail',
  components: {
    Activity,
    Box,
    Button,    
    Label,
    Note,
    Overview,
    Photo,
    Profile,
    Social,
    Spacer,
    Tabs,
    TextInput
  },
  data: function() {
    return {
      editing: false,
      error: null,
      readonly: true
    }
  },
  computed: {
    activity_count: function() {
      return `Activity (${this.$store.getters['community/activity/CONTRIBUTIONS'].length})`;
    },    
    initials: function() {
      return this.$store.getters['community/INITIALS'];
    },
    account: function() {
      return this.$store.getters.ACCOUNT;
    },
    email: {
      get: function() {
        return this.$store.getters['community/EMAIL'];
      },
      set: function( value ) {
        this.$store.dispatch( 'community/SET_EMAIL', value );
      }
    },    
    name: {
      get: function() {
        return this.$store.getters['community/NAME'];
      },
      set: function( value ) {
        this.$store.dispatch( 'community/SET_NAME', value );
      }
    },
    notes_count: function() {
      return `Notes (${this.$store.getters['community/notes/NOTES'].length})`;
    },
    selected: function() {
      return this.$store.getters['community/MEMBER_ID'];
    },
    social_count: function() {
      return `Social (${this.$store.getters['community/social/SOCIAL'].length})`;
    }
  },
  methods: {
    add: function() {
      this.$store.dispatch( 'community/CLEAR_SELECTED' );

      this.editing = true;
      this.readonly = false;
    },    
    cancel: function() {
      this.error = null;
      this.editing = false;
      this.readonly = true;

      if( this.selected === null ) {
        this.$store.dispatch( 'community/CLEAR_SELECTED' );
      } else {
        this.$store.dispatch( 'community/RESTORE_ORIGINAL' );
      }
    },    
    edit: function() {
      this.editing = true;
      this.readonly = false;

      this.$store.dispatch( 'community/COPY_SELECTED' );
    },
    save: function() {
      if( this.name === null ) {
        this.error = 'You must provide a community member name';
        return;
      } else {
        if( this.name.trim().length === 0 ) {
          this.error = 'You must provide a community member name';
          return;
        }
      }

      this.editing = false;
      this.error = null;
      this.readonly = true;

      if( this.selected === null ) {
        this.$store.dispatch( 'community/CREATE_MEMBER' );
      } else {
        this.$store.dispatch( 'community/UPDATE_MEMBER' );
      }
    },
    remove: function() {
      let confirm = window.confirm( 
        `Are you sure you want to remove ${this.name}?`
      );

      if( confirm ) {
        const id = this.selected;

        this.editing = false;
        this.error = null;
        this.readonly = true;

        this.$store.dispatch( 'community/CLEAR_SELECTED' );
        this.$store.dispatch( 'community/REMOVE_MEMBER', id );      
      }
    }
  }
}
</script>
