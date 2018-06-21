import Vue from 'vue'
import Router from 'vue-router'
import Books from '@/components/Books'
import ChangeBook from '@/components/ChangeBook'

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
      component: ChangeBook,
      props: { chage: 'create' }
    },
    {
      path: '/:id',
      name: 'EditBook',
      component: ChangeBook,
      props: { chage: 'edit' }
    }
  ]
})
