import { NotFoundError } from '../errors/not-found-error'
import { Contact } from '../models/contact'
import { User } from '../models/user'

export class UserInfo {
  constructor(
    id: string,
    firstName: string,
    lastName: string,
    email: string,
    avatarUrl: string
  ) {
    this.id = id
    this.firstName = firstName
    this.lastName = lastName
    this.email = email
    this.avatarUrl = avatarUrl || 'https://picsum.photos/200/300'
  }

  getDisplayName() {
    return this.firstName + ' ' + this.lastName
  }

  id: string
  firstName: string
  lastName: string
  email: string
  avatarUrl: string
}

class ContactInfo extends UserInfo {
  constructor(
    id: string,
    firstName: string,
    lastName: string,
    email: string,
    avatarUrl: string,
    conversationId: string
  ) {
    super(id, firstName, lastName, email, avatarUrl)
    this.conversationId = conversationId
  }

  conversationId: string
}

const getUser = async (id: string) => {
  var user = await User.findById(id)

  if (user) {
    return new UserInfo(
      user.id,
      user.firstName,
      user.lastName,
      user.email,
      user.avatarUrl
    )
  }

  throw new NotFoundError('USER_NOT_FOUND')
}

const getUserByIdentityId = async (identityId: string) => {
  var user = await User.findOne({ identityId })

  if (user) {
    return new UserInfo(
      user.id,
      user.firstName,
      user.lastName,
      user.email,
      user.avatarUrl
    )
  }

  throw new Error('USER_NOT_FOUND')
}

const getUserContacts = async (userId: string) => {
  let userContacts = await Contact.findOne({ userId })
  let contacts = await User.find({
    _id: { $in: userContacts?.contacts },
  })
  return contacts.map(contact => {
    return new ContactInfo(
      contact.id,
      contact.firstName,
      contact.lastName,
      contact.email,
      contact.avatarUrl,
      ''
    )
  })
}

const searchContacts = (userId: string) => { }

export { getUser, getUserContacts, getUserByIdentityId, searchContacts }
