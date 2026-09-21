import { useState } from 'react'
import { useApolloClient, useSubscription } from '@apollo/client/react'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import LoginForm from './components/LoginForm'
import Favorite from './components/Recommend'
import { BOOK_ADDED } from './queries'
import { addBookToCache } from './utils/apolloCache'


// App Component
const App = () => {
  const [token, setToken] = useState(localStorage.getItem('library-user-token'))
  const [page, setPage] = useState('authors')
  const [error, setError] = useState(null)
  const loggedIn = token !== null
  const client = useApolloClient()

  const notify = (message) => {
    setError(message)
    setTimeout(() => setError(null), 5000)
  }

  useSubscription(BOOK_ADDED, {
    onData: ({ data }) => {
      console.log(data)
      const addedBook = data.data.bookAdded
      addBookToCache(client.cache, addedBook)
      notify(`${addedBook.title} added`)
    }
  })

  const onLogout = () => {
    setToken(null)
    localStorage.clear()
    client.resetStore()
  }

  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        {loggedIn && <button onClick={() => setPage('add')}>add book</button>}
        {loggedIn && <button onClick={() => setPage('recommend')}>recommend</button>}
        {loggedIn
          ? <button onClick={onLogout}>logout</button>
          : <button onClick={() => setPage('login')}>login</button>
        }
      </div>

      {error && <div style={{ color: 'red' }}>{error}</div>}

      <Authors show={page === 'authors'} loggedIn={loggedIn} />
      <Books show={page === 'books'}  setPage={setPage} />
      <LoginForm show={page === 'login'} setToken={setToken} setError={notify} setPage={setPage} />
      {loggedIn && <NewBook show={page === 'add'} setPage={setPage} />}
      {loggedIn && <Favorite show={page === 'recommend'} />}
    </div>
  )
}

export default App
