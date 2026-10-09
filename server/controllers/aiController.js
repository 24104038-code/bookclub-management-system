/**
 * =========================================================
 * BOOK FORGE — AI Assistant Controller (server/controllers/aiController.js)
 * Intelligent, dynamic conversational AI agent for BOOK FORGE readers.
 * Handles free-form natural language queries about profiles, photos,
 * reading goals, certificates, books, navigation, and site features.
 * =========================================================
 */

// Helper to query Gemini API if GEMINI_API_KEY is present
async function queryGeminiApi(apiKey, message, history = [], userContext = {}) {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const systemInstruction = `You are "Forge AI", the intelligent, friendly, and knowledgeable assistant for BOOK FORGE (formerly BookClub), an elite digital reader's guild and book community platform.
The current user is: ${userContext.name || 'Reader'} (Role: ${userContext.role || 'Member'}, Username: @${userContext.username || 'reader'}).
You help users navigate BOOK FORGE, view and set their profiles, change profile photos, manage reading goals, earn certificates, participate in events, switch themes (Light, Dark, 3D), and discover books.
Guidelines:
1. Provide practical, step-by-step instructions. Mention exact page names (e.g., profile.html, settings.html, dashboard.html, events.html) and button names (e.g. "Edit Profile", "Save Changes").
2. Be warm, enthusiastic about literature, and concise. Format with markdown bolding, bullet points, and clean structure.
3. If they ask about changing profile photos or setting their profile, explain both the file upload method and the profile editing options.`;

    const contents = [];
    // Convert history
    if (Array.isArray(history)) {
      history.slice(-6).forEach(h => {
        contents.push({
          role: h.role === 'user' ? 'user' : 'model',
          parts: [{ text: h.content || '' }]
        });
      });
    }
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const body = {
      system_instruction: { parts: [{ text: systemInstruction }] },
      contents: contents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 600
      }
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (res.ok) {
      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) return text;
    }
  } catch (err) {
    console.warn('[Gemini API Notice]:', err.message);
  }
  return null;
}

// Built-in Semantic Reasoning & Dynamic Response Engine
function generateIntelligentResponse(rawQuery, history = [], userContext = {}) {
  const query = (rawQuery || '').trim().toLowerCase();
  const userName = userContext.name || 'fellow reader';
  const userRole = userContext.role || 'user';

  // Semantic intent matchers
  const isProfileViewSet = /(view\s*(and|&)?\s*set\s*profile)|(set\s*(and|&)?\s*view\s*profile)|(how\s*(to\s*)?(view|see|check|open)\s*(and|&)?\s*(set|edit|update|change)\s*(my\s*)?profile)|(how\s*(to\s*)?view\s*set\s*profile)|(how\s*(to\s*)?set\s*view\s*profile)/i.test(query);
  const isProfilePhoto = /photo|picture|avatar|pic|image|upload photo|change photo|pfp|profile pic/i.test(query);
  const isProfileSet = /set profile|edit profile|update profile|change profile|configure profile|modify profile|change name|update name|change bio|edit bio|set genre/i.test(query);
  const isProfileView = /view profile|see profile|where is my profile|my profile|show profile|check profile|profile page|profile info|my stats|level|xp|reading streak/i.test(query);
  const isCertificate = /certificate|cert|diploma|participation|download certificate|print certificate|verify certificate|completion/i.test(query);
  const isReadingGoal = /goal|target|annual goal|books goal|set goal|track pace|pace|how many books/i.test(query);
  const isProgress = /progress|pages read|reading progress|reading streak|track reading|shelf|finished book/i.test(query);
  const isTheme = /theme|dark mode|light mode|3d theme|3d mode|dark|light|spatial|appearance|color/i.test(query);
  const isLanguage = /language|translate|multilingual|spanish|tamil|hindi|french|german|idioma/i.test(query);
  const isWhatsAppOrMessage = /whatsapp|message|chat|dm|contact reader|text|direct message/i.test(query);
  const isAuthOrLogin = /login|google login|google sign|phone login|mobile login|otp|password|register|sign in|sign up/i.test(query);
  const isBookDiscovery = /recommend|recommendation|book recommendation|suggest|good books|what to read|find book|catalog/i.test(query);
  const isGroupOrDiscussion = /group|club|circle|discussion|forum|talk about book|join group/i.test(query);
  const isEventOrCompetition = /event|competition|contest|challenge|rsvp|meetup/i.test(query);
  const isGreeting = /^(hi|hello|hey|greetings|good morning|good afternoon|good evening|yo)\b/i.test(query);
  const isThanks = /thank|thanks|appreciate|awesome|great|cool/i.test(query);

  let reply = '';
  let actions = [];
  let suggestions = [];

  // 1. Comprehensive View & Set Profile Guide
  if (isProfileViewSet) {
    reply = `### 👤 Complete Guide: How to View and Set Your Profile in BOOK FORGE

Here is everything you need to know about viewing your reading identity and customizing your profile settings:

---

#### 👁️ Part 1: How to View Your Profile
1. **Sidebar Navigation**: Click the **"Profile" (👤)** link in the left-hand navigation menu or click on your user badge at the bottom of the sidebar.
2. **What You Can View**:
   - **Hero Banner**: Displays your custom photo avatar, display name, username (\`@${userContext.username || 'username'}\`), and membership badge.
   - **Guild Rank & Reading Level**: Your current reader level (e.g. *Level 8 Sage*), total XP points, and active **Daily Streak (🔥)**.
   - **Reading Metric Counters**: Total **Books Read**, **Pages Read**, and **Reviews Shared**.
   - **Personal Shelf Tabs**:
     - 📖 **Overview**: Active books and live annual goal progress bar.
     - 📚 **Completed Books**: Full catalog of books you've finished.
     - 📜 **My Certificates**: Official event & reading challenge certificates with unique verification IDs.
     - 🏆 **Badges & Achievements**: Milestones unlocked in your reading journey.

---

#### ✏️ Part 2: How to Set & Edit Your Profile
1. **Open the Profile Editor**:
   - While on the Profile page, click the **"✏️ Edit Profile"** button at the top right of your profile banner.
   *(Or click the action button below to launch it right now!)*
2. **Settings You Can Update**:
   - 📸 **Profile Photo**: Click **"📷 Choose Photo"** to upload an image from your computer/phone (JPG, PNG, WebP) or paste an image URL. If you ever want to reset it, click **"🗑️ Remove Photo"**.
   - 🏷️ **Full Name**: Enter your preferred display name as you want fellow readers and certificates to display.
   - 📚 **Favorite Genre**: Choose from *Fantasy, Mystery, Fiction, Non-Fiction, or Classic Literature*.
   - 📝 **Reader Bio**: Share a short summary of your reading tastes and favorite stories.
3. **Save Your Changes**:
   - Click the green **"Save Changes"** button at the bottom of the dialog. Your profile updates instantly across the entire application and MongoDB database!`;

    actions = [
      { label: '👤 Open Profile Page', url: 'profile.html', icon: '👤' },
      { label: '✏️ Edit Profile Now', url: 'profile.html?openEdit=true', icon: '✏️', trigger: 'openEditProfile' },
      { label: '⚙️ Account Settings', url: 'settings.html', icon: '⚙️' }
    ];

    suggestions = [
      'How do I upload a profile photo from my computer?',
      'Where do I view my earned certificates?',
      'How do I set my annual reading goal?',
      'How to switch themes (Light, Dark, 3D)?'
    ];
  }
  // 2. Profile Photo / Picture Upload
  else if (isProfilePhoto) {
    reply = `### 📸 How to Set & Change Your Profile Photo in BOOK FORGE:

To update your reader avatar with your own real photo or picture:

1. **Navigate to Your Profile**: Click **"Profile" (👤)** in the left sidebar or the user card at the bottom of the navigation drawer.
2. **Open Profile Editor**: Click the **"✏️ Edit Profile"** button located at the top-right of your profile banner.
3. **Choose Your Picture**:
   - Click the **"📁 Upload Photo"** button to select any image from your computer or phone (JPG, PNG, or WebP supported).
   - *Or* paste an **Image URL** into the "Or paste photo web link" input box.
4. **Instant Preview & Optimization**: You'll see your live photo preview instantly in the circular preview frame (compressed automatically for fast loading).
5. **Save Changes**: Click **"Save Changes"**. Your new photo will be permanently saved to your account and will reflect across the topbar, sidebar, reviews, and community comments!

*(Tip: If you ever want to revert to your initials avatar, just click the red "✕ Remove" button in the photo editor.)*`;

    actions = [
      { label: '👤 Open Profile Page', url: 'profile.html', icon: '👤' },
      { label: '✏️ Launch Edit Profile', url: 'profile.html?openEdit=true', icon: '📸', trigger: 'openEditProfile' }
    ];

    suggestions = [
      'How to change my display name and bio?',
      'Where can I see my reading streak and level?',
      'How do I view my certificates?'
    ];
  }
  // 2. Profile Setting & Editing
  else if (isProfileSet) {
    reply = `### ✏️ How to Set & Edit Your Reader Profile:

You can personalize your reader identity anytime in BOOK FORGE:

1. **Go to Your Profile Page**: Click **"Profile"** in the sidebar navigation or visit \`profile.html\`.
2. **Click "✏️ Edit Profile"**: This opens the profile customizer dialog.
3. **Customize Your Information**:
   - **Full Name**: Enter your name as you'd like fellow readers and certificates to show.
   - **Favorite Genre**: Choose your primary genre (Fantasy, Mystery, Fiction, Non-Fiction, Classic Literature).
   - **Reader Bio**: Write a short description about what stories and topics you love.
   - **Profile Photo**: Upload a picture or supply an image link.
4. **Save**: Click **"Save Changes"**. The system updates your profile in real-time in the database!

You can also visit **Settings (⚙️)** to configure email notifications, language preferences, and reading privacy.`;

    actions = [
      { label: '✏️ Edit Profile Now', url: 'profile.html?openEdit=true', icon: '✏️', trigger: 'openEditProfile' },
      { label: '⚙️ Account Settings', url: 'settings.html', icon: '⚙️' }
    ];

    suggestions = [
      'How do I upload a profile photo?',
      'Where do I view my completed books?',
      'How to set my reading goal?'
    ];
  }
  // 3. Profile Viewing & Reading Stats
  else if (isProfileView) {
    reply = `### 👤 Viewing Your Reader Profile & Guild Metrics:

Your **Reader Profile** is your personal literary headquarters. Here is what you can view and where to find it:

- **Accessing Profile**: Click **"Profile" (👤)** in the left sidebar menu.
- **Header Stats**:
  - **Level & Rank**: Tracks your reading guild status (e.g., *Level 8 Sage*).
  - **Daily Reading Streak**: Shows your consecutive reading days (e.g., *🔥 14 Days*).
  - **XP Points**: Total experience earned through book reviews, discussions, and event completions.
- **Metric Strip**:
  - **Books Read**: Total books completed shelf.
  - **Pages Read**: Cumulative reading volume.
  - **Reviews Written**: Book reviews you've shared.
- **Profile Tabs**:
  - **Overview**: Active books and annual goal pace bar.
  - **Completed Books**: Your virtual library shelf of finished titles.
  - **My Certificates**: Official event & challenge participation certificates ready to view, print, or download!
  - **Badges & Trophies**: Earned reader achievements.`;

    actions = [
      { label: '👤 View My Profile', url: 'profile.html', icon: '👤' },
      { label: '📈 Reading Progress', url: 'reading-progress.html', icon: '📈' }
    ];

    suggestions = [
      'How do I edit my profile photo?',
      'How to download my event certificates?',
      'How do I change the website theme?'
    ];
  }
  // 4. Certificates Generation & Verification
  else if (isCertificate) {
    reply = `### 📜 Event & Challenge Certificates in BOOK FORGE:

You can earn official, verified **Certificates of Participation & Achievement**:

1. **How to Become Eligible**:
   - Join an Event or Reading Challenge in the **Events** or **Challenges** portal.
   - Complete all required event activities or reading milestones.
2. **Generating Your Certificate**:
   - Once all criteria are met, the **"Generate Certificate"** button unlocks.
   - Click it to create your certificate with a unique verification ID (e.g. \`BC-EVT-2026-000124\`).
3. **Viewing & Downloading**:
   - Go to **Profile → "My Certificates" Tab** or the Event details page.
   - Click **"View Certificate"** to inspect the framed layout, **"Download"** for offline keeping, or **"Print"** to print directly.
4. **Official Verification**:
   - Every certificate features a tamper-proof verification ID verified by our backend API (\`/api/certificates/verify/:id\`).`;

    actions = [
      { label: '📜 My Certificates', url: 'profile.html?tab=certificates', icon: '📜' },
      { label: '📅 Browse Events', url: 'events.html', icon: '📅' },
      { label: '🏆 Challenges', url: 'challenges.html', icon: '🏆' }
    ];

    suggestions = [
      'How to view my profile?',
      'How do I join an event?',
      'Where do I view completed books?'
    ];
  }
  // 5. Reading Goals & Annual Targets
  else if (isReadingGoal || isProgress) {
    reply = `### 🎯 Setting Goals & Tracking Reading Progress:

Staying consistent with books is a core part of BOOK FORGE:

1. **Set Annual Book Goal**:
   - Head over to **"Reading Goals" (🎯)** in the sidebar navigation.
   - Enter your target number of books for the year (e.g., 25 or 50 books).
   - Set monthly targets and favorite target genres.
2. **Log Daily Reading Progress**:
   - Go to **"Reading Progress" (📈)**.
   - Update your current page number on your active book to automatically compute % completed.
   - Keep your daily streak fire burning!
3. **View on Profile**:
   - Your profile's **Overview** tab displays your live **Annual Goal Pace bar** comparing your finished count vs your yearly goal.`;

    actions = [
      { label: '🎯 Reading Goals', url: 'reading-goals.html', icon: '🎯' },
      { label: '📈 Log Progress', url: 'reading-progress.html', icon: '📈' }
    ];

    suggestions = [
      'How do I view my reader profile?',
      'How to write a book review?',
      'How to join a reading group?'
    ];
  }
  // 6. Themes (Light, Dark, 3D)
  else if (isTheme) {
    reply = `### 🎨 Customizing Themes in BOOK FORGE:

BOOK FORGE features 3 handcrafted display themes engineered for optimal reading comfort:

- ☀️ **Light Parchment**: Classic warm paper aesthetic with sepia and ink tones.
- 🌙 **Dark Obsidian**: Deep night mode designed to minimize eye strain during evening reading.
- 🧊 **3D Spatial Tactile**: Elevated glassmorphism with dynamic ambient lighting and depth effects!

**How to switch:**
- Click the theme buttons (**☀️ / 🌙 / 🧊**) right in the **top navigation bar** or in the **Theme Settings** page (\`settings.html\`).
- Your selection is instantly remembered across all sessions and pages!`;

    actions = [
      { label: '⚙️ Theme Settings', url: 'settings.html?tab=theme', icon: '🎨' },
      { label: '🧊 Try 3D Theme', url: '#theme-3d', icon: '🧊', trigger: 'switchTheme3d' }
    ];

    suggestions = [
      'How to switch language?',
      'How to edit my profile?',
      'How to change my avatar?'
    ];
  }
  // 7. Multilingual Support
  else if (isLanguage) {
    reply = `### 🌐 Multilingual Internationalization (i18n):

BOOK FORGE supports **6 languages** natively:
- 🇬🇧 English
- 🇪🇸 Spanish (Español)
- 🇫🇷 French (Français)
- 🇩🇪 German (Deutsch)
- 🇮🇳 Tamil (தமிழ்)
- 🇮🇳 Hindi (हिन्दी)

**How to change language**:
- Click the language picker in the **topbar** (e.g., "🇬🇧 English ▾").
- Or navigate to **Settings → Language & Region** to pick your preferred language. All navigation labels, buttons, and headers will translate instantly!`;

    actions = [
      { label: '⚙️ Language Settings', url: 'settings.html?tab=appearance', icon: '🌐' }
    ];

    suggestions = [
      'How do I view my profile?',
      'How to switch to dark mode?',
      'How to set reading goals?'
    ];
  }
  // 8. WhatsApp & Messaging
  else if (isWhatsAppOrMessage) {
    reply = `### 💬 Reader Messaging & WhatsApp Hub:

You can chat with fellow readers and sync discussions with WhatsApp:

1. **Internal Chat Hub**: Open **"Messages & Chat" (💬)** from the sidebar or click the floating green chat button at the bottom of the screen.
2. **Direct Reader Messages**: Select any club member from your reading circles to start a book discussion.
3. **WhatsApp Community Sync**:
   - Each Reading Group has a dedicated WhatsApp sync button to share meeting summaries and reading picks.
   - You can click **"Send via WhatsApp"** on any book card or event to share directly with your phone contacts!`;

    actions = [
      { label: '💬 Messages & Chat Hub', url: 'messages.html', icon: '💬' },
      { label: '👥 Reading Groups', url: 'groups.html', icon: '👥' }
    ];

    suggestions = [
      'How to change my profile photo?',
      'How to view my reading stats?',
      'How do I get a certificate?'
    ];
  }
  // 9. Authentication (Mobile, Google, Email)
  else if (isAuthOrLogin) {
    reply = `### 🔐 Sign-In & Account Authentication in BOOK FORGE:

BOOK FORGE offers flexible, authentic sign-in options:

- 📱 **Real Mobile Number & SMS Verification**: Enter your real mobile phone number with international country codes (+91, +1, +44, etc.) to receive an SMS verification code and log in instantly.
- 🌐 **Real Google Account Sign-In**: Official Google Identity Services integration with Google OAuth and account verification.
- ✉️ **Email / Username & Password**: Classic authentication with password visibility toggles and remember-me sessions.

Sign in or create your profile on [login.html](login.html) and [register.html](register.html).`;

    actions = [
      { label: '🔐 Login Page', url: 'login.html', icon: '🔐' },
      { label: '📝 Create Account', url: 'register.html', icon: '📝' }
    ];

    suggestions = [
      'How do I edit my profile?',
      'How to upload a profile photo?',
      'Where can I view my certificates?'
    ];
  }
  // 10. Book Discovery & Recommendations
  else if (isBookDiscovery) {
    reply = `### 📚 Discovering Books & Curated Recommendations:

BOOK FORGE has a curated literary catalog of fiction, fantasy, classics, and non-fiction:

- **Browse Catalog**: Visit **"Books" (📖)** to search titles, filter by genre, check community ratings, and read plot previews.
- **AI Recommendations**: Head to **"Recommendations" (✨)** for suggestions based on your preferred genre (${userContext.favoriteGenre || 'Fiction'}).
- **Add to Library**: On any book card, click **"Want to Read"** or **"Currently Reading"** to add it to your personal library shelves!`;

    actions = [
      { label: '📖 Browse Books', url: 'books.html', icon: '📖' },
      { label: '✨ Recommendations', url: 'recommendations.html', icon: '✨' },
      { label: '📚 My Library', url: 'library.html', icon: '📚' }
    ];

    suggestions = [
      'How to set my reading goal?',
      'How to write a book review?',
      'How do I view my profile?'
    ];
  }
  // 11. Greeting & Pleasantries
  else if (isGreeting) {
    reply = `Hello **${userName}**! 👋 Welcome to **BOOK FORGE**. 

I am your **AI Guild Assistant**, here to help you navigate the platform, view and set up your reader profile, upload photos, earn certificates, and reach your reading goals.

How can I help you today? You can ask me questions like:
- *"How do I view and set my profile?"*
- *"How do I change my profile photo?"*
- *"Where are my reading streak and level?"*
- *"How do I generate and download certificates?"*
- *"How do I switch themes or languages?"*`;

    actions = [
      { label: '👤 View Profile', url: 'profile.html', icon: '👤' },
      { label: '📸 Change Photo', url: 'profile.html?openEdit=true', icon: '📸', trigger: 'openEditProfile' },
      { label: '🎯 Reading Goals', url: 'reading-goals.html', icon: '🎯' }
    ];

    suggestions = [
      'How to change my profile photo?',
      'How to view my profile stats?',
      'How to get certificates?'
    ];
  }
  // 12. Gratitude / Thanks
  else if (isThanks) {
    reply = `You're very welcome, **${userName}**! 😊 It's always a pleasure assisting members of our reader's guild. 

Feel free to ask anytime you need help customizing your profile, finding your next great read, or tracking your goals! Happy reading! 📖✨`;

    actions = [
      { label: '🏠 Dashboard', url: 'dashboard.html', icon: '🏠' },
      { label: '👤 Profile', url: 'profile.html', icon: '👤' }
    ];

    suggestions = [
      'How to view my profile?',
      'How to change theme?',
      'How to set reading goals?'
    ];
  }
  // 13. General Contextual Fallback for any other custom question
  else {
    reply = `That's a great question about BOOK FORGE! Here is what you need to know:

- **Profile & Account**: To view your reader level, streak, XP, and finished shelf, go to **Profile (👤)**. To change your name, bio, favorite genre, or upload a custom photo, click **"Edit Profile"** on that page.
- **Reading Progress**: Head over to **"Reading Progress" (📈)** or **"Reading Goals" (🎯)** to log pages read and set annual targets.
- **Certificates**: Complete event tasks or challenges to unlock verified participation certificates under **Profile → "My Certificates"**.
- **Community**: Join reading groups under **"Reading Groups" (👥)** or engage in book discussions under **"Discussions" (💬)**.
- **Interface Controls**: Switch between Light, Dark, and 3D themes or change languages from the controls located in the top bar.

Would you like specific guidance on your profile, books, certificates, or navigation? Just let me know!`;

    actions = [
      { label: '👤 Open Profile', url: 'profile.html', icon: '👤' },
      { label: '✏️ Edit Profile', url: 'profile.html?openEdit=true', icon: '✏️', trigger: 'openEditProfile' },
      { label: '🏠 Dashboard', url: 'dashboard.html', icon: '🏠' }
    ];

    suggestions = [
      'How to change profile photo?',
      'How to view my profile stats?',
      'Where are my certificates?'
    ];
  }

  return {
    success: true,
    reply,
    actions,
    suggestions
  };
}

