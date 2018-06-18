import api from '@/services/api'

var fileHeaders = {
  headers: {
    'Content-Type': 'multipart/form-data'
  }
}

export default {
  fetchBook (params) {
    let queryUrl = `book?page=${params.page}&page-size=${params.pageSize}`
    if (params.searchText) queryUrl += `&search-text=${params.searchText}`
    if (params.searchDate) queryUrl += `&search-date=${params.searchDate}`
    if (params.sort.sortByAutor) queryUrl += `&sort-autor=${params.sort.sortByAutor}`
    if (params.sort.sortByTitle) queryUrl += `&sort-title=${params.sort.sortByTitle}`
    if (params.sort.sortByDate) queryUrl += `&sort-date=${params.sort.sortByDate}`
    if (params.sort.sortByDescription) queryUrl += `&sort-description=${params.sort.sortByDescription}`
    return api().get(
      queryUrl
    )
  },
  addNewBook (params) {
    return api().post('book', params, fileHeaders)
  },
  getBook (params) {
    return api().get(`book/${params.id}`)
  },
  updateBook (params) {
    return api().put(`book/${params.get('id')}`, params, fileHeaders)
  },
  deleteBook (id) {
    return api().delete(`book/${id}`)
  }
}
