<template lang="pug">
  nav
    ul.pagination.justify-content-center
      li.page-item( :class="{ disabled : !hasPrev() }" )
        a.page-link(href="#" @click="changePage(prevPage)")
          | Previous
      li.page-item( v-if="hasFirst()" )
        a.page-link(href="#" @click="changePage(1)")
          | 1
      li.page-item( v-for="page in pages", :class="{active : currPage == page}" )
        a.page-link(href="#" @click="changePage(page)")
          | {{ page }}
      li.page-item( v-if="hasLast()" )
        a.page-link(href="#" @click="changePage(totalPage)")
          | {{ totalPage }}
      li.page-item( :class="{ disabled : !hasNext() }" )
        a.page-link(href="#" @click="changePage(nextPage)")
          | Next
</template>

<script>
export default {
  name: 'Pagination',
  props: {
    currPage: {
      type: Number,
      default: 1
    },
    pageSize: {
      type: Number,
      default: 10
    },
    total: {
      type: Number,
      default: 0
    },
    pageRange: {
      type: Number,
      default: 4
    }
  },
  computed: {
    nextPage: function () {
      return this.currPage + 1
    },
    prevPage: function () {
      return this.currPage - 1
    },
    totalPage: function () {
      return Math.ceil(this.total / this.pageSize)
    },
    rangeStart: function () {
      let start = this.currPage - this.pageRange

      return start > 0 ? start : 1
    },
    rangeEnd: function () {
      let end = this.currPage + this.pageRange

      return end < this.totalPage ? end : this.totalPage
    },
    pages: function () {
      let pages = []

      for (let i = this.rangeStart; i <= this.rangeEnd; i++) {
        pages.push(i)
      }

      return pages
    }
  },
  methods: {
    changePage: function (page) {
      this.$emit('changePage', page)
    },
    hasPrev: function () {
      return this.currPage > 1
    },
    hasNext: function () {
      return this.currPage < this.totalPage
    },
    hasFirst: function () {
      return this.currPage !== 1
    },
    hasLast: function () {
      return this.currPage < this.totalPage
    }
  }
}
</script>