// POST /api/ai/chat
exports.chat = async (req, res, next) => {
  try {
    const { message, history, userContext } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required.'
      });
    }

    const trimmedMsg = message.trim();
    const ctx = userContext || (req.user ? {
      name: req.user.name,
      username: req.user.username,
      role: req.user.role,
      email: req.user.email,
      favoriteGenre: req.user.favoriteGenre
    } : {});

    // 1. If Gemini or OpenAI API Key is provided in environment, query live LLM
    if (process.env.GEMINI_API_KEY) {
      const llmReply = await queryGeminiApi(process.env.GEMINI_API_KEY, trimmedMsg, history, ctx);
      if (llmReply) {
        // Generate contextual action buttons matching the content
        const defaultData = generateIntelligentResponse(trimmedMsg, history, ctx);
        return res.json({
          success: true,
          reply: llmReply,
          actions: defaultData.actions,
          suggestions: defaultData.suggestions
        });
      }
    }

    // 2. Comprehensive built-in semantic conversational engine
    const aiResponse = generateIntelligentResponse(trimmedMsg, history, ctx);

    return res.json({
      success: true,
      reply: aiResponse.reply,
      actions: aiResponse.actions,
      suggestions: aiResponse.suggestions
    });
  } catch (error) {
    next(error);
  }
};
