import { gql } from '@apollo/client'

// Query all books
export const ALL_BOOKS = gql`
  query {
    allBooks {
      title
      author {
        name
      }
      published
      genres
    }
  }
`

// Query all authors
export const ALL_AUTHORS = gql`
  query {
    allAuthors {
      name
      born
      bookCount
    }
  }
`

// Query to create new book
export const CREATE_BOOK = gql`
  mutation createBook(
    $title: String!
    $author: String!
    $published: Int!
    $genres: [String!]!
  ) {
    addBook(title: $title, author: $author, published: $published, genres: $genres) {
      title
      author {
        name
      }
      published
      genres
    }
  }
`

// Query to edit author: add or modify birthyear
export const EDIT_AUTHOR = gql`
  mutation editAuthor(
    $name: String!
    $setBornTo: Int!
  ) {
    editAuthor(name: $name, setBornTo: $setBornTo) {
      name
      born
    }
  }
`