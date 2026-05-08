import i18n from "i18next";
import { initReactI18next } from "react-i18next";

export const supportedLanguages = [
  { code: "en", label: "English", nativeLabel: "English" },
  { code: "es", label: "Spanish", nativeLabel: "Español" },
  { code: "hi", label: "Hindi", nativeLabel: "हिन्दी" },
  { code: "pt", label: "Portuguese", nativeLabel: "Português" },
  { code: "zh", label: "Chinese", nativeLabel: "中文" },
  { code: "fr", label: "French", nativeLabel: "Français" },
];

export const languageCodes = supportedLanguages.map((language) => language.code);

const common = {
  language: {
    en: "Language",
    es: "Idioma",
    hi: "भाषा",
    pt: "Idioma",
    zh: "语言",
    fr: "Langue",
  },
  internships: {
    en: "Internships",
    es: "Pasantías",
    hi: "इंटर्नशिप",
    pt: "Estágios",
    zh: "实习",
    fr: "Stages",
  },
  jobs: {
    en: "Jobs",
    es: "Empleos",
    hi: "नौकरियां",
    pt: "Empregos",
    zh: "工作",
    fr: "Emplois",
  },
  subscription: {
    en: "Subscription",
    es: "Suscripción",
    hi: "सदस्यता",
    pt: "Assinatura",
    zh: "订阅",
    fr: "Abonnement",
  },
  resume_builder: {
    en: "Resume Builder",
    es: "Creador de CV",
    hi: "रिज्यूमे बिल्डर",
    pt: "Criador de currículo",
    zh: "简历生成器",
    fr: "Créateur de CV",
  },
  feed: {
    en: "Feed",
    es: "Comunidad",
    hi: "फीड",
    pt: "Feed",
    zh: "动态",
    fr: "Fil",
  },
  search_placeholder: {
    en: "Search opportunities...",
    es: "Buscar oportunidades...",
    hi: "अवसर खोजें...",
    pt: "Pesquisar oportunidades...",
    zh: "搜索机会...",
    fr: "Rechercher des opportunités...",
  },
  logout: {
    en: "Logout",
    es: "Cerrar sesión",
    hi: "लॉग आउट",
    pt: "Sair",
    zh: "退出登录",
    fr: "Déconnexion",
  },
  profile: {
    en: "Profile",
    es: "Perfil",
    hi: "प्रोफाइल",
    pt: "Perfil",
    zh: "个人资料",
    fr: "Profil",
  },
  admin: {
    en: "Admin",
    es: "Admin",
    hi: "एडमिन",
    pt: "Admin",
    zh: "管理员",
    fr: "Admin",
  },
  admin_panel: {
    en: "Admin Panel",
    es: "Panel de admin",
    hi: "एडमिन पैनल",
    pt: "Painel admin",
    zh: "管理面板",
    fr: "Panneau admin",
  },
  admin_logout: {
    en: "Admin Logout",
    es: "Salir de admin",
    hi: "एडमिन लॉग आउट",
    pt: "Sair do admin",
    zh: "管理员退出",
    fr: "Déconnexion admin",
  },
  continue_google: {
    en: "Continue with Google",
    es: "Continuar con Google",
    hi: "Google से जारी रखें",
    pt: "Continuar com Google",
    zh: "使用 Google 继续",
    fr: "Continuer avec Google",
  },
  signing_in: {
    en: "Signing in...",
    es: "Iniciando sesión...",
    hi: "साइन इन हो रहा है...",
    pt: "Entrando...",
    zh: "正在登录...",
    fr: "Connexion...",
  },
  login_success: {
    en: "Logged in successfully",
    es: "Sesión iniciada correctamente",
    hi: "लॉगिन सफल",
    pt: "Login realizado com sucesso",
    zh: "登录成功",
    fr: "Connexion réussie",
  },
  login_failed: {
    en: "Login failed",
    es: "Error al iniciar sesión",
    hi: "लॉगिन विफल",
    pt: "Falha no login",
    zh: "登录失败",
    fr: "Échec de connexion",
  },
  french_otp_title: {
    en: "Verify email for French",
    es: "Verificar email para francés",
    hi: "फ्रेंच के लिए ईमेल सत्यापित करें",
    pt: "Verificar email para francês",
    zh: "验证邮箱以切换法语",
    fr: "Vérifier l'email pour le français",
  },
  french_otp_message: {
    en: "Enter the OTP sent to your email to switch to French.",
    es: "Ingresa el OTP enviado a tu email para cambiar a francés.",
    hi: "फ्रेंच भाषा चुनने के लिए ईमेल पर भेजा गया OTP दर्ज करें.",
    pt: "Digite o OTP enviado ao seu email para mudar para francês.",
    zh: "请输入发送到您邮箱的 OTP 以切换到法语。",
    fr: "Entrez l'OTP envoyé à votre email pour passer au français.",
  },
  send_otp: {
    en: "Send OTP",
    es: "Enviar OTP",
    hi: "OTP भेजें",
    pt: "Enviar OTP",
    zh: "发送 OTP",
    fr: "Envoyer OTP",
  },
  verify: {
    en: "Verify",
    es: "Verificar",
    hi: "सत्यापित करें",
    pt: "Verificar",
    zh: "验证",
    fr: "Vérifier",
  },
  enter_otp: {
    en: "Enter OTP",
    es: "Ingresa OTP",
    hi: "OTP दर्ज करें",
    pt: "Digite OTP",
    zh: "输入 OTP",
    fr: "Entrer OTP",
  },
  cancel: {
    en: "Cancel",
    es: "Cancelar",
    hi: "रद्द करें",
    pt: "Cancelar",
    zh: "取消",
    fr: "Annuler",
  },
  otp_sent: {
    en: "OTP sent to your email",
    es: "OTP enviado a tu email",
    hi: "OTP आपके ईमेल पर भेजा गया",
    pt: "OTP enviado ao seu email",
    zh: "OTP 已发送到您的邮箱",
    fr: "OTP envoyé à votre email",
  },
  otp_verified: {
    en: "Language changed to French",
    es: "Idioma cambiado a francés",
    hi: "भाषा फ्रेंच में बदल गई",
    pt: "Idioma alterado para francês",
    zh: "语言已切换为法语",
    fr: "Langue changée en français",
  },
  login_for_french: {
    en: "Login with email before switching to French",
    es: "Inicia sesión con email antes de cambiar a francés",
    hi: "फ्रेंच चुनने से पहले ईमेल से लॉगिन करें",
    pt: "Faça login com email antes de mudar para francês",
    zh: "切换到法语前请先使用邮箱登录",
    fr: "Connectez-vous avec un email avant de passer au français",
  },
  welcome: {
    en: "Welcome",
    es: "Bienvenido",
    hi: "स्वागत है",
    pt: "Bem-vindo",
    zh: "欢迎",
    fr: "Bienvenue",
  },
  about: {
    en: "About",
    es: "Acerca de",
    hi: "के बारे में",
    pt: "Sobre",
    zh: "关于",
    fr: "À propos",
  },
  who_apply: {
    en: "Who can apply",
    es: "Quién puede aplicar",
    hi: "कौन आवेदन कर सकता है",
    pt: "Quem pode se candidatar",
    zh: "谁可以申请",
    fr: "Qui peut postuler",
  },
  perks: {
    en: "Perks",
    es: "Beneficios",
    hi: "लाभ",
    pt: "Benefícios",
    zh: "福利",
    fr: "Avantages",
  },
  additional_info: {
    en: "Additional Information",
    es: "Información adicional",
    hi: "अतिरिक्त जानकारी",
    pt: "Informações adicionais",
    zh: "附加信息",
    fr: "Informations supplémentaires",
  },
  openings: {
    en: "Number of Openings",
    es: "Número de vacantes",
    hi: "रिक्त पदों की संख्या",
    pt: "Número de vagas",
    zh: "职位空缺数量",
    fr: "Nombre de postes",
  },
  apply_now: {
    en: "Apply Now",
    es: "Aplicar ahora",
    hi: "अभी आवेदन करें",
    pt: "Candidatar-se agora",
    zh: "立即申请",
    fr: "Postuler maintenant",
  },
};

