import { useQuery } from '@apollo/client/react'
import { ALL_BOOKS, ME } from '../queries'

// Recommend component: User's favorite genre books
const Favorite = (props) => {
  const userResult = useQuery(ME)
  const favoriteGenre = userResult.data?.me?.favoriteGenre

  const result = useQuery(ALL_BOOKS, {
    variables: { genre: favoriteGenre },
    skip: !favoriteGenre,
  })

  if (!props.show) {
    return null
  }

  if (userResult.loading || result.loading) {
    return <div>loading recommendations...</div>
  }

  if (result.error) {
    return <div>error loading recommendations: {result.error.message}</div>
  }

  const books = result.data.allBooks

  return (
    <div>
      <h2>recommendations</h2>
      {favoriteGenre && <p>books in your favorite genre <strong>{favoriteGenre}</strong></p>}
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {books.map((b) => (
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

export default Favorite