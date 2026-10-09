const Message = require('../models/Message');
const User = require('../models/User');

const DEFAULT_CONTACTS = [
  {
    userId: 3,
    name: "Aditi Krishnan",
    username: "aditi_k",
    role: "organizer",
    avatar: "AK",
    favoriteGenre: "Fiction",
    online: true,
    lastActive: "Just now",
    phone: "+1 (555) 234-8901",
    statusMessage: "Reading: The Silent Orchard 📖"
  },
  {
    userId: 2,
    name: "Jordan Rivera",
    username: "jordanreads",
    role: "member",
    avatar: "JR",
    favoriteGenre: "Fantasy",
    online: true,
    lastActive: "5m ago",
    phone: "+1 (555) 345-6789",
    statusMessage: "Tackling the 50-book annual quest! ⚔️"
  },
  {
    userId: 4,
    name: "Rahul Thomas",
    username: "rahul_t",
    role: "organizer",
    avatar: "RT",
    favoriteGenre: "Sci-Tech",
    online: false,
    lastActive: "1h ago",
    phone: "+1 (555) 456-7890",
    statusMessage: "Prepping slides for Weekend Deep-Dive."
  },
  {
    userId: 1,
    name: "Admin User",
    username: "admin",
    role: "admin",
    avatar: "AU",
    favoriteGenre: "Non-Fiction",
    online: true,
    lastActive: "Online",
    phone: "+1 (555) 123-4567",
    statusMessage: "BOOK FORGE Curator & Support 🛡️"
  }
];

// Seed default conversational messages if user has none
async function seedDefaultMessagesIfEmpty(currentUserId, currentUserName) {
  try {
    const count = await Message.countDocuments({
      $or: [
        { senderId: currentUserId },
        { recipientId: currentUserId }
      ]
    });

    if (count === 0) {
      const now = Date.now();
      const initialSeed = [
        {
          senderId: 3,
          senderName: "Aditi Krishnan",
          senderAvatar: "AK",
          recipientId: currentUserId,
          recipientName: currentUserName,
          channelType: "direct",
          content: `Hi ${currentUserName}! Welcome to BOOK FORGE. Are you joining our literary salon discussion on Winter's Ledger this week?`,
          createdAt: new Date(now - 3600000 * 2),
          isRead: true,
          viaPlatform: "in_app"
        },
        {
          senderId: 3,
          senderName: "Aditi Krishnan",
          senderAvatar: "AK",
          recipientId: currentUserId,
          recipientName: currentUserName,
          channelType: "direct",
          content: "Feel free to message me here anytime or ping on WhatsApp for reading circle notes!",
          createdAt: new Date(now - 3600000),
          isRead: true,
          viaPlatform: "whatsapp_sync"
        },
        {
          senderId: 2,
          senderName: "Jordan Rivera",
          senderAvatar: "JR",
          recipientId: currentUserId,
          recipientName: currentUserName,
          channelType: "direct",
          content: "Hey there! I saw you are reading 'The Silent Orchard'. How do you like chapter 4? No spoilers, but the plot twist is amazing!",
          createdAt: new Date(now - 1800000),
          isRead: false,
          viaPlatform: "in_app",
          bookAttachment: {
            bookId: 1,
            title: "The Silent Orchard",
            author: "Elena Marsh",
            coverImage: "images/books/silent-orchard.jpg"
          }
        },
        {
          senderId: 1,
          senderName: "Admin User",
          senderAvatar: "AU",
          recipientId: currentUserId,
          recipientName: currentUserName,
          channelType: "announcement",
          content: "Welcome to BOOK FORGE! Check out our new Multi-theme system (Light, Dark, and 3D) and Multilingual options in Settings.",
          createdAt: new Date(now - 7200000),
          isRead: true,
          viaPlatform: "in_app"
        }
      ];

      await Message.insertMany(initialSeed);
    }
  } catch (err) {
    console.error('Error seeding initial messages:', err);
  }
}

