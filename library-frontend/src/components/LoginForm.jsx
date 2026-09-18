import { useState } from 'react'
import { useMutation } from '@apollo/client/react'
import { LOGIN } from '../queries'

// Login form component
const LoginForm = ({ setError, setToken, setPage, show }) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const [ login ] = useMutation(LOGIN, {
    onCompleted: (data) => {
      const token = data.login.value
      setToken(token)
      localStorage.setItem('library-user-token', token)
      setUsername('')
      setPassword('')
      setPage('authors')
    },
    onError: (error) => {
      setError(error.message)
    }
  })

  if (!show) {
    return null
  }

  const submit = (e) => {
    e.preventDefault()
    login({ variables: { username, password } })
  }

  return (
    <div>
      <form onSubmit={submit}>
        <div>
          <label>
            username <input
              value={username}
              onChange={({ target }) => setUsername(target.value)}
            />
          </label>
        </div>
        <div>
          <label>
            password <input
              type='password'
              value={password}
              onChange={({ target }) => setPassword(target.value)}
            />
          </label>
        </div>
        <button type='submit'>login</button>
      </form>
    </div>
  )
}

export default LoginForm