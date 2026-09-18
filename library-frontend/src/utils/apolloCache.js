import { ALL_BOOKS } from '../queries'

export const addBookToCache = (cache, bookToAdd) => {
  cache.updateQuery({ query: ALL_BOOKS, variables: { genre: null } }, (data) => {
    if (!data) return data

    const bookExits = data.allBooks.some(
      (book) => book.title === bookToAdd.title
    )

    if (bookExits) {
      return data
    }

    return {
      allBooks: data.allBooks.concat(bookToAdd)
    }

  })
}