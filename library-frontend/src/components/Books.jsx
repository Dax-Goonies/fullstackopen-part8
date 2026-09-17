import { useQuery } from '@apollo/client/react'
import { ALL_BOOKS } from '../queries'

// Books component: List of books
const Books = (props) => {
    const result = useQuery(ALL_BOOKS)

  if (!props.show) {
    return null
  }

  if (result.loading) {
    return <div>...loading books</div>
  }

  if (result.error) {
    return <div>error loading books: {result.error.message}</div>
  }

  return (
    <div>
      <h2>books</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {result.data.allBooks.map((b) => (
            <tr key={b.title}>
              <td>{b.title}</td>
              <td>{b.author.name}</td>
              <td>{b.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Books
