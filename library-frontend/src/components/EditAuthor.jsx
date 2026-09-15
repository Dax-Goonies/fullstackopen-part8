import { useState } from 'react'
import { useMutation, useQuery } from '@apollo/client/react'
import { ALL_AUTHORS, EDIT_AUTHOR } from '../queries'

// Edit author component: Select author and edit birthyear
const EditAuthor = () => {
  const [name, setName] = useState('')
  const [born, setBorn] = useState('')
  const { data } = useQuery(ALL_AUTHORS)
  const [editAuthor] = useMutation(EDIT_AUTHOR, {
    refetchQueries: [{ query: ALL_AUTHORS }]
  })

  const submit = async (event) => {
    event.preventDefault()

    const result = await editAuthor({ variables: { name, setBornTo: Number(born) } })

    if (!result.data.editAuthor) {
      console.log('author not found')
    }
    setName('')
    setBorn('')
  }

  return (
    <div>
      <h3>Set birthyear</h3>
      <form onSubmit={submit}>
        <div>
        <select value={name} onChange={({ target }) => setName(target.value)}>
          <option value="">select author</option>
          {data?.allAuthors.map(a => (
            <option key={a.name} value={a.name}>
              {a.name}
            </option>
          ))}
        </select>
        </div>
        <div>
          <label>
            born
            <input 
              value={born}
              onChange={({ target }) => setBorn(target.value)}
            />
          </label>
        </div>
        <button type="submit">update author</button>
      </form>
    </div>
  )
}

export default EditAuthor