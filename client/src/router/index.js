import Vue from 'vue'
import Router from 'vue-router'
import Books from '@/components/Books'
import NewBook from '@/components/NewBook'
import EditBook from '@/components/EditBook'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'Books',
      component: Books
    },
    {
      path: '/new',
      name: 'NewBook',
      component: NewBook
    },
    {
      path: '/:id',
      name: 'EditBook',
      component: EditBook
    }
  ]
})