export const staticTextTranslations = {
  "Trending on InternArea 🔥": {
    es: "Tendencias en InternArea 🔥",
    hi: "InternArea पर ट्रेंडिंग 🔥",
    pt: "Em alta no InternArea 🔥",
    zh: "InternArea 热门 🔥",
    fr: "Tendances sur InternArea 🔥",
  },
  "Start Your Career Journey": {
    es: "Comienza tu carrera",
    hi: "अपना करियर सफर शुरू करें",
    pt: "Comece sua jornada profissional",
    zh: "开启你的职业旅程",
    fr: "Commencez votre parcours professionnel",
  },
  "Learn From The Best": {
    es: "Aprende de los mejores",
    hi: "सर्वश्रेष्ठ से सीखें",
    pt: "Aprenda com os melhores",
    zh: "向优秀者学习",
    fr: "Apprenez des meilleurs",
  },
  "Grow Your Skills": {
    es: "Desarrolla tus habilidades",
    hi: "अपने कौशल बढ़ाएं",
    pt: "Desenvolva suas habilidades",
    zh: "提升你的技能",
    fr: "Développez vos compétences",
  },
  "Connect With Top Companies": {
    es: "Conecta con las mejores empresas",
    hi: "शीर्ष कंपनियों से जुड़ें",
    pt: "Conecte-se com grandes empresas",
    zh: "连接顶级公司",
    fr: "Connectez-vous aux meilleures entreprises",
  },
  "Latest internships on Intern Area": {
    es: "Últimas pasantías en Intern Area",
    hi: "Intern Area पर नवीनतम इंटर्नशिप",
    pt: "Últimos estágios no Intern Area",
    zh: "Intern Area 最新实习",
    fr: "Derniers stages sur Intern Area",
  },
  "POPULAR CATEGORIES:": {
    es: "CATEGORÍAS POPULARES:",
    hi: "लोकप्रिय श्रेणियां:",
    pt: "CATEGORIAS POPULARES:",
    zh: "热门类别：",
    fr: "CATÉGORIES POPULAIRES :",
  },
  "Big Brands": {
    es: "Grandes marcas",
    hi: "बड़े ब्रांड",
    pt: "Grandes marcas",
    zh: "大品牌",
    fr: "Grandes marques",
  },
  "Work From Home": {
    es: "Trabajo desde casa",
    hi: "घर से काम",
    pt: "Trabalho remoto",
    zh: "居家工作",
    fr: "Télétravail",
  },
  "Work from home": {
    es: "Trabajo desde casa",
    hi: "घर से काम",
    pt: "Trabalho remoto",
    zh: "居家工作",
    fr: "Télétravail",
  },
  "Part-time": {
    es: "Medio tiempo",
    hi: "पार्ट-टाइम",
    pt: "Meio período",
    zh: "兼职",
    fr: "Temps partiel",
  },
  "Engineering": {
    es: "Ingeniería",
    hi: "इंजीनियरिंग",
    pt: "Engenharia",
    zh: "工程",
    fr: "Ingénierie",
  },
  "Media": {
    es: "Medios",
    hi: "मीडिया",
    pt: "Mídia",
    zh: "媒体",
    fr: "Médias",
  },
  "Design": {
    es: "Diseño",
    hi: "डिजाइन",
    pt: "Design",
    zh: "设计",
    fr: "Design",
  },
  "Data Science": {
    es: "Ciencia de datos",
    hi: "डेटा साइंस",
    pt: "Ciência de dados",
    zh: "数据科学",
    fr: "Science des données",
  },
  "Actively Hiring": {
    es: "Contratando activamente",
    hi: "सक्रिय रूप से भर्ती",
    pt: "Contratando ativamente",
    zh: "正在招聘",
    fr: "Recrutement actif",
  },
  "View details": {
    es: "Ver detalles",
    hi: "विवरण देखें",
    pt: "Ver detalhes",
    zh: "查看详情",
    fr: "Voir les détails",
  },
  "View Details": {
    es: "Ver detalles",
    hi: "विवरण देखें",
    pt: "Ver detalhes",
    zh: "查看详情",
    fr: "Voir les détails",
  },
  "Latest Jobs": {
    es: "Últimos empleos",
    hi: "नवीनतम नौकरियां",
    pt: "Últimos empregos",
    zh: "最新工作",
    fr: "Derniers emplois",
  },
  "Filters": {
    es: "Filtros",
    hi: "फिल्टर",
    pt: "Filtros",
    zh: "筛选",
    fr: "Filtres",
  },
  "Clear all": {
    es: "Limpiar todo",
    hi: "सभी हटाएं",
    pt: "Limpar tudo",
    zh: "全部清除",
    fr: "Tout effacer",
  },
  "Category": {
    es: "Categoría",
    hi: "श्रेणी",
    pt: "Categoria",
    zh: "类别",
    fr: "Catégorie",
  },
  "Location": {
    es: "Ubicación",
    hi: "स्थान",
    pt: "Localização",
    zh: "地点",
    fr: "Lieu",
  },
  "Experience": {
    es: "Experiencia",
    hi: "अनुभव",
    pt: "Experiência",
    zh: "经验",
    fr: "Expérience",
  },
  "Start Date": {
    es: "Fecha de inicio",
    hi: "आरंभ तिथि",
    pt: "Data de início",
    zh: "开始日期",
    fr: "Date de début",
  },
  "Stipend": {
    es: "Estipendio",
    hi: "स्टाइपेंड",
    pt: "Bolsa",
    zh: "津贴",
    fr: "Allocation",
  },
  "Monthly Stipend (₹)": {
    es: "Estipendio mensual (₹)",
    hi: "मासिक स्टाइपेंड (₹)",
    pt: "Bolsa mensal (₹)",
    zh: "月津贴 (₹)",
    fr: "Allocation mensuelle (₹)",
  },
  "Annula Salary (₹ in lakhs)": {
    es: "Salario anual (₹ en lakhs)",
    hi: "वार्षिक वेतन (₹ लाख में)",
    pt: "Salário anual (₹ em lakhs)",
    zh: "年薪 (₹ 十万)",
    fr: "Salaire annuel (₹ en lakhs)",
  },
  "Show Filters": {
    es: "Mostrar filtros",
    hi: "फिल्टर दिखाएं",
    pt: "Mostrar filtros",
    zh: "显示筛选",
    fr: "Afficher les filtres",
  },
  "Internships found": {
    es: "pasantías encontradas",
    hi: "इंटर्नशिप मिलीं",
    pt: "estágios encontrados",
    zh: "个实习已找到",
    fr: "stages trouvés",
  },
  "Jobs found": {
    es: "empleos encontrados",
    hi: "नौकरियां मिलीं",
    pt: "empregos encontrados",
    zh: "个工作已找到",
    fr: "emplois trouvés",
  },
  "Posted recently": {
    es: "Publicado recientemente",
    hi: "हाल ही में पोस्ट किया गया",
    pt: "Publicado recentemente",
    zh: "最近发布",
    fr: "Publié récemment",
  },
  "Choose your internship application plan": {
    es: "Elige tu plan de solicitudes de pasantía",
    hi: "अपनी इंटर्नशिप आवेदन योजना चुनें",
    pt: "Escolha seu plano de candidatura a estágios",
    zh: "选择你的实习申请计划",
    fr: "Choisissez votre plan de candidatures aux stages",
  },
  "Free users can apply for 1 internship. Upgrade to apply for more internships each month.": {
    es: "Los usuarios gratis pueden aplicar a 1 pasantía. Actualiza para aplicar a más cada mes.",
    hi: "फ्री यूजर 1 इंटर्नशिप के लिए आवेदन कर सकते हैं. हर महीने अधिक आवेदन के लिए अपग्रेड करें.",
    pt: "Usuários grátis podem se candidatar a 1 estágio. Faça upgrade para mais candidaturas por mês.",
    zh: "免费用户可申请 1 个实习。升级后每月可申请更多实习。",
    fr: "Les utilisateurs gratuits peuvent postuler à 1 stage. Passez à un forfait supérieur pour postuler davantage chaque mois.",
  },
  "Payments open daily from 10:00 AM to 11:00 AM IST": {
    es: "Los pagos abren todos los días de 10:00 AM a 11:00 AM IST",
    hi: "भुगतान रोजाना 10:00 AM से 11:00 AM IST तक खुलते हैं",
    pt: "Pagamentos abrem diariamente das 10:00 às 11:00 IST",
    zh: "付款每天 IST 10:00 AM 至 11:00 AM 开放",
    fr: "Les paiements sont ouverts tous les jours de 10h00 à 11h00 IST",
  },
  "Current plan": {
    es: "Plan actual",
    hi: "वर्तमान योजना",
    pt: "Plano atual",
    zh: "当前计划",
    fr: "Forfait actuel",
  },
  "Opening payment...": {
    es: "Abriendo pago...",
    hi: "भुगतान खुल रहा है...",
    pt: "Abrindo pagamento...",
    zh: "正在打开付款...",
    fr: "Ouverture du paiement...",
  },
  "Subscribe": {
    es: "Suscribirse",
    hi: "सदस्यता लें",
    pt: "Assinar",
    zh: "订阅",
    fr: "S'abonner",
  },
  "Active": {
    es: "Activo",
    hi: "सक्रिय",
    pt: "Ativo",
    zh: "有效",
    fr: "Actif",
  },
};

const resources = languageCodes.reduce((resourceMap, language) => {
  resourceMap[language] = {
    translation: Object.entries(common).reduce((translations, [key, values]) => {
      translations[key] = values[language] || values.en;
      return translations;
    }, {}),
  };
  return resourceMap;
}, {});

export function translateStaticText(text, language) {
  const normalizedText = String(text || "").replace(/\s+/g, " ").trim();

  if (!normalizedText || language === "en") {
    return normalizedText;
  }

  const exactTranslation = staticTextTranslations[normalizedText]?.[language];

  if (exactTranslation) {
    return exactTranslation;
  }

  const countMatch = normalizedText.match(/^(\d+)\s+(Internships found|Jobs found)$/);

  if (countMatch) {
    const [, count, label] = countMatch;
    const translatedLabel = staticTextTranslations[label]?.[language] || label;
    return language === "zh" ? `${count}${translatedLabel}` : `${count} ${translatedLabel}`;
  }

  return normalizedText;
}

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources,
    lng: typeof window !== "undefined" ? localStorage.getItem("language") || "en" : "en",
    fallbackLng: "en",
    supportedLngs: languageCodes,
    interpolation: {
      escapeValue: false,
    },
  });
}

export default i18n;
