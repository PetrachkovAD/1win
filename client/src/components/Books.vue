<template lang="pug">
  .container
    .row
      .col-xs-12
        h1
          | Books
        h3
          | This file will list all the book
        div
          router-link( :to="{ name: 'NewBook' }" )
            | add new book

        section.panel.panel-success( v-if="books.length" )
          .panel-heading
            | list of books
          search-string( @search="search")
          table.table.table-striped
            tr
              th
                span.text
                  | Title
                span.oi.oi-arrow-bottom(
                  @click="sortTitle('down')",
                  :class="{ active : sortByTitle=='down' }"
                )
                span.oi.oi-arrow-top(
                  @click="sortTitle('up')",
                  :class="{ active : sortByTitle=='up' }"
                )
              th Image
              th
                span.text
                  | Date
                span.oi.oi-arrow-bottom(
                  @click="sortDate('down')",
                  :class="{ active : sortByDate=='down' }"
                )
                span.oi.oi-arrow-top(
                  @click="sortDate('up')",
                  :class="{ active : sortByDate=='up' }"
                )
              th
                span.text
                  | Description
                span.oi.oi-arrow-bottom(
                  @click="sortDescription('down')",
                  :class="{ active : sortByDescription=='down' }"
                )
                span.oi.oi-arrow-top(
                  @click="sortDescription('up')",
                  :class="{ active : sortByDescription=='up' }"
                )
              th
                span.text
                  | Autor
                span.oi.oi-arrow-bottom(
                  @click="sortAutor('down')",
                  :class="{ active : sortByAutor=='down' }"
                )
                span.oi.oi-arrow-top(
                  @click="sortAutor('up')",
                  :class="{ active : sortByAutor=='up' }"
                )
              th Action
            tr( v-for="(book, index) in books", :key="book.id" )
              td {{ book.title }}
              td
                img( :src="book.image" width="100")
              td {{ (new Date(book.date)).toLocaleDateString() }}
              td {{ book.description }}
              td {{ book.autor }}
              td
                router-link( :to="{ name: 'EditBook', params: { id: book.id } }" style="white-space: nowrap")
                  | edit book
                br
                button.btn.btn-danger.btn-sm( type="button", @click="removeBook(book.id)" )
                  | delete
          pagination(
            :total="totalBook",
            :curr-page="page",
            :page-size="pageSize",
            @changePage="getBooks"
          )

        section.panel.panel-danger( v-if="!books.length" )
          search-string( @search="search")
          p
            | There are no books ... Lets add one now!
          div
            router-link( :to="{ name: 'NewBook' }" )
              | add new book
</template>

<script>
// Компонент списка книг, в нем происходит отображение фильтрация и сортировка
import BookService from '@/services/BookService'
import Pagination from './Pagination'
import SearchString from './SearchString'

export default {
  components: {
    Pagination,
    SearchString
  },
  name: 'Books',
  data () {
    return {
      books: [],
      page: 1,
      pageSize: 5,
      totalBook: 0,
      searchText: '',
      searchDate: undefined,
      sortByAutor: '',
      sortByTitle: '',
      sortByDate: '',
      sortByDescription: ''
    }
  },
  methods: {
    async getBooks (page) {
      this.page = page

      let response = await BookService.fetchBook({
        'page': page,
        'pageSize': this.pageSize,
        'searchText': this.searchText,
        'searchDate': this.searchDate,
        'sort': {
          sortByAutor: this.sortByAutor,
          sortByTitle: this.sortByTitle,
          sortByDate: this.sortByDate,
          sortByDescription: this.sortByDescription
        }
      })

      this.books = response.data.books
      this.totalBook = response.data.totalCount[0]['COUNT(1)']
    },
    async removeBook (value) {
      await BookService.deleteBook(value)
      this.getBooks(this.page)
    },
    search (text, date) {
      this.searchText = text
      this.searchDate = date
      this.getBooks(1)
    },
    // TODO вынести в одну функцию
    sortAutor (direct) {
      if (this.sortByAutor !== direct) this.sortByAutor = direct
      else this.sortByAutor = ''
      this.getBooks(1)
    },
    sortTitle (direct) {
      if (this.sortByTitle !== direct) this.sortByTitle = direct
      else this.sortByTitle = ''
      this.getBooks(1)
    },
    sortDate (direct) {
      if (this.sortByDate !== direct) this.sortByDate = direct
      else this.sortByDate = ''
      this.getBooks(1)
    },
    sortDescription (direct) {
      if (this.sortByDescription !== direct) this.sortByDescription = direct
      else this.sortByDescription = ''
      this.getBooks(1)
    }
  },
  mounted () {
    this.getBooks(this.page)
  }
}
</script>

<style scoped>
  th {
    white-space: nowrap;
  }
  th .text {
    margin-right: 4px;
  }
  .oi.active {
    color: red;
  }
</style>
