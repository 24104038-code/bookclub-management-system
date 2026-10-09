/**
 * =========================================================
 * BOOK FORGE — Multilingual Internationalization (i18n) Engine
 * Supported: English (en), Spanish (es), French (fr), German (de), Tamil (ta), Hindi (hi)
 * =========================================================
 */

const BookForgeI18n = (function () {
  const LANG_KEY = 'bookforge_lang';
  const DEFAULT_LANG = 'en';

  const LANGUAGES = {
    en: { name: 'English', native: 'English', flag: '🇬🇧' },
    es: { name: 'Spanish', native: 'Español', flag: '🇪🇸' },
    fr: { name: 'French', native: 'Français', flag: '🇫🇷' },
    de: { name: 'German', native: 'Deutsch', flag: '🇩🇪' },
    ta: { name: 'Tamil', native: 'தமிழ்', flag: '🇮🇳' },
    hi: { name: 'Hindi', native: 'हिन्दी', flag: '🇮🇳' }
  };

  const TRANSLATIONS = {
    en: {
      // Nav
      'nav.dashboard': 'Dashboard',
      'nav.books': 'Books',
      'nav.library': 'My Library',
      'nav.readingProgress': 'Reading Progress',
      'nav.readingGoals': 'Reading Goals',
      'nav.groups': 'Reading Groups',
      'nav.discussions': 'Discussions',
      'nav.events': 'Events',
      'nav.competitions': 'Competitions',
      'nav.challenges': 'Challenges',
      'nav.leaderboards': 'Leaderboards',
      'nav.reviews': 'Reviews',
      'nav.recommendations': 'Recommendations',
      'nav.notes': 'Notes',
      'nav.highlights': 'Highlights & Quotes',
      'nav.journal': 'Reading Journal',
      'nav.calendar': 'Calendar',
      'nav.activity': 'Activity Feed',
      'nav.notifications': 'Notifications',
      'nav.messages': 'Messages & Chat',
      'nav.settings': 'Settings',
      'nav.profile': 'Profile',
      'nav.adminDashboard': 'Admin Dashboard',
      'nav.organizerConsole': 'Organizer Console',
      'nav.reports': 'Moderation Reports',
      'nav.publicSite': '🏠 Public Site',
      'nav.signOut': 'Sign Out',
      'nav.management': 'Management',

      // Topbar & Search
      'topbar.searchPlaceholder': 'Search catalog, groups, clubs in Book Forge...',
      'topbar.ctrlK': 'Ctrl K',
      'topbar.notifications': 'Notifications',
      'topbar.messages': 'Messages',
      'topbar.settings': 'Settings',
      'topbar.theme': 'Theme',
      'topbar.language': 'Language',
      'topbar.roleSwitch': 'Demo Role Switch:',

      // Themes
      'theme.light': 'Light',
      'theme.dark': 'Dark',
      'theme.3d': '3D',

      // Communication & Messages
      'comm.title': 'Communications & Messages',
      'comm.subtitle': 'Connect with book club members, organizers, WhatsApp, and group circles.',
      'comm.directMessages': 'Direct Messages',
      'comm.bookCircles': 'Book Circles & Groups',
      'comm.announcements': 'Announcements',
      'comm.searchChats': 'Search conversations & contacts...',
      'comm.online': 'Online',
      'comm.offline': 'Offline',
      'comm.typeMessage': 'Type a message to your fellow reader...',
      'comm.send': 'Send',
      'comm.whatsAppDirect': 'WhatsApp Chat',
      'comm.whatsAppShare': 'Share via WhatsApp',
      'comm.normalMessage': 'Normal SMS / Text',
      'comm.shareBook': 'Share Book',
      'comm.delivered': 'Delivered',
      'comm.read': 'Read',
      'comm.quickReply': 'Quick Reply',

      // Settings
      'settings.title': 'System & Reading Settings',
      'settings.subtitle': 'Customize themes, language, communication preferences, and display modes.',
      'settings.tabAppearance': 'Theme & Visuals',
      'settings.tabLanguage': 'Language & Region',
      'settings.tabComm': 'Communication & Alerts',
      'settings.tabReading': 'Reading Preferences',
      'settings.tabAccount': 'Privacy & Storage',
      'settings.themeHeading': 'Interface Theme',
      'settings.themeDesc': 'Choose your preferred aesthetic style across all BOOK FORGE pages.',
      'settings.langHeading': 'Platform Language',
      'settings.langDesc': 'Select your preferred reading guild language.',
      'settings.commHeading': 'Messaging & WhatsApp Integration',
      'settings.enableWhatsApp': 'Enable One-Click WhatsApp Actions',
      'settings.enableSMS': 'Enable Normal SMS / Mobile Triggers',
      'settings.readReceipts': 'Show Message Read Receipts (✓✓)',
      'settings.soundEffects': 'Chat Sound Effects & Chimes',
      'settings.save': 'Save Preferences',
      'settings.savedToast': 'Settings saved successfully!',

      // Books Catalog
      'books.title': 'Book Discovery',
      'books.subtitle': 'Browse our curated catalog, filter by genre or pacing, and add books to your personal shelf.',
      'books.myLibrary': 'My Library Shelves 📚',
      'books.searchPlaceholder': 'Search by title, author, or genre...',
      'books.showing': 'Showing',
      'books.of': 'of',
      'books.booksCount': 'books',
      'books.showingCount': 'Showing {count} of {total} books',
      'books.tip': 'Tip: Click on a book cover to open in-depth discussions & reader notes',
      'books.details': 'Details',
      'books.by': 'by',
      'books.pages': 'pages',
      'books.currentlyReading': 'Currently Reading',
      'books.wantToRead': 'Want to Read',
      'books.completed': 'Completed',
      'books.didNotFinish': 'Did Not Finish',
      'books.addToShelf': 'Add to Shelf',
      'books.markAsRead': 'Mark as Read',
      'books.allGenres': 'All Genres',
      'books.anyRating': 'Any Rating',
      'books.anyLength': 'Any Length',
      'books.shortPages': '< 300 pages',
      'books.mediumPages': '300 - 450 pages',
      'books.longPages': '> 450 pages',
      'books.mostPopular': 'Sort: Most Popular',
      'books.highestRated': 'Sort: Highest Rated',
      'books.newest': 'Sort: Newest',
      'books.mostReviewed': 'Sort: Most Reviewed',
      'books.titleAZ': 'Sort: Title A–Z',
      'books.reset': 'Reset',
      'books.resetAll': 'Reset All Filters',
      'books.noBooks': 'No books match your filters',
      'books.noBooksSub': 'Try resetting filters or searching for another title.',
      'books.genreFiction': 'Fiction',
      'books.genreMystery': 'Mystery',
      'books.genreFantasy': 'Fantasy',
      'books.genreClassic': 'Classic',
      'books.genreNonFiction': 'Non-Fiction',
      'books.genreSciTech': 'Science & Technology',
      'books.genreHistorical': 'Historical Fiction',
      'books.genrePhilosophy': 'Philosophy',

      // Book Details
      'bookDetails.allBooks': '← All Books',
      'bookDetails.published': 'Published',
      'bookDetails.ratings': 'ratings',
      'bookDetails.overview': 'Literary Overview & Themes',
      'bookDetails.about': 'About & Context',
      'bookDetails.progress': 'My Reading Progress',
      'bookDetails.reviews': 'Reader Reviews',
      'bookDetails.discussions': 'Discussions',
      'bookDetails.notes': 'My Notes',
      'bookDetails.related': 'Related Books',
      'bookDetails.startReading': 'Start Reading',
      'bookDetails.wantToRead': 'Want to Read',
      'bookDetails.markRead': 'Mark as Read',
      'bookDetails.writeReview': '+ Write Review',
      'bookDetails.addNote': '+ Add Note',
      'bookDetails.saveHighlight': '✦ Save Highlight',
      'bookDetails.joinGroup': 'Join Reading Group 👥',
      'bookDetails.recommend': 'Recommend to a Friend'
    },

    es: {
      // Nav
      'nav.dashboard': 'Panel Principal',
      'nav.books': 'Libros',
      'nav.library': 'Mi Biblioteca',
      'nav.readingProgress': 'Progreso de Lectura',
      'nav.readingGoals': 'Metas de Lectura',
      'nav.groups': 'Círculos de Lectura',
      'nav.discussions': 'Debates',
      'nav.events': 'Eventos',
      'nav.competitions': 'Competencias',
      'nav.challenges': 'Desafíos',
      'nav.leaderboards': 'Clasificaciones',
      'nav.reviews': 'Reseñas',
      'nav.recommendations': 'Recomendaciones',
      'nav.notes': 'Notas',
      'nav.highlights': 'Citas Destacadas',
      'nav.journal': 'Diario de Lectura',
      'nav.calendar': 'Calendario',
      'nav.activity': 'Actividad Reciente',
      'nav.notifications': 'Notificaciones',
      'nav.messages': 'Mensajes y Chat',
      'nav.settings': 'Configuración',
      'nav.profile': 'Perfil',
      'nav.adminDashboard': 'Panel Admin',
      'nav.organizerConsole': 'Consola Organizador',
      'nav.reports': 'Moderación',
      'nav.publicSite': '🏠 Sitio Público',
      'nav.signOut': 'Cerrar Sesión',
      'nav.management': 'Gestión',

      // Topbar & Search
      'topbar.searchPlaceholder': 'Buscar catálogo, clubes y libros en Book Forge...',
      'topbar.ctrlK': 'Ctrl K',
      'topbar.notifications': 'Notificaciones',
      'topbar.messages': 'Mensajes',
      'topbar.settings': 'Configuración',
      'topbar.theme': 'Tema',
      'topbar.language': 'Idioma',
      'topbar.roleSwitch': 'Cambiar Rol Demo:',

      // Themes
      'theme.light': 'Claro',
      'theme.dark': 'Oscuro',
      'theme.3d': '3D Táctil',

      // Communication & Messages
      'comm.title': 'Comunicaciones y Mensajes',
      'comm.subtitle': 'Conéctate con lectores, organizadores, WhatsApp y grupos.',
      'comm.directMessages': 'Mensajes Directos',
      'comm.bookCircles': 'Círculos de Lectura',
      'comm.announcements': 'Anuncios',
      'comm.searchChats': 'Buscar conversaciones y contactos...',
      'comm.online': 'En línea',
      'comm.offline': 'Desconectado',
      'comm.typeMessage': 'Escribe un mensaje para tu compañero lector...',
      'comm.send': 'Enviar',
      'comm.whatsAppDirect': 'Chat en WhatsApp',
      'comm.whatsAppShare': 'Compartir por WhatsApp',
      'comm.normalMessage': 'Mensaje SMS Normal',
      'comm.shareBook': 'Compartir Libro',
      'comm.delivered': 'Entregado',
      'comm.read': 'Leído',
      'comm.quickReply': 'Respuesta Rápida',

      // Settings
      'settings.title': 'Configuración de Lectura y Sistema',
      'settings.subtitle': 'Personaliza temas, idioma, preferencias de comunicación y pantalla.',
      'settings.tabAppearance': 'Tema y Visuales',
      'settings.tabLanguage': 'Idioma y Región',
      'settings.tabComm': 'Comunicación y Alertas',
      'settings.tabReading': 'Preferencias de Lectura',
      'settings.tabAccount': 'Privacidad y Almacenamiento',
      'settings.themeHeading': 'Tema de la Interfaz',
      'settings.themeDesc': 'Elige el estilo visual para todas las páginas de BOOK FORGE.',
      'settings.langHeading': 'Idioma de la Plataforma',
      'settings.langDesc': 'Selecciona tu idioma preferido para la comunidad.',
      'settings.commHeading': 'Integración de Mensajería y WhatsApp',
      'settings.enableWhatsApp': 'Habilitar Acciones Directas de WhatsApp',
      'settings.enableSMS': 'Habilitar Notificaciones SMS Móviles',
      'settings.readReceipts': 'Confirmaciones de Lectura (✓✓)',
      'settings.soundEffects': 'Sonidos de Notificación de Chat',
      'settings.save': 'Guardar Preferencias',
      'settings.savedToast': '¡Configuraciones guardadas con éxito!',

      // Books Catalog
      'books.title': 'Descubrimiento de Libros',
      'books.subtitle': 'Explora nuestro catálogo curado, filtra por género y añade libros a tu estante personal.',
      'books.myLibrary': 'Mis Estantes de Biblioteca 📚',
      'books.searchPlaceholder': 'Buscar por título, autor o género...',
      'books.showing': 'Mostrando',
      'books.of': 'de',
      'books.booksCount': 'libros',
      'books.showingCount': 'Mostrando {count} de {total} libros',
      'books.tip': 'Consejo: Haz clic en la portada para abrir debates y notas de lectores',
      'books.details': 'Detalles',
      'books.by': 'por',
      'books.pages': 'páginas',
      'books.currentlyReading': 'Leyendo Actualmente',
      'books.wantToRead': 'Quiero Leer',
      'books.completed': 'Completado',
      'books.didNotFinish': 'No Terminado',
      'books.addToShelf': 'Añadir a Estante',
      'books.markAsRead': 'Marcar como Leído',
      'books.allGenres': 'Todos los Géneros',
      'books.anyRating': 'Cualquier Calificación',
      'books.anyLength': 'Cualquier Longitud',
      'books.shortPages': '< 300 páginas',
      'books.mediumPages': '300 - 450 páginas',
      'books.longPages': '> 450 páginas',
      'books.mostPopular': 'Orden: Más Popular',
      'books.highestRated': 'Orden: Mejor Calificado',
      'books.newest': 'Orden: Más Reciente',
      'books.mostReviewed': 'Orden: Más Reseñas',
      'books.titleAZ': 'Orden: Título A–Z',
      'books.reset': 'Restablecer',
      'books.resetAll': 'Restablecer Filtros',
      'books.noBooks': 'Ningún libro coincide con los filtros',
      'books.noBooksSub': 'Prueba a restablecer los filtros o buscar otro título.',
      'books.genreFiction': 'Ficción',
      'books.genreMystery': 'Misterio',
      'books.genreFantasy': 'Fantasía',
      'books.genreClassic': 'Clásico',
      'books.genreNonFiction': 'No Ficción',
      'books.genreSciTech': 'Ciencia y Tecnología',
      'books.genreHistorical': 'Ficción Histórica',
      'books.genrePhilosophy': 'Filosofía',

      // Book Details
      'bookDetails.allBooks': '← Todos los Libros',
      'bookDetails.published': 'Publicado',
      'bookDetails.ratings': 'calificaciones',
      'bookDetails.overview': 'Resumen Literario y Temas',
      'bookDetails.about': 'Acerca de y Contexto',
      'bookDetails.progress': 'Mi Progreso de Lectura',
      'bookDetails.reviews': 'Reseñas de Lectores',
      'bookDetails.discussions': 'Debates',
      'bookDetails.notes': 'Mis Notas',
      'bookDetails.related': 'Libros Relacionados',
      'bookDetails.startReading': 'Empezar a Leer',
      'bookDetails.wantToRead': 'Quiero Leer',
      'bookDetails.markRead': 'Marcar como Leído',
      'bookDetails.writeReview': '+ Escribir Reseña',
      'bookDetails.addNote': '+ Añadir Nota',
      'bookDetails.saveHighlight': '✦ Guardar Cita',
      'bookDetails.joinGroup': 'Unirse al Grupo 👥',
      'bookDetails.recommend': 'Recomendar a un Amigo'
    },

    fr: {
      // Nav
      'nav.dashboard': 'Tableau de bord',
      'nav.books': 'Livres',
      'nav.library': 'Ma Bibliothèque',
      'nav.readingProgress': 'Progression de lecture',
      'nav.readingGoals': 'Objectifs de lecture',
      'nav.groups': 'Cercles de lecture',
      'nav.discussions': 'Discussions',
      'nav.events': 'Événements',
      'nav.competitions': 'Compétitions',
      'nav.challenges': 'Défis littéraires',
      'nav.leaderboards': 'Classements',
      'nav.reviews': 'Avis et Critiques',
      'nav.recommendations': 'Recommandations',
      'nav.notes': 'Notes privées',
      'nav.highlights': 'Citations et Extraits',
      'nav.journal': 'Journal de lecture',
      'nav.calendar': 'Calendrier',
      'nav.activity': 'Fil d’actualité',
      'nav.notifications': 'Notifications',
      'nav.messages': 'Messages et Chat',
      'nav.settings': 'Paramètres',
      'nav.profile': 'Profil',
      'nav.adminDashboard': 'Panneau Admin',
      'nav.organizerConsole': 'Console Organisateur',
      'nav.reports': 'Rapports Modération',
      'nav.publicSite': '🏠 Site Public',
      'nav.signOut': 'Se déconnecter',
      'nav.management': 'Gestion',

      // Topbar & Search
      'topbar.searchPlaceholder': 'Rechercher catalogue, groupes, clubs dans Book Forge...',
      'topbar.ctrlK': 'Ctrl K',
      'topbar.notifications': 'Notifications',
      'topbar.messages': 'Messages',
      'topbar.settings': 'Paramètres',
      'topbar.theme': 'Thème',
      'topbar.language': 'Langue',
      'topbar.roleSwitch': 'Changer de Rôle Démo:',

      // Themes
      'theme.light': 'Clair',
      'theme.dark': 'Sombre',
      'theme.3d': '3D Spatial',

      // Communication & Messages
      'comm.title': 'Communications et Messages',
      'comm.subtitle': 'Échangez avec les lecteurs, organisateurs, WhatsApp et cercles.',
      'comm.directMessages': 'Messages Directs',
      'comm.bookCircles': 'Cercles de Lecture',
      'comm.announcements': 'Annonces officielles',
      'comm.searchChats': 'Rechercher conversations & contacts...',
      'comm.online': 'En ligne',
      'comm.offline': 'Hors ligne',
      'comm.typeMessage': 'Écrivez un message à votre collègue lecteur...',
      'comm.send': 'Envoyer',
      'comm.whatsAppDirect': 'Chat WhatsApp',
      'comm.whatsAppShare': 'Partager sur WhatsApp',
      'comm.normalMessage': 'Message SMS Normal',
      'comm.shareBook': 'Partager un Livre',
      'comm.delivered': 'Distribué',
      'comm.read': 'Lu',
      'comm.quickReply': 'Réponse Rapide',

      // Settings
      'settings.title': 'Paramètres du Système et de Lecture',
      'settings.subtitle': 'Personnalisez les thèmes, langues, options de communication.',
      'settings.tabAppearance': 'Thème et Visuels',
      'settings.tabLanguage': 'Langue et Région',
      'settings.tabComm': 'Communication et Alertes',
      'settings.tabReading': 'Préférences de Lecture',
      'settings.tabAccount': 'Confidentialité',
      'settings.themeHeading': 'Thème de l’interface',
      'settings.themeDesc': 'Sélectionnez le style visuel de BOOK FORGE.',
      'settings.langHeading': 'Langue de la plateforme',
      'settings.langDesc': 'Choisissez la langue de votre guilde de lecture.',
      'settings.commHeading': 'Intégration Messagerie et WhatsApp',
      'settings.enableWhatsApp': 'Activer les actions directes WhatsApp',
      'settings.enableSMS': 'Activer les notifications SMS',
      'settings.readReceipts': 'Accusés de lecture (✓✓)',
      'settings.soundEffects': 'Effets sonores de messagerie',
      'settings.save': 'Enregistrer les paramètres',
      'settings.savedToast': 'Paramètres enregistrés avec succès !'
    },

    de: {
      // Nav
      'nav.dashboard': 'Übersicht',
      'nav.books': 'Bücher',
      'nav.library': 'Meine Bibliothek',
      'nav.readingProgress': 'Lesefortschritt',
      'nav.readingGoals': 'Leseziele',
      'nav.groups': 'Lesekreise',
      'nav.discussions': 'Diskussionen',
      'nav.events': 'Veranstaltungen',
      'nav.competitions': 'Wettbewerbe',
      'nav.challenges': 'Herausforderungen',
      'nav.leaderboards': 'Bestenlisten',
      'nav.reviews': 'Rezensionen',
      'nav.recommendations': 'Empfehlungen',
      'nav.notes': 'Notizen',
      'nav.highlights': 'Zitate & Fundstellen',
      'nav.journal': 'Lesetagebuch',
      'nav.calendar': 'Kalender',
      'nav.activity': 'Aktivitäts-Feed',
      'nav.notifications': 'Benachrichtigungen',
      'nav.messages': 'Nachrichten & Chat',
      'nav.settings': 'Einstellungen',
      'nav.profile': 'Profil',
      'nav.adminDashboard': 'Admin-Bereich',
      'nav.organizerConsole': 'Veranstalter-Konsole',
      'nav.reports': 'Moderation',
      'nav.publicSite': '🏠 Öffentliche Seite',
      'nav.signOut': 'Abmelden',
      'nav.management': 'Verwaltung',

      // Topbar & Search
      'topbar.searchPlaceholder': 'Katalog, Gruppen, Clubs in Book Forge durchsuchen...',
      'topbar.ctrlK': 'Strg K',
      'topbar.notifications': 'Mitteilungen',
      'topbar.messages': 'Nachrichten',
      'topbar.settings': 'Einstellungen',
      'topbar.theme': 'Thema',
      'topbar.language': 'Sprache',
      'topbar.roleSwitch': 'Demo-Rolle wechseln:',

      // Themes
      'theme.light': 'Hell',
      'theme.dark': 'Dunkel',
      'theme.3d': '3D Haptisch',

      // Communication & Messages
      'comm.title': 'Kommunikation & Nachrichten',
      'comm.subtitle': 'Austausch mit Mitgliedern, Organisatoren, WhatsApp und Lesekreisen.',
      'comm.directMessages': 'Direktnachrichten',
      'comm.bookCircles': 'Buchgruppen & Kreise',
      'comm.announcements': 'Ankündigungen',
      'comm.searchChats': 'Konversationen durchsuchen...',
      'comm.online': 'Online',
      'comm.offline': 'Offline',
      'comm.typeMessage': 'Nachricht an andere Leser verfassen...',
      'comm.send': 'Senden',
      'comm.whatsAppDirect': 'WhatsApp-Chat',
      'comm.whatsAppShare': 'Über WhatsApp teilen',
      'comm.normalMessage': 'Normale SMS / Text',
      'comm.shareBook': 'Buch teilen',
      'comm.delivered': 'Zugestellt',
      'comm.read': 'Gelesen',
      'comm.quickReply': 'Schnellantwort',

      // Settings
      'settings.title': 'System- & Leseeinstellungen',
      'settings.subtitle': 'Designs, Sprache, Kommunikations- und Anzeigeoptionen anpassen.',
      'settings.tabAppearance': 'Design & Visuals',
      'settings.tabLanguage': 'Sprache & Region',
      'settings.tabComm': 'Kommunikation & Warnungen',
      'settings.tabReading': 'Lesepräferenzen',
      'settings.tabAccount': 'Datenschutz & Speicher',
      'settings.themeHeading': 'Oberflächen-Design',
      'settings.themeDesc': 'Wählen Sie Ihren bevorzugten Stil für BOOK FORGE.',
      'settings.langHeading': 'Plattform-Sprache',
      'settings.langDesc': 'Wählen Sie Ihre bevorzugte Sprache für die Lesegilde.',
      'settings.commHeading': 'Messaging & WhatsApp Integration',
      'settings.enableWhatsApp': '1-Klick WhatsApp Aktionen aktivieren',
      'settings.enableSMS': 'SMS-Benachrichtigungen aktivieren',
      'settings.readReceipts': 'Lesebestätigungen anzeigen (✓✓)',
      'settings.soundEffects': 'Akustische Chatinformationen',
      'settings.save': 'Einstellungen speichern',
      'settings.savedToast': 'Einstellungen erfolgreich gespeichert!'
    },

    ta: {
      // Nav
      'nav.dashboard': 'முகப்பு பலகை',
      'nav.books': 'புத்தகங்கள்',
      'nav.library': 'எனது நூலகம்',
      'nav.readingProgress': 'வாசிப்பு முன்னேற்றம்',
      'nav.readingGoals': 'வாசிப்பு இலக்குகள்',
      'nav.groups': 'வாசிப்புக் குழுக்கள்',
      'nav.discussions': 'கலந்துரையாடல்கள்',
      'nav.events': 'நிகழ்வுகள்',
      'nav.competitions': 'போட்டிகள்',
      'nav.challenges': 'சவால்கள்',
      'nav.leaderboards': 'முன்னணிப் பட்டியல்',
      'nav.reviews': 'விமர்சனங்கள்',
      'nav.recommendations': 'பரிந்துரைகள்',
      'nav.notes': 'குறிப்புகள்',
      'nav.highlights': 'முக்கிய வரிகள்',
      'nav.journal': 'வாசிப்பு நாட்குறிப்பு',
      'nav.calendar': 'நாட்காட்டி',
      'nav.activity': 'செயல்பாட்டு ஓட்டம்',
      'nav.notifications': 'அறிவிப்புகள்',
      'nav.messages': 'செய்திகள் & அரட்டை',
      'nav.settings': 'அமைப்புகள்',
      'nav.profile': 'சுயவிவரம்',
      'nav.adminDashboard': 'நிர்வாகப் பலகை',
      'nav.organizerConsole': 'ஒருங்கிணைப்பாளர் பலகை',
      'nav.reports': 'நெறிமுறை அறிக்கைகள்',
      'nav.publicSite': '🏠 பொது தளம்',
      'nav.signOut': 'வெளியேறு',
      'nav.management': 'மேலாண்மை',

      // Topbar & Search
      'topbar.searchPlaceholder': 'நூல்கள், குழுக்களை தேடுங்கள்...',
      'topbar.ctrlK': 'Ctrl K',
      'topbar.notifications': 'அறிவிப்புகள்',
      'topbar.messages': 'செய்திகள்',
      'topbar.settings': 'அமைப்புகள்',
      'topbar.theme': 'வண்ண அமைப்பு',
      'topbar.language': 'மொழி',
      'topbar.roleSwitch': 'பயனர் பங்கு மாற்றம்:',

      // Themes
      'theme.light': 'வெளிச்சம் (Light)',
      'theme.dark': 'இருள் (Dark)',
      'theme.3d': 'முப்பரிமாணம் (3D)',

      // Communication & Messages
      'comm.title': 'தொடர்பாடல் & செய்திகள்',
      'comm.subtitle': 'வாசகர்கள், வாட்ஸ்அப் மற்றும் குழுக்களுடன் உடனடியாக இணைந்திருங்கள்.',
      'comm.directMessages': 'நேரடி செய்திகள்',
      'comm.bookCircles': 'புத்தக குழுக்கள்',
      'comm.announcements': 'அறிவிப்புகள்',
      'comm.searchChats': 'உரையாடல்களை தேடுங்கள்...',
      'comm.online': 'இணையத்தில் உள்ளார்',
      'comm.offline': 'இணைப்பிலில்லை',
      'comm.typeMessage': 'உங்கள் வாசிப்பு தோழருக்கு செய்தி எழுதுங்கள்...',
      'comm.send': 'அனுப்புக',
      'comm.whatsAppDirect': 'வாட்ஸ்அப் அரட்டை',
      'comm.whatsAppShare': 'வாட்ஸ்அப்பில் பகிருங்கள்',
      'comm.normalMessage': 'சாதாரண SMS செய்தி',
      'comm.shareBook': 'நூல் பகிர்வு',
      'comm.delivered': 'அனுப்பப்பட்டது',
      'comm.read': 'படிக்கப்பட்டது',
      'comm.quickReply': 'விரைவு பதில்',

      // Settings
      'settings.title': 'கணினி & வாசிப்பு அமைப்புகள்',
      'settings.subtitle': 'வண்ணங்கள், மொழி, செய்தியிடல் மற்றும் காட்சி அமைப்புகளை மாற்றவும்.',
      'settings.tabAppearance': 'வண்ண அமைப்பு & தோற்றம்',
      'settings.tabLanguage': 'மொழி & பகுதி',
      'settings.tabComm': 'தொடர்பாடல் & எச்சரிக்கைகள்',
      'settings.tabReading': 'வாசிப்பு விருப்பங்கள்',
      'settings.tabAccount': 'தனியுரிமை & சேமிப்பு',
      'settings.themeHeading': 'திரைத் தோற்றம்',
      'settings.themeDesc': 'Light, Dark அல்லது 3D அமைப்புகளில் உங்களுக்குப் பிடித்ததைத் தேர்ந்தெடுக்கவும்.',
      'settings.langHeading': 'தளத்தின் மொழி',
      'settings.langDesc': 'உங்கள் தாய்மொழியைத் தேர்ந்தெடுத்து வாசிக்கவும்.',
      'settings.commHeading': 'செய்தி மற்றும் வாட்ஸ்அப் ஒருங்கிணைப்பு',
      'settings.enableWhatsApp': 'ஒரே கிளிக்கில் வாட்ஸ்அப் பயன்பாட்டை இயக்கு',
      'settings.enableSMS': 'சாதாரண SMS எச்சரிக்கைகளை இயக்கு',
      'settings.readReceipts': 'செய்தி படித்த நிலையை காட்டு (✓✓)',
      'settings.soundEffects': 'அரட்டை ஒலி விளைவுகள்',
      'settings.save': 'அமைப்புகளைச் சேமிக்கவும்',
      'settings.savedToast': 'அமைப்புகள் வெற்றிகரமாகச் சேமிக்கப்பட்டன!',

      // Books Catalog
      'books.title': 'புத்தகங்கள் கண்டுபிடிப்பு',
      'books.subtitle': 'எங்கள் தொகுப்பைப் பார்வையிடுங்கள், வகைகளின்படி தேடுங்கள், உங்கள் சுய நூலகத்தில் சேருங்கள்.',
      'books.myLibrary': 'எனது நூலகம் 📚',
      'books.searchPlaceholder': 'தலைப்பு, ஆசிரியர், அல்லது வகை மூலம் தேடுங்கள்...',
      'books.showing': 'காட்டப்படுகிறது',
      'books.of': 'மொத்தத்தில்',
      'books.booksCount': 'புத்தகங்கள்',
      'books.showingCount': '{total} புத்தகங்களில் {count} காட்டப்படுகிறது',
      'books.tip': 'குறிப்பு: ஆழமான கலந்துரையாடல்கள் மற்றும் குறிப்புகளைப் பார்க்க புத்தக அட்டையைத் தட்டவும்',
      'books.details': 'விவரங்கள்',
      'books.by': 'எழுதியவர்',
      'books.pages': 'பக்கங்கள்',
      'books.currentlyReading': 'தற்போது வாசிப்பது',
      'books.wantToRead': 'வாசிக்க விருப்பம்',
      'books.completed': 'படித்து முடித்தது',
      'books.didNotFinish': 'முடிக்காதவை',
      'books.addToShelf': 'நூலகத்தில் சேர்',
      'books.markAsRead': 'படித்ததாகக் குறி',
      'books.allGenres': 'அனைத்து வகைகள்',
      'books.anyRating': 'எந்த மதிப்பீடும்',
      'books.anyLength': 'எந்த நீளமும்',
      'books.shortPages': '< 300 பக்கங்கள்',
      'books.mediumPages': '300 - 450 பக்கங்கள்',
      'books.longPages': '> 450 பக்கங்கள்',
      'books.mostPopular': 'வரிசை: அதிக பிரபலம்',
      'books.highestRated': 'வரிசை: அதிக மதிப்பீடு',
      'books.newest': 'வரிசை: புதியவை',
      'books.mostReviewed': 'வரிசை: அதிக விமர்சனங்கள்',
      'books.titleAZ': 'வரிசை: தலைப்பு அ–ஔ',
      'books.reset': 'மீட்டமை',
      'books.resetAll': 'வடிகட்டிகளை மீட்டமைக்கவும்',
      'books.noBooks': 'உங்கள் தேடலுக்குரிய புத்தகங்கள் கிடைக்கவில்லை',
      'books.noBooksSub': 'வடிகட்டிகளை மீட்டமைக்கவும் அல்லது வேறு தலைப்பைத் தேடவும்.',
      'books.genreFiction': 'புனைகதை',
      'books.genreMystery': 'துப்பறியும் கதை',
      'books.genreFantasy': 'மாயாஜாலம்',
      'books.genreClassic': 'செவ்வியல் இலக்கியம்',
      'books.genreNonFiction': 'உண்மைச் சம்பவங்கள்',
      'books.genreSciTech': 'அறிவியல் & தொழில்நுட்பம்',
      'books.genreHistorical': 'வரலாற்று நாவல்',
      'books.genrePhilosophy': 'தத்துவம் & அறநெறி',

      // Book Details
      'bookDetails.allBooks': '← அனைத்துப் புத்தகங்கள்',
      'bookDetails.published': 'வெளியிடப்பட்ட ஆண்டு',
      'bookDetails.ratings': 'மதிப்பீடுகள்',
      'bookDetails.overview': 'இலக்கிய கண்ணோட்டம் & கருப்பொருள்',
      'bookDetails.about': 'நூலின் பின்னணி & விபரம்',
      'bookDetails.progress': 'எனது வாசிப்பு முன்னேற்றம்',
      'bookDetails.reviews': 'வாசகர் விமர்சனங்கள்',
      'bookDetails.discussions': 'கலந்துரையாடல்கள்',
      'bookDetails.notes': 'எனது குறிப்புகள்',
      'bookDetails.related': 'தொடர்புடைய நூல்கள்',
      'bookDetails.startReading': 'வாசிக்கத் தொடங்கு',
      'bookDetails.wantToRead': 'வாசிக்க விருப்பம்',
      'bookDetails.markRead': 'படித்து முடித்ததாகக் குறி',
      'bookDetails.writeReview': '+ விமர்சனம் எழுது',
      'bookDetails.addNote': '+ குறிப்பு சேர்',
      'bookDetails.saveHighlight': '✦ மேற்கோள் சேமி',
      'bookDetails.joinGroup': 'வாசிப்புக் குழுவில் சேர் 👥',
      'bookDetails.recommend': 'நண்பருக்குப் பரிந்துரை செய்'
    },

    hi: {
      // Nav
      'nav.dashboard': 'डैशबोर्ड',
      'nav.books': 'पुस्तकें',
      'nav.library': 'मेरी लाइब्रेरी',
      'nav.readingProgress': 'पठन प्रगति',
      'nav.readingGoals': 'पठन लक्ष्य',
      'nav.groups': 'पठन समूह',
      'nav.discussions': 'चर्चाएँ',
      'nav.events': 'कार्यक्रम',
      'nav.competitions': 'प्रतियोगिताएं',
      'nav.challenges': 'चुनौतियां',
      'nav.leaderboards': 'लीडरबोर्ड',
      'nav.reviews': 'समीक्षाएं',
      'nav.recommendations': 'सिफारिशें',
      'nav.notes': 'निजी नोट्स',
      'nav.highlights': 'प्रमुख उद्धरण',
      'nav.journal': 'पठन डायरी',
      'nav.calendar': 'कैलेंडर',
      'nav.activity': 'गतिविधि फ़ीड',
      'nav.notifications': 'सूचनाएं',
      'nav.messages': 'संदेश और चैट',
      'nav.settings': 'सेटिंग्स',
      'nav.profile': 'प्रोफ़ाइल',
      'nav.adminDashboard': 'एडमिन डैशबोर्ड',
      'nav.organizerConsole': 'आयोजक कंसोल',
      'nav.reports': 'मॉडरेशन रिपोर्ट',
      'nav.publicSite': '🏠 सार्वजनिक साइट',
      'nav.signOut': 'लॉग आउट',
      'nav.management': 'प्रबंधन',

      // Topbar & Search
      'topbar.searchPlaceholder': 'किताबें, समूह, क्लब खोजें...',
      'topbar.ctrlK': 'Ctrl K',
      'topbar.notifications': 'सूचनाएं',
      'topbar.messages': 'संदेश',
      'topbar.settings': 'सेटिंग्स',
      'topbar.theme': 'थीम',
      'topbar.language': 'भाषा',
      'topbar.roleSwitch': 'डेमो रोल बदलें:',

      // Themes
      'theme.light': 'लाइट (Light)',
      'theme.dark': 'डार्क (Dark)',
      'theme.3d': '3D स्पर्शनीय',

      // Communication & Messages
      'comm.title': 'संचार और संदेश प्रणाली',
      'comm.subtitle': 'साथी पाठकों, आयोजकों, व्हाट्सएप और पुस्तक मंडली से सीधे जुड़ें।',
      'comm.directMessages': 'सीधे संदेश',
      'comm.bookCircles': 'पुस्तक मंडली चैट',
      'comm.announcements': 'आधिकारिक घोषणाएं',
      'comm.searchChats': 'बातचीत और संपर्क खोजें...',
      'comm.online': 'ऑनलाइन',
      'comm.offline': 'ऑफलाइन',
      'comm.typeMessage': 'साथी पाठक को संदेश लिखें...',
      'comm.send': 'भेजें',
      'comm.whatsAppDirect': 'व्हाट्सएप चैट',
      'comm.whatsAppShare': 'व्हाट्सएप पर साझा करें',
      'comm.normalMessage': 'सामान्य एसएमएस संदेश',
      'comm.shareBook': 'किताब साझा करें',
      'comm.delivered': 'पहुंचा दिया गया',
      'comm.read': 'पढ़ा गया',
      'comm.quickReply': 'त्वरित उत्तर',

      // Settings
      'settings.title': 'सिस्टम और पठन सेटिंग्स',
      'settings.subtitle': 'थीम, भाषा, संचार और प्रदर्शन विकल्पों को अनुकूलित करें।',
      'settings.tabAppearance': 'थीम और दृश्य',
      'settings.tabLanguage': 'भाषा और क्षेत्र',
      'settings.tabComm': 'संचार और अलर्ट',
      'settings.tabReading': 'पठन प्राथमिकताएं',
      'settings.tabAccount': 'गोपनीयता और डेटा',
      'settings.themeHeading': 'इंटरफ़ेस थीम',
      'settings.themeDesc': 'Light, Dark या 3D शैली में से अपनी पसंदीदा थीम चुनें।',
      'settings.langHeading': 'मंच की भाषा',
      'settings.langDesc': 'अपनी पसंदीदा भाषा का चयन करें।',
      'settings.commHeading': 'संदेश और व्हाट्सएप एकीकरण',
      'settings.enableWhatsApp': 'व्हाट्सएप त्वरित क्रियाएं सक्षम करें',
      'settings.enableSMS': 'सामान्य एसएमएस अलर्ट सक्षम करें',
      'settings.readReceipts': 'संदेश पढ़ने की पुष्टि दिखाएं (✓✓)',
      'settings.soundEffects': 'चैट ध्वनि प्रभाव',
      'settings.save': 'प्राथमिकताएं सहेजें',
      'settings.savedToast': 'सेटिंग्स सफलतापूर्वक सहेजी गईं!',

      // Books Catalog
      'books.title': 'पुस्तक खोज',
      'books.subtitle': 'हमारे कैटलॉग को ब्राउज़ करें, शैली के अनुसार फ़िल्टर करें और अपनी व्यक्तिगत शेल्फ़ में जोड़ें।',
      'books.myLibrary': 'मेरी लाइब्रेरी 📚',
      'books.searchPlaceholder': 'शीर्षक, लेखक या शैली द्वारा खोजें...',
      'books.showing': 'दिखाया जा रहा है',
      'books.of': 'में से',
      'books.booksCount': 'पुस्तकें',
      'books.showingCount': '{total} पुस्तकों में से {count} दिखाई जा रही हैं',
      'books.tip': 'सुझाव: विस्तृत चर्चा और नोट्स खोलने के लिए पुस्तक कवर पर क्लिक करें',
      'books.details': 'विवरण',
      'books.by': 'लेखक',
      'books.pages': 'पृष्ठ',
      'books.currentlyReading': 'वर्तमान में पढ़ रहे हैं',
      'books.wantToRead': 'पढ़ना चाहते हैं',
      'books.completed': 'पूर्ण',
      'books.didNotFinish': 'अधूरा छोड़ा',
      'books.addToShelf': 'शेल्फ़ में जोड़ें',
      'books.markAsRead': 'पढ़ा हुआ चिह्नित करें',
      'books.allGenres': 'सभी शैलियाँ',
      'books.anyRating': 'कोई भी रेटिंग',
      'books.anyLength': 'कोई भी लंबाई',
      'books.shortPages': '< 300 पृष्ठ',
      'books.mediumPages': '300 - 450 पृष्ठ',
      'books.longPages': '> 450 पृष्ठ',
      'books.mostPopular': 'क्रम: सर्वाधिक लोकप्रिय',
      'books.highestRated': 'क्रम: उच्चतम रेटेड',
      'books.newest': 'क्रम: नवीनतम',
      'books.mostReviewed': 'क्रम: सर्वाधिक समीक्षाएं',
      'books.titleAZ': 'क्रम: शीर्षक क–ह',
      'books.reset': 'रीसेट',
      'books.resetAll': 'फ़िल्टर रीसेट करें',
      'books.noBooks': 'कोई पुस्तक नहीं मिली',
      'books.noBooksSub': 'फ़िल्टर रीसेट करें या कोई अन्य शीर्षक खोजें।',
      'books.genreFiction': 'फिक्शन',
      'books.genreMystery': 'रहस्य',
      'books.genreFantasy': 'फैंटेसी',
      'books.genreClassic': 'क्लासिक',
      'books.genreNonFiction': 'गैर-काल्पनिक',
      'books.genreSciTech': 'विज्ञान और तकनीक',
      'books.genreHistorical': 'ऐतिहासिक उपन्यास',
      'books.genrePhilosophy': 'दर्शनशास्त्र',

      // Book Details
      'bookDetails.allBooks': '← सभी पुस्तकें',
      'bookDetails.published': 'प्रकाशन वर्ष',
      'bookDetails.ratings': 'रेटिंग',
      'bookDetails.overview': 'साहित्यिक अवलोकन और विषय',
      'bookDetails.about': 'संदर्भ और विवरण',
      'bookDetails.progress': 'मेरी पठन प्रगति',
      'bookDetails.reviews': 'पाठक समीक्षाएँ',
      'bookDetails.discussions': 'चर्चाएँ',
      'bookDetails.notes': 'मेरे नोट्स',
      'bookDetails.related': 'संबंधित पुस्तकें',
      'bookDetails.startReading': 'पढ़ना शुरू करें',
      'bookDetails.wantToRead': 'पढ़ना चाहते हैं',
      'bookDetails.markRead': 'पढ़ा हुआ चिह्नित करें',
      'bookDetails.writeReview': '+ समीक्षा लिखें',
      'bookDetails.addNote': '+ नोट जोड़ें',
      'bookDetails.saveHighlight': '✦ उद्धरण सहेजें',
      'bookDetails.joinGroup': 'पठन समूह में शामिल हों 👥',
      'bookDetails.recommend': 'मित्र को सिफारिश करें'
    }
  };

  
  function getBookText(book, field) {
    if (!book) return '';
    const lang = getLanguage();
    if (lang && lang !== 'en') {
      const localizedKey = field + '_' + lang;
      if (book[localizedKey] && String(book[localizedKey]).trim() !== '') {
        return book[localizedKey];
      }
    }
    return book[field] || '';
  }

  function getLanguage() {
    try {
      const stored = localStorage.getItem(LANG_KEY);
      if (stored && LANGUAGES[stored]) return stored;
    } catch (e) {}
    return DEFAULT_LANG;
  }

  function setLanguage(lang) {
    if (!LANGUAGES[lang]) lang = DEFAULT_LANG;
    try {
      localStorage.setItem(LANG_KEY, lang);
    } catch (e) {}

    document.documentElement.setAttribute('lang', lang);

    // Apply translations across DOM
    applyTranslations();

    // Sync all language selectors in DOM
    document.querySelectorAll('[data-lang-current]').forEach(el => {
      const info = LANGUAGES[lang];
      el.textContent = `${info.flag} ${info.name}`;
    });

    document.querySelectorAll('.lang-dropdown-item').forEach(item => {
      if (item.getAttribute('data-select-lang') === lang) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Notify listeners
    window.dispatchEvent(new CustomEvent('bookforge_lang_change', { detail: { lang } }));
  }

  function t(key, fallback = '') {
    const currentLang = getLanguage();
    if (TRANSLATIONS[currentLang] && TRANSLATIONS[currentLang][key] !== undefined) {
      return TRANSLATIONS[currentLang][key];
    }
    if (TRANSLATIONS['en'] && TRANSLATIONS['en'][key] !== undefined) {
      return TRANSLATIONS['en'][key];
    }
    return fallback || key;
  }

  function applyTranslations(root = document) {
    // 1. Text elements
    root.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const translation = t(key);
      if (translation) {
        el.textContent = translation;
      }
    });

    // 2. Placeholder attributes
    root.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      const translation = t(key);
      if (translation) {
        el.setAttribute('placeholder', translation);
      }
    });

    // 3. Title / tooltip attributes
    root.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      const translation = t(key);
      if (translation) {
        el.setAttribute('title', translation);
      }
    });
  }

  function init() {
    const lang = getLanguage();
    document.documentElement.setAttribute('lang', lang);

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        setLanguage(lang);
        bindLanguageEvents();
      });
    } else {
      setLanguage(lang);
      bindLanguageEvents();
    }
  }

  function bindLanguageEvents() {
    // Dropdown toggle
    document.querySelectorAll('.lang-select-trigger').forEach(trigger => {
      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        const menu = trigger.parentElement.querySelector('.lang-dropdown-menu');
        if (menu) menu.classList.toggle('show');
      });
    });

    // Close on outside click
    document.addEventListener('click', () => {
      document.querySelectorAll('.lang-dropdown-menu.show').forEach(menu => {
        menu.classList.remove('show');
      });
    });

    // Option clicks
    document.querySelectorAll('[data-select-lang]').forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        const lang = item.getAttribute('data-select-lang');
        setLanguage(lang);
        const menu = item.closest('.lang-dropdown-menu');
        if (menu) menu.classList.remove('show');

        if (typeof BookClubUI !== 'undefined' && BookClubUI.showToast) {
          const info = LANGUAGES[lang];
          BookClubUI.showToast(`Language changed to ${info.flag} ${info.name}`, 'info');
        }
      });
    });
  }

  init();

  return {
    t,
    getBookText,
    getLanguage,
    setLanguage,
    getLanguages: () => ({ ...LANGUAGES }),
    applyTranslations,
    init,
    bindLanguageEvents
  };
})();

// Global alias
window.BookForgeI18n = BookForgeI18n;
window.i18n = BookForgeI18n;