// GET /api/messages/contacts - Get available contacts list with last message snippet
exports.getContacts = async (req, res, next) => {
  try {
    const currentUserId = req.user.userId;
    const currentUserName = req.user.name;

    await seedDefaultMessagesIfEmpty(currentUserId, currentUserName);

    // Fetch existing registered users from DB to complement default list
    const dbUsers = await User.find({ userId: { $ne: currentUserId } })
      .select('userId name username role avatar favoriteGenre')
      .lean();

    const contactsMap = new Map();

    DEFAULT_CONTACTS.forEach(c => {
      if (c.userId !== currentUserId) {
        contactsMap.set(c.userId, { ...c });
      }
    });

    dbUsers.forEach(u => {
      if (!contactsMap.has(u.userId)) {
        contactsMap.set(u.userId, {
          userId: u.userId,
          name: u.name,
          username: u.username,
          role: u.role || 'member',
          avatar: u.avatar || 'U',
          favoriteGenre: u.favoriteGenre || 'Fiction',
          online: false,
          lastActive: 'Offline',
          phone: '+1 (555) 987-6543',
          statusMessage: 'BOOK FORGE Member'
        });
      }
    });

    // Attach latest message info and unread count for each contact
    const contactsList = Array.from(contactsMap.values());

    for (const contact of contactsList) {
      const lastMsg = await Message.findOne({
        $or: [
          { senderId: currentUserId, recipientId: contact.userId },
          { senderId: contact.userId, recipientId: currentUserId }
        ]
      }).sort({ createdAt: -1 }).lean();

      const unreadCount = await Message.countDocuments({
        senderId: contact.userId,
        recipientId: currentUserId,
        isRead: false
      });

      contact.lastMessage = lastMsg ? lastMsg.content : "Start a conversation...";
      contact.lastMessageTime = lastMsg ? lastMsg.createdAt : null;
      contact.unreadCount = unreadCount;
    }

    return res.json({
      success: true,
      contacts: contactsList
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/messages/:contactId - Get message thread with a contact
exports.getMessages = async (req, res, next) => {
  try {
    const currentUserId = req.user.userId;
    const contactId = parseInt(req.params.contactId, 10);

    if (isNaN(contactId)) {
      return res.status(400).json({ success: false, message: 'Invalid contact ID' });
    }

    const messages = await Message.find({
      $or: [
        { senderId: currentUserId, recipientId: contactId },
        { senderId: contactId, recipientId: currentUserId }
      ]
    }).sort({ createdAt: 1 }).lean();

    // Mark messages from this contact as read
    await Message.updateMany(
      { senderId: contactId, recipientId: currentUserId, isRead: false },
      { $set: { isRead: true, readAt: new Date() } }
    );

    return res.json({
      success: true,
      messages
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/messages - Send a new message
exports.sendMessage = async (req, res, next) => {
  try {
    const currentUserId = req.user.userId;
    const currentUserName = req.user.name;
    const currentUserAvatar = req.user.avatar || 'U';

    const { recipientId, content, bookAttachment, viaPlatform, channelType } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Message content is required' });
    }

    const targetRecipientId = parseInt(recipientId, 10);
    let targetRecipientName = '';

    if (targetRecipientId) {
      const recipientUser = await User.findOne({ userId: targetRecipientId });
      if (recipientUser) {
        targetRecipientName = recipientUser.name;
      } else {
        const found = DEFAULT_CONTACTS.find(c => c.userId === targetRecipientId);
        if (found) targetRecipientName = found.name;
      }
    }

    const newMsg = new Message({
      senderId: currentUserId,
      senderName: currentUserName,
      senderAvatar: currentUserAvatar,
      recipientId: targetRecipientId,
      recipientName: targetRecipientName,
      content: content.trim(),
      bookAttachment: bookAttachment || null,
      channelType: channelType || 'direct',
      viaPlatform: viaPlatform || 'in_app',
      isRead: false
    });

    await newMsg.save();

    return res.status(201).json({
      success: true,
      message: 'Message dispatched successfully',
      data: newMsg
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/messages/:contactId/read - Mark conversation as read
exports.markAsRead = async (req, res, next) => {
  try {
    const currentUserId = req.user.userId;
    const contactId = parseInt(req.params.contactId, 10);

    await Message.updateMany(
      { senderId: contactId, recipientId: currentUserId, isRead: false },
      { $set: { isRead: true, readAt: new Date() } }
    );

    return res.json({
      success: true,
      message: 'Conversation marked as read'
    });
  } catch (error) {
    next(error);
  }
};
