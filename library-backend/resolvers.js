const { GraphQLError } = require('graphql')
const { PubSub } = require('graphql-subscriptions')
const jwt = require('jsonwebtoken')

const Author = require('./models/author')
const Book = require('./models/book')
const User = require('./models/user')

const pubsub = new PubSub()

// GraphQL resolvers for the library app
const resolvers = {
  // Query & Mutation fileds correpond directly to schema.js
  Query: {
    bookCount: async () => Book.collection.countDocuments(),
    authorCount: async () => Author.collection.countDocuments(),
    allBooks: async (root, args) => {
      let filter = {}
      // Check: Author parameter in query
      if (args.author) {
        const author = await Author.findOne({ name: args.author })
        if (!author) {
          return []
        }
        filter.author = author._id
      }
      // Check: Genre parameter in query
      if (args.genre) {
        filter.genres = args.genre
      }
      return Book.find(filter).populate('author')
    },
    // Uses aggregation to solve N+1 problem for bookCount
    allAuthors: async () => {
      console.log('Query1: fetching all authors')
      const authors = await Author.find({})
      console.log('Query 2: aggrating book counts')
      const counts = await Book.aggregate([
        { $group: { _id: '$author', count: { $sum: 1 } } }
      ])
      const countMap = Object.fromEntries(
        counts.map((c) => [c._id.toString(), c.count])
      )

      return authors.map((author) => {
        author.bookCount = countMap[author._id.toString()] || 0
        return author
      })

    },
    me: async (root, args, context) => {
      return context.currentUser
    }
  },

  Mutation: {
    // Add book: Dynamically add and redirect to 'books' page
    addBook: async (root, args, context) => {
      // Check: If user is connected
      const currentUser = context.currentUser
      if (!currentUser) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'BAD_USER_INPUT' }
        })
      }

      let author = await Author.findOne({ name: args.author })
      // Check: If author exists, if not add it
      if (!author) {
        author = new Author({ name: args.author })
        try {
          await author.save()
        } catch (error) {
          throw new GraphQLError(`Saving author failed: ${error.message}`, {
            extensions: {
              code: 'BAD_USER_INPUT',
              invalidArgs: args.author,
              error,
            },
          })
        }
      }

      const book = new Book({ ...args, author: author._id })
      try {
        await book.save()
      } catch (error) {
        throw new GraphQLError(`Saving book failed: ${error.message}`, {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.title,
            error,
          }
        })
      }

      const savedBook = await book.populate('author')
      pubsub.publish('BOOK_ADDED', { bookAdded: savedBook })
      return savedBook
    },
    // Edit author birth year, if author does not exist return null
    editAuthor: async (root, args, context) => {
      // Check: If user is connected
      const currentUser = context.currentUser
      if (!currentUser) {
        throw new GraphQLError('Not authenticated', {
          extensions: {
            code: 'BAD_USER_INPUT',
          }
        })
      }

      const author = await Author.findOne({ name: args.name })
      // Check: If author exists
      if (!author) {
        return null
      }
      author.born = args.setBornTo
      try {
        return author.save()
      } catch (error) {
        throw new GraphQLError(`Updating author failed: ${error.message}`, {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.setBornTo,
            error,
          },
        })
      }
    },
    // Create new User with username and favorite genre
    createUser: async (root, args) => {
      const user = new User({
        username: args.username,
        favoriteGenre: args.favoriteGenre 
      })

      try {
        return user.save()
      } catch (error) {
        throw new GraphQLError(`Creating the user failed: ${error.message}`, {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.username,
            error,
          }
        })
      }
    },
    // Login with credentials
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username})

      if (!user || args.password !== 'secret') {
        throw new GraphQLError('login failed: wrong credentials', {
          extensions: {
            code: 'BAD_USER_INPUT',
          }
        })
      }
      const userForToken = {
        username: user.username,
        id: user._id
      }

      return { value: jwt.sign(userForToken, process.env.JWT_SECRET)}
    },
    // Reset DB between tests
    _resetDatabase: async () => {
      if (process.env.NODE_ENV !== 'test') {
        throw new GraphQLError('_resetDatabase is only available in test mode')
      }
      await Author.deleteMany({})
      await Book.deleteMany({})
      await User.deleteMany({})
      return true
    },
  },
  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterableIterator('BOOK_ADDED'),
    },
  },
}

module.exports = resolvers