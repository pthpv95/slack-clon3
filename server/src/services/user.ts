import { asyncForEach } from "../helpers"
import { Contact } from "../models/contact"
import { Conversation } from "../models/conversation"
import { IUser, User } from "../models/user"

export class UserInfo {
  constructor(id: string, firstName: string, lastName: string, email: string, avatarUrl: string) {
    this.id = id
    this.firstName = firstName
    this.lastName = lastName
    this.email = email
    this.avatarUrl = avatarUrl
  }

  getDisplayName() {
    return this.firstName + ' ' + this.lastName;
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
    return new UserInfo(user.id, user.firstName, user.lastName, user.email, user.avatarUrl)
  }

  throw new Error('USER_NOT_FOUND')
}

const getUserByIdentityId = async (identityId: string) => {
  var user = await User.findOne({ identityId })

  if (user) {
    return new UserInfo(user.id, user.firstName, user.lastName, user.email, user.avatarUrl)
  }

  throw new Error('USER_NOT_FOUND')
}

const getUserContacts = async (userId: string) => {
  var userContacts = await Contact.findOne({ userId })
  var contacts = await User.find({
    _id: { $in: userContacts?.contacts },
  })

  var contactsInfo: ContactInfo[] = []
  await asyncForEach(contacts, async (contact: IUser) => {
    const members = [contact.id, userId]
    var conversation = await Conversation.findOne({
      memberIds: { $in: members },
    })

    if (!conversation?.memberIds.some((m: string) => m === contact.id)) {
      return false
    } else {
      contactsInfo.push(
        new ContactInfo(
          contact.id,
          contact.firstName,
          contact.lastName,
          contact.email,
          contact.avatarUrl,
          conversation?._id
        )
      )
    }
  })

  return contactsInfo
}

const searchContacts = (userId: string) => {

}

export { getUser, getUserContacts, getUserByIdentityId, searchContacts }
