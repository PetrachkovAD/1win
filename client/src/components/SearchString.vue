<template lang="pug">
  form.form-inline.float-right( @submit.prevent="search()" name="search" )
    .form-group
      input.form-control.mb-2.mr-sm-2(
        type="date",
        name="date",
        :value="searchDate && searchDate.toISOString().split('T')[0]",
        @input="searchDate = $event.target.valueAsDate"
      )
    .form-group
      .input-group
        input.form-control.mb-2.mr-sm-2(
          type="text"
          name="text"
          placeholder="Search"
          v-model="searchText"
          @input="search()"
        )
        .input-group-append
          button.btn.btn-outline-secondary.mb-2.mr-sm-2( type="submit")
            | Search
</template>

<script >
export default {
  name: 'StringSearch',
  data () {
    return {
      searchText: '',
      searchDate: undefined
    }
  },
  methods: {
    search: function () {
      this.$emit('search', this.searchText, this.searchDate)
    }
  }
}
</script>
