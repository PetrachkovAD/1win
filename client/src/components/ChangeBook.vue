<template lang="pug">
  section.edit.container
    .row
      .col-xs-12
        h1
          | {{ isNewBook() ? 'Add new' : 'Edit' }} book
        form( @submit.prevent="isNewBook() ? addBook() : editBook()" name="book" )
          .form-group
            input.form-control(type="text", name="title", id="title", placeholder="Title", v-model.trim="title" required )
          .form-group
            input.form-control( type="text", name="autor", id="autor", placeholder="Autor", v-model.trim="autor" required )
          .form-group
            input.form-control(
              type="date",
              name="date",
              id="date",
              placeholder="Date",
              :value="date && date.toISOString().split('T')[0]"
              @input="date = $event.target.valueAsDate"
              required
            )
          .form-group
            textarea.form-control( type="text", rows="5", name="description", id="description", placeholder="Description", v-model.trim="description" required )
          .form-group
            .form-control
              input( type="file", name="image", id="image", placeholder="Image", @change="sync" :required="srcImage ? false : true" )
              div(v-if="srcImage")
                img( :src="srcImage" width="100" style="padding-top: 8px;")
          .text-danger(v-if="errors.length")
            | Пожалуйста исправьте указанные ошибки:
            ul
              li(v-for="error in errors")
                | {{ error }}
          .form-group
            button.btn.btn-block.btn-primary( type="submit", name="cnahgeBook" )
              | {{ isNewBook() ? 'add new' : 'edit' }} book
          router-link.btn.btn-success.btn-block( :to="{ name: 'Books' }" )
            | go to list of books

</template>

<script>
import BookService from '@/services/BookService'
import path from 'path'
const typeImage = ['image/png', 'image/gif', 'image/jpg']

export default {
  name: 'EditBook',
  data () {
    return {
      errors: [],
      title: '',
      autor: '',
      date: '',
      description: '',
      image: undefined,
      srcImage: ''
    }
  },
  props: ['chage'],
  methods: {
    async addBook () {
      if (this.title !== '' && this.autor !== '' && this.date !== '' && this.description !== '' && this.image) {
        if (typeImage.indexOf(this.image.type) !== -1) {
          const data = new FormData(document.forms.book)
          await BookService.addNewBook(data)
          this.$router.push({ name: 'Books' })
        } else {
          this.errors.push('Не верный тип изображения')
        }
      } else {
        this.errors.push('Заполнены не все поля')
      }
    },
    async getBook () {
      const response = await BookService.getBook({ id: this.$route.params.id })
      this.title = response.data[0].title
      this.autor = response.data[0].autor
      this.date = new Date(response.data[0].date)
      this.description = response.data[0].description
      this.srcImage = path.join('/', response.data[0].image)
    },
    async editBook () {
      if (this.title !== '' && this.autor !== '' && this.date !== '' && this.description !== '') {
        if (!this.image || typeImage.indexOf(this.image.type) !== -1) {
          const data = new FormData(document.forms.book)
          data.set('id', this.$route.params.id)
          await BookService.updateBook(data)
          this.$router.push({ name: 'Books' })
        } else {
          this.errors.push('Не верный тип изображения')
        }
      } else {
        this.errors.push('Заполнены не все поля')
      }
    },
    sync (e) {
      e.preventDefault()
      this.image = e.target.files[0]

      let reader = new FileReader()
      reader.onload = this.onImageLoad
      reader.readAsDataURL(this.image)
    },
    onImageLoad (e) {
      this.srcImage = e.target.result
    },
    isNewBook () {
      return this.chage === 'create'
    }
  },
  mounted () {
    if (!this.isNewBook()) this.getBook()
  }
}
</script>
