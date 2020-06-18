<template>
  <Box
    background="#f4f4f4"
    :grow="1"
    :margin-left="16"
    :margin-right="16"
    v-show="active">

    <Box
      direction="row"
      :margin-bottom="2"
      :margin-top="16"
      :margin-left="16"
      :margin-right="16">
      <TextInput
        helper="Position held, level and/or responsibilities"
        label="Job title"
        placeholder="Job title"
        :readonly="readonly"
        ref="title"
        theme="light"
        title="Job title"
        v-model="title"/>
      <Spacer
        :width="16"/>
      <TextInput
        helper="As specific or general as is desired"
        label="Location"
        placeholder="Location"
        :readonly="readonly"
        ref="location"
        theme="light"
        title="Location"
        v-model="location"/>
    </Box>

    <Box
      direction="row"
      :margin-bottom="2"
      :margin-left="16"
      :margin-right="16">
      <TagInput
        :basis="0"
        @change="organization = $event.value"
        :grow="1"
        helper="Company name and/or team nomenclature"
        label="Organization"
        labelField="name"
        :limit="true"
        :menu="organizations"
        placeholder="Organization"
        :readonly="readonly"
        ref="organizations"
        theme="light"
        :value="organization"/>
      <Spacer
        :width="16"/>
      <TagInput
        :basis="0"
        @change="relationship = $event.value"
        :grow="1"
        helper="Business connection between stakeholders"
        label="Relationship"
        labelField="name"
        :limit="true"
        :menu="relationships"
        placeholder="Relationship"
        :readonly="readonly"
        ref="relationships"
        theme="light"
        :value="relationship"/>
    </Box>

    <Box
      direction="row"
      :grow="1"
      :margin-bottom="2"
      :margin-left="16"
      :margin-right="16">
      <TextArea
        helper="Such as might be used for a conference session or social media profile"
        label="Description/Bio"
        placeholder="Description/Bio"
        :readonly="readonly"
        ref="description"
        theme="light"
        title="Description/Bio"
        v-model="description"/>
    </Box>

    <Box
      direction="row"
      :margin-bottom="5"
      :margin-left="16"
      :margin-right="16">
      <TextInput
        helper="Reference to the system of record"
        label="Internal ID"
        placeholder="Internal ID"
        :readonly="readonly"
        ref="internal"
        theme="light"
        title="Internal ID"
        v-model="internal"/>
      <Spacer
        :width="16"/>
      <Box
        :basis="0"
        direction="row"
        :grow="1"
        justify="flex-end">
        <Select
          helper="Include on website"
          label="Publish"
          labelField="label"
          :options="yesno"
          :readonly="readonly"
          ref="publish"
          theme="light"
          title="Publish"
          v-model="publish"
          :width="155"/>
      </Box>
    </Box>

  </Box>
</template>

<script>
import Box from '../../containers/Box.vue';
import Note from '../../manager/members/Note.vue';
import Select from '../../controls/Select.vue';
import Spacer from '../../controls/Spacer.vue';
import TagInput from '../../controls/TagInput.vue';
import TextArea from '../../controls/TextArea.vue';
import TextInput from '../../controls/TextInput.vue';

export default {
  name: 'Overview',
  components: {
    Box,
    Note,
    Select,
    Spacer,
    TagInput,
    TextArea,
    TextInput
  },
  props: {
    disabled: {type: Boolean, default: false},
    label: {type: String, default: null},
    readonly: {type: Boolean, default: false}
  },
  data: function() {
    return {
      active: false
    };
  },
  computed: {
    description: {
      get: function() {
        return this.$store.getters['community/DESCRIPTION'];
      },
      set: function( value ) {
        this.$store.dispatch( 'community/SET_DESCRIPTION', value );
      }
    },
    internal: {
      get: function() {
        return this.$store.getters['community/INTERNAL'];
      },
      set: function( value ) {
        this.$store.dispatch( 'community/SET_INTERNAL', value );
      }
    },
    location: {
      get: function() {
        return this.$store.getters['community/LOCATION'];
      },
      set: function( value ) {
        this.$store.dispatch( 'community/SET_LOCATION', value );
      }
    },
    organization: {
      get: function() {
        return this.$store.getters['community/ORGANIZATIONS'];
      },
      set: function( value ) {
        this.$store.dispatch( 'community/SET_ORGANIZATIONS', value );
      }
    },
    organizations: function() {
      return this.$store.getters.ORGANIZATIONS;
    },
    yesno: function() {
      return this.$store.getters.YESNO;
    },
    publish: {
      get: function() {
        return this.$store.getters['community/PUBLIC'] === 0 ? 1 : 0;
      },
      set: function( value ) {
        this.$store.dispatch( 'community/SET_PUBLIC', value === 0 ? 1 : 0 );
      }
    },
    relationship: {
      get: function() {
        return this.$store.getters['community/RELATIONSHIPS'];
      },
      set: function( value ) {
        this.$store.dispatch( 'community/SET_RELATIONSHIPS', value );
      }
    },
    relationships: function() {
      return this.$store.getters.RELATIONSHIPS;
    },
    title: {
      get: function() {
        return this.$store.getters['community/TITLE'];
      },
      set: function( value ) {
        this.$store.dispatch( 'community/SET_TITLE', value );
      }
    }
  }
}
</script>
