"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import countries from 'world-countries';

export type CountryRegion = {
  cca2: string;
  name: string;
  currency: string;
  languages: string[];
  flag?: string;
};

// Country to primary language mapping - comprehensive mapping for world countries
const countryLanguageMap: Record<string, string> = {
  // Bengali speaking countries
  'BD': 'bn', // Bangladesh -> Bengali
  'IN': 'bn', // India -> Bengali (for Bengali speakers)
  
  // English speaking countries
  'US': 'en', 'GB': 'en', 'AU': 'en', 'NZ': 'en', 'IE': 'en', 'ZA': 'en',
  'SG': 'en', 'MY': 'en', 'PK': 'en', 'LK': 'en', 'AE': 'en', 'QA': 'en',
  'KW': 'en', 'SA': 'en', 'OM': 'en', 'BH': 'en',
  
  // Spanish speaking countries
  'ES': 'es', 'MX': 'es', 'AR': 'es', 'CO': 'es', 'PE': 'es', 'VE': 'es',
  'CL': 'es', 'EC': 'es', 'BO': 'es', 'PY': 'es', 'UY': 'es', 'CR': 'es',
  'PA': 'es', 'GT': 'es', 'HN': 'es', 'SV': 'es', 'NI': 'es', 'DO': 'es', 'CU': 'es',
  
  // French speaking countries
  'FR': 'fr', 'BE': 'fr', 'CA': 'fr', 'LU': 'fr', 'MC': 'fr', 'SN': 'fr',
  'ML': 'fr', 'BF': 'fr', 'NE': 'fr', 'CI': 'fr', 'MG': 'fr',
  
  // German speaking countries
  'DE': 'de', 'AT': 'de', 'LI': 'de',
  
  // Italian speaking countries
  'IT': 'it', 'SM': 'it', 'VA': 'it',
  
  // Portuguese speaking countries
  'PT': 'pt', 'BR': 'pt', 'AO': 'pt', 'MZ': 'pt',
  
  // Chinese speaking countries/regions
  'CN': 'zh', 'TW': 'zh', 'HK': 'zh', 'MO': 'zh',
  
  // Japanese
  'JP': 'ja',
  
  // Korean
  'KR': 'ko', 'KP': 'ko',
  
  // Russian speaking countries
  'RU': 'ru', 'BY': 'ru', 'KZ': 'ru', 'KG': 'ru', 'TJ': 'ru',
  
  // Arabic speaking countries
  'EG': 'ar', 'JO': 'ar', 'LB': 'ar', 'SY': 'ar', 'IQ': 'ar', 'YE': 'ar',
  'LY': 'ar', 'TN': 'ar', 'DZ': 'ar', 'MA': 'ar', 'SD': 'ar',
  
  // Dutch speaking countries
  'NL': 'nl', 'SR': 'nl',
  
  // Turkish
  'TR': 'tr', 'CY': 'tr',
};

// Default region (Bangladesh)
const defaultRegion: CountryRegion = {
  cca2: 'BD',
  name: 'Bangladesh',
  currency: 'BDT',
  languages: ['Bengali'],
  flag: '🇧🇩'
};

type RegionContextType = {
  selectedRegion: CountryRegion;
  setSelectedRegion: (region: CountryRegion) => void;
  formatPrice: (amount: number) => string;
  currentLanguage: string;
  setCurrentLanguage: (lang: string) => void;
  getLanguage: () => string;
  t: (key: string) => string;
};

const RegionContext = createContext<RegionContextType | undefined>(undefined);

export function RegionProvider({ children }: { children: ReactNode }) {
  const [selectedRegion, setSelectedRegionState] = useState<CountryRegion>(defaultRegion);
  const [currentLanguage, setCurrentLanguageState] = useState('bn');

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('selectedRegion');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSelectedRegionState(parsed);
      } catch (e) {
        console.error('Failed to parse saved region:', e);
      }
    }

    const savedLang = localStorage.getItem('language');
    if (savedLang) {
      setCurrentLanguageState(savedLang);
    }
  }, []);

  // Save to localStorage when region changes + Auto language change
  const setSelectedRegion = (region: CountryRegion) => {
    setSelectedRegionState(region);
    localStorage.setItem('selectedRegion', JSON.stringify(region));
    
    // Automatically change language based on country
    const countryLanguage = countryLanguageMap[region.cca2] || 'en';
    setCurrentLanguageState(countryLanguage);
    localStorage.setItem('language', countryLanguage);
  };

  const setCurrentLanguage = (lang: string) => {
    setCurrentLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const formatPrice = (amount: number): string => {
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: selectedRegion.currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(amount);
    } catch (e) {
      return `${amount} ${selectedRegion.currency}`;
    }
  };

  const getLanguage = (): string => {
    return selectedRegion.languages[0] || 'English';
  };

  // Comprehensive translation function for multiple languages
  const t = (key: string): string => {
    const translations: Record<string, Record<string, string>> = {
      bn: {
  serverConnectionError: 'সার্ভারের সাথে সংযোগ হচ্ছে না। অনুগ্রহ করে সার্ভার চালু আছে কিনা চেক করুন।',
  sessionExpired: 'আপনার লগইন সেশন শেষ হয়ে গেছে। দয়া করে আবার লগইন করুন।',
  websiteCreateError: 'ওয়েবসাইট তৈরি করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।',
  createWebsiteDesc: 'মাত্র ১০ সেকেন্ডে আপনার ই-কমার্স ওয়েবসাইট তৈরি করুন',
  websiteNamePlaceholder: 'যেমন: আমার দোকান',
  loading: 'লোড হচ্ছে...',
  dashboardDesc: 'আপনার ব্যবসার সম্পূর্ণ তথ্য এক জায়গায়',
  viewWebsite: 'ওয়েবসাইট দেখুন',
  addProduct: 'প্রোডাক্ট যোগ করুন',
  websiteSuccess: 'আপনার ওয়েবসাইট সফলভাবে তৈরি হয়েছে এবং চালু আছে',
  websiteAddress: 'ওয়েবসাইট ঠিকানা:',
  activeProducts: 'সক্রিয় প্রোডাক্ট',
  completedOrders: 'সম্পূর্ণ অর্ডার',
  totalSales: 'সর্বমোট বিক্রয়',
  thisMonthProfit: 'এই মাসের লাভ',
  recentOrdersDesc: 'আপনার সাম্প্রতিক অর্ডারগুলির তালিকা',
  noOrdersFound: 'কোনো অর্ডার পাওয়া যায়নি',
  addFirstProduct: 'প্রথম প্রোডাক্ট যোগ করুন',
  order: 'অর্ডার',
  completed: 'সম্পূর্ণ',
  processing: 'প্রক্রিয়াধীন',
  viewAllOrders: 'সব অর্ডার দেখুন',
  quickActionsDesc: 'সাধারণ কাজগুলো দ্রুত করুন',
  viewOrders: 'অর্ডার দেখুন',
  settings: 'সেটিংস',
        language: 'ভাষা', bangla: 'বাংলা', english: 'English',
        searchPlaceholder: 'পণ্য খুঁজুন...', allProducts: 'সব পণ্য',
        cart: 'কার্ট', viewCart: 'কার্ট দেখুন', emptyCart: 'আপনার কার্ট খালি',
        total: 'মোট', orderNow: 'অর্ডার করুন', customerInfo: 'গ্রাহকের তথ্য',
        name: 'নাম', phone: 'ফোন', address: 'ঠিকানা', email: 'ইমেইল',
        placeOrder: 'অর্ডার দিন', cancel: 'বাতিল', orderSummary: 'অর্ডার সামারি',
        welcome: 'স্বাগতম', stayWithUs: 'আমাদের সাথে থাকুন',
        newArrivals: 'নতুন এসেছে', bestSellers: 'বেস্ট সেলার', bestSeller: 'বেস্ট সেলার',
        addToCart: 'কার্টে যোগ করুন', noProducts: 'কোনো পণ্য পাওয়া যায়নি।',
        inStock: 'স্টকে আছে', outOfStock: 'স্টক নেই', products: 'টি পণ্য',
        quantity: 'পরিমাণ', continueShopping: 'কেনাকাটা চালিয়ে যান',
        websiteNotFound: 'ওয়েবসাইট পাওয়া যায়নি',
        fillAllFields: 'অনুগ্রহ করে সব তথ্য পূরণ করুন।',
        orderSuccess: 'অর্ডার সফলভাবে দেওয়া হয়েছে!',
        // Dashboard translations
        dashboard: 'ড্যাশবোর্ড', totalOrders: 'মোট অর্ডার', totalProducts: 'মোট পণ্য',
        totalRevenue: 'মোট আয়', monthlyProfit: 'মাসিক লাভ', recentOrders: 'সাম্প্রতিক অর্ডার',
        quickActions: 'দ্রুত অ্যাকশন', orderDetails: 'অর্ডার ডিটেইল',
        createWebsite: 'ওয়েবসাইট তৈরি করুন', websiteName: 'ওয়েবসাইটের নাম',
        create: 'তৈরি করুন', creating: 'তৈরি করা হচ্ছে...',
      },
      en: {
        language: 'Language', bangla: 'বাংলা', english: 'English',
        searchPlaceholder: 'Search products...', allProducts: 'All Products',
        cart: 'Cart', viewCart: 'View Cart', emptyCart: 'Your cart is empty',
        total: 'Total', orderNow: 'Order Now', customerInfo: 'Customer Information',
        name: 'Name', phone: 'Phone', address: 'Address', email: 'Email',
        placeOrder: 'Place Order', cancel: 'Cancel', orderSummary: 'Order Summary',
        welcome: 'Welcome', stayWithUs: 'Stay with us',
        newArrivals: 'New Arrivals', bestSellers: 'Best Sellers', bestSeller: 'Best Seller',
        addToCart: 'Add to Cart', noProducts: 'No products found.',
        inStock: 'In Stock', outOfStock: 'Out of Stock', products: ' products',
        quantity: 'Quantity', continueShopping: 'Continue Shopping',
        websiteNotFound: 'Website not found',
        fillAllFields: 'Please fill all required fields.',
        orderSuccess: 'Order placed successfully!',
        // Dashboard translations
        dashboard: 'Dashboard', totalOrders: 'Total Orders', totalProducts: 'Total Products',
        totalRevenue: 'Total Revenue', monthlyProfit: 'Monthly Profit', recentOrders: 'Recent Orders',
        quickActions: 'Quick Actions', orderDetails: 'Order Details',
        createWebsite: 'Create Website', websiteName: 'Website Name',
        create: 'Create', creating: 'Creating...',
      },
      es: {
        language: 'Idioma', bangla: 'Bengali', english: 'Inglés',
        searchPlaceholder: 'Buscar productos...', allProducts: 'Todos los Productos',
        cart: 'Carrito', viewCart: 'Ver Carrito', emptyCart: 'Tu carrito está vacío',
        total: 'Total', orderNow: 'Ordenar Ahora', customerInfo: 'Información del Cliente',
        name: 'Nombre', phone: 'Teléfono', address: 'Dirección', email: 'Email',
        placeOrder: 'Realizar Pedido', cancel: 'Cancelar', orderSummary: 'Resumen del Pedido',
        welcome: 'Bienvenido', stayWithUs: 'Quédate con nosotros',
        newArrivals: 'Nuevos Llegados', bestSellers: 'Más Vendidos', bestSeller: 'Más Vendido',
        addToCart: 'Añadir al Carrito', noProducts: 'No se encontraron productos.',
        inStock: 'En Stock', outOfStock: 'Agotado', products: ' productos',
        quantity: 'Cantidad', continueShopping: 'Continuar Comprando',
        websiteNotFound: 'Sitio web no encontrado',
        fillAllFields: 'Por favor complete todos los campos requeridos.',
        orderSuccess: '¡Pedido realizado con éxito!',
      },
      fr: {
        language: 'Langue', bangla: 'Bengali', english: 'Anglais',
        searchPlaceholder: 'Rechercher des produits...', allProducts: 'Tous les Produits',
        cart: 'Panier', viewCart: 'Voir le Panier', emptyCart: 'Votre panier est vide',
        total: 'Total', orderNow: 'Commander Maintenant', customerInfo: 'Informations Client',
        name: 'Nom', phone: 'Téléphone', address: 'Adresse', email: 'Email',
        placeOrder: 'Passer Commande', cancel: 'Annuler', orderSummary: 'Résumé de Commande',
        welcome: 'Bienvenue', stayWithUs: 'Restez avec nous',
        newArrivals: 'Nouvelles Arrivées', bestSellers: 'Meilleures Ventes', bestSeller: 'Meilleure Vente',
        addToCart: 'Ajouter au Panier', noProducts: 'Aucun produit trouvé.',
        inStock: 'En Stock', outOfStock: 'Rupture de Stock', products: ' produits',
        quantity: 'Quantité', continueShopping: 'Continuer les Achats',
        websiteNotFound: 'Site web non trouvé',
        fillAllFields: 'Veuillez remplir tous les champs requis.',
        orderSuccess: 'Commande passée avec succès!',
      },
      de: {
        language: 'Sprache', bangla: 'Bengali', english: 'Englisch',
        searchPlaceholder: 'Produkte suchen...', allProducts: 'Alle Produkte',
        cart: 'Warenkorb', viewCart: 'Warenkorb ansehen', emptyCart: 'Ihr Warenkorb ist leer',
        total: 'Gesamt', orderNow: 'Jetzt bestellen', customerInfo: 'Kundeninformationen',
        name: 'Name', phone: 'Telefon', address: 'Adresse', email: 'Email',
        placeOrder: 'Bestellung aufgeben', cancel: 'Abbrechen', orderSummary: 'Bestellübersicht',
        welcome: 'Willkommen', stayWithUs: 'Bleiben Sie bei uns',
        newArrivals: 'Neuankömmlinge', bestSellers: 'Bestseller', bestSeller: 'Bestseller',
        addToCart: 'In den Warenkorb', noProducts: 'Keine Produkte gefunden.',
        inStock: 'Auf Lager', outOfStock: 'Ausverkauft', products: ' Produkte',
        quantity: 'Menge', continueShopping: 'Weiter einkaufen',
        websiteNotFound: 'Website nicht gefunden',
        fillAllFields: 'Bitte füllen Sie alle erforderlichen Felder aus.',
        orderSuccess: 'Bestellung erfolgreich aufgegeben!',
      },
      it: {
        language: 'Lingua', bangla: 'Bengali', english: 'Inglese',
        searchPlaceholder: 'Cerca prodotti...', allProducts: 'Tutti i Prodotti',
        cart: 'Carrello', viewCart: 'Visualizza Carrello', emptyCart: 'Il tuo carrello è vuoto',
        total: 'Totale', orderNow: 'Ordina Ora', customerInfo: 'Informazioni Cliente',
        name: 'Nome', phone: 'Telefono', address: 'Indirizzo', email: 'Email',
        placeOrder: 'Effettua Ordine', cancel: 'Annulla', orderSummary: 'Riepilogo Ordine',
        welcome: 'Benvenuto', stayWithUs: 'Resta con noi',
        newArrivals: 'Nuovi Arrivi', bestSellers: 'Più Venduti', bestSeller: 'Più Venduto',
        addToCart: 'Aggiungi al Carrello', noProducts: 'Nessun prodotto trovato.',
        inStock: 'Disponibile', outOfStock: 'Esaurito', products: ' prodotti',
        quantity: 'Quantità', continueShopping: 'Continua lo Shopping',
        websiteNotFound: 'Sito web non trovato',
        fillAllFields: 'Si prega di compilare tutti i campi richiesti.',
        orderSuccess: 'Ordine effettuato con successo!',
      },
      pt: {
        language: 'Idioma', bangla: 'Bengali', english: 'Inglês',
        searchPlaceholder: 'Pesquisar produtos...', allProducts: 'Todos os Produtos',
        cart: 'Carrinho', viewCart: 'Ver Carrinho', emptyCart: 'Seu carrinho está vazio',
        total: 'Total', orderNow: 'Pedir Agora', customerInfo: 'Informações do Cliente',
        name: 'Nome', phone: 'Telefone', address: 'Endereço', email: 'Email',
        placeOrder: 'Fazer Pedido', cancel: 'Cancelar', orderSummary: 'Resumo do Pedido',
        welcome: 'Bem-vindo', stayWithUs: 'Fique conosco',
        newArrivals: 'Novidades', bestSellers: 'Mais Vendidos', bestSeller: 'Mais Vendido',
        addToCart: 'Adicionar ao Carrinho', noProducts: 'Nenhum produto encontrado.',
        inStock: 'Em Estoque', outOfStock: 'Fora de Estoque', products: ' produtos',
        quantity: 'Quantidade', continueShopping: 'Continuar Comprando',
        websiteNotFound: 'Site não encontrado',
        fillAllFields: 'Por favor, preencha todos os campos obrigatórios.',
        orderSuccess: 'Pedido realizado com sucesso!',
      },
      zh: {
        language: '语言', bangla: '孟加拉语', english: '英语',
        searchPlaceholder: '搜索产品...', allProducts: '所有产品',
        cart: '购物车', viewCart: '查看购物车', emptyCart: '您的购物车是空的',
        total: '总计', orderNow: '立即订购', customerInfo: '客户信息',
        name: '姓名', phone: '电话', address: '地址', email: '邮箱',
        placeOrder: '下订单', cancel: '取消', orderSummary: '订单摘要',
        welcome: '欢迎', stayWithUs: '与我们同在',
        newArrivals: '新品上市', bestSellers: '畅销商品', bestSeller: '畅销商品',
        addToCart: '加入购物车', noProducts: '未找到产品。',
        inStock: '有库存', outOfStock: '缺货', products: ' 产品',
        quantity: '数量', continueShopping: '继续购物',
        websiteNotFound: '未找到网站',
        fillAllFields: '请填写所有必填字段。',
        orderSuccess: '订单提交成功！',
      },
      ja: {
        language: '言語', bangla: 'ベンガル語', english: '英語',
        searchPlaceholder: '製品を検索...', allProducts: 'すべての製品',
        cart: 'カート', viewCart: 'カートを見る', emptyCart: 'カートは空です',
        total: '合計', orderNow: '今すぐ注文', customerInfo: '顧客情報',
        name: '名前', phone: '電話', address: '住所', email: 'メール',
        placeOrder: '注文する', cancel: 'キャンセル', orderSummary: '注文概要',
        welcome: 'ようこそ', stayWithUs: '私たちと一緒にいてください',
        newArrivals: '新着商品', bestSellers: 'ベストセラー', bestSeller: 'ベストセラー',
        addToCart: 'カートに追加', noProducts: '製品が見つかりません。',
        inStock: '在庫あり', outOfStock: '在庫切れ', products: ' 製品',
        quantity: '数量', continueShopping: 'ショッピングを続ける',
        websiteNotFound: 'ウェブサイトが見つかりません',
        fillAllFields: 'すべての必須フィールドに入力してください。',
        orderSuccess: '注文が正常に送信されました！',
      },
      ko: {
        language: '언어', bangla: '벵골어', english: '영어',
        searchPlaceholder: '제품 검색...', allProducts: '모든 제품',
        cart: '장바구니', viewCart: '장바구니 보기', emptyCart: '장바구니가 비어있습니다',
        total: '총합', orderNow: '지금 주문', customerInfo: '고객 정보',
        name: '이름', phone: '전화', address: '주소', email: '이메일',
        placeOrder: '주문하기', cancel: '취소', orderSummary: '주문 요약',
        welcome: '환영합니다', stayWithUs: '함께해주세요',
        newArrivals: '신상품', bestSellers: '베스트셀러', bestSeller: '베스트셀러',
        addToCart: '장바구니에 추가', noProducts: '제품을 찾을 수 없습니다.',
        inStock: '재고 있음', outOfStock: '품절', products: ' 제품',
        quantity: '수량', continueShopping: '쇼핑 계속하기',
        websiteNotFound: '웹사이트를 찾을 수 없습니다',
        fillAllFields: '모든 필수 필드를 입력해주세요.',
        orderSuccess: '주문이 성공적으로 접수되었습니다!',
      },
      ru: {
        language: 'Язык', bangla: 'Бенгальский', english: 'Английский',
        searchPlaceholder: 'Поиск товаров...', allProducts: 'Все Товары',
        cart: 'Корзина', viewCart: 'Посмотреть Корзину', emptyCart: 'Ваша корзина пуста',
        total: 'Итого', orderNow: 'Заказать Сейчас', customerInfo: 'Информация о Клиенте',
        name: 'Имя', phone: 'Телефон', address: 'Адрес', email: 'Email',
        placeOrder: 'Сделать Заказ', cancel: 'Отменить', orderSummary: 'Сводка Заказа',
        welcome: 'Добро пожаловать', stayWithUs: 'Оставайтесь с нами',
        newArrivals: 'Новинки', bestSellers: 'Бестселлеры', bestSeller: 'Бестселлер',
        addToCart: 'Добавить в Корзину', noProducts: 'Товары не найдены.',
        inStock: 'В Наличии', outOfStock: 'Нет в Наличии', products: ' товаров',
        quantity: 'Количество', continueShopping: 'Продолжить Покупки',
        websiteNotFound: 'Сайт не найден',
        fillAllFields: 'Пожалуйста, заполните все обязательные поля.',
        orderSuccess: 'Заказ успешно размещен!',
      },
      ar: {
  serverConnectionError: 'لا يمكن الاتصال بالخادم. يرجى التحقق من تشغيل الخادم.',
  sessionExpired: 'انتهت جلسة تسجيل الدخول الخاصة بك. يرجى تسجيل الدخول مرة أخرى.',
  websiteCreateError: 'حدثت مشكلة في إنشاء الموقع. يرجى المحاولة مرة أخرى.',
  createWebsiteDesc: 'أنشئ موقع التجارة الإلكترونية الخاص بك في 10 ثوانٍ فقط',
  websiteNamePlaceholder: 'مثال: متجري',
  loading: 'جار التحميل...',
  dashboardDesc: 'جميع معلومات عملك في مكان واحد',
  viewWebsite: 'عرض الموقع',
  addProduct: 'إضافة منتج',
  websiteSuccess: 'تم إنشاء موقعك بنجاح وهو نشط الآن',
  websiteAddress: 'عنوان الموقع:',
  activeProducts: 'منتجات نشطة',
  completedOrders: 'طلبات مكتملة',
  totalSales: 'إجمالي المبيعات',
  thisMonthProfit: 'ربح هذا الشهر',
  recentOrdersDesc: 'قائمة طلباتك الأخيرة',
  noOrdersFound: 'لم يتم العثور على طلبات',
  addFirstProduct: 'أضف أول منتج',
  order: 'طلب',
  completed: 'مكتمل',
  processing: 'قيد المعالجة',
  viewAllOrders: 'عرض جميع الطلبات',
  quickActionsDesc: 'نفذ المهام الشائعة بسرعة',
  viewOrders: 'عرض الطلبات',
  settings: 'الإعدادات',
        language: 'اللغة', bangla: 'البنغالية', english: 'الإنجليزية',
        searchPlaceholder: 'البحث عن المنتجات...', allProducts: 'جميع المنتجات',
        cart: 'السلة', viewCart: 'عرض السلة', emptyCart: 'سلتك فارغة',
        total: 'المجموع', orderNow: 'اطلب الآن', customerInfo: 'معلومات العميل',
        name: 'الاسم', phone: 'الهاتف', address: 'العنوان', email: 'البريد الإلكتروني',
        placeOrder: 'تأكيد الطلب', cancel: 'إلغاء', orderSummary: 'ملخص الطلب',
        welcome: 'مرحباً', stayWithUs: 'ابق معنا',
        newArrivals: 'وصل حديثاً', bestSellers: 'الأكثر مبيعاً', bestSeller: 'الأكثر مبيعاً',
        addToCart: 'أضف للسلة', noProducts: 'لم يتم العثور على منتجات.',
        inStock: 'متوفر', outOfStock: 'غير متوفر', products: ' منتجات',
        quantity: 'الكمية', continueShopping: 'متابعة التسوق',
        websiteNotFound: 'الموقع غير موجود',
        fillAllFields: 'يرجى ملء جميع الحقول المطلوبة.',
        orderSuccess: 'تم تقديم الطلب بنجاح!',
        // Dashboard translations
        dashboard: 'لوحة التحكم', totalOrders: 'إجمالي الطلبات', totalProducts: 'إجمالي المنتجات',
        totalRevenue: 'إجمالي الإيرادات', monthlyProfit: 'الربح الشهري', recentOrders: 'الطلبات الأخيرة',
        quickActions: 'إجراءات سريعة', orderDetails: 'تفاصيل الطلب',
        createWebsite: 'إنشاء موقع ويب', websiteName: 'اسم الموقع',
        create: 'إنشاء', creating: 'جاري الإنشاء...',
      },
      nl: {
        language: 'Taal', bangla: 'Bengaals', english: 'Engels',
        searchPlaceholder: 'Zoek producten...', allProducts: 'Alle Producten',
        cart: 'Winkelwagen', viewCart: 'Bekijk Winkelwagen', emptyCart: 'Je winkelwagen is leeg',
        total: 'Totaal', orderNow: 'Bestel Nu', customerInfo: 'Klantinformatie',
        name: 'Naam', phone: 'Telefoon', address: 'Adres', email: 'Email',
        placeOrder: 'Bestelling Plaatsen', cancel: 'Annuleren', orderSummary: 'Bestellingsoverzicht',
        welcome: 'Welkom', stayWithUs: 'Blijf bij ons',
        newArrivals: 'Nieuwe Aankomsten', bestSellers: 'Bestverkochte', bestSeller: 'Bestverkocht',
        addToCart: 'Toevoegen aan Winkelwagen', noProducts: 'Geen producten gevonden.',
        inStock: 'Op Voorraad', outOfStock: 'Uitverkocht', products: ' producten',
        quantity: 'Hoeveelheid', continueShopping: 'Verder Winkelen',
        websiteNotFound: 'Website niet gevonden',
        fillAllFields: 'Vul alle verplichte velden in.',
        orderSuccess: 'Bestelling succesvol geplaatst!',
      },
      tr: {
        language: 'Dil', bangla: 'Bengalce', english: 'İngilizce',
        searchPlaceholder: 'Ürün ara...', allProducts: 'Tüm Ürünler',
        cart: 'Sepet', viewCart: 'Sepeti Görüntüle', emptyCart: 'Sepetiniz boş',
        total: 'Toplam', orderNow: 'Şimdi Sipariş Ver', customerInfo: 'Müşteri Bilgileri',
        name: 'Ad', phone: 'Telefon', address: 'Adres', email: 'E-posta',
        placeOrder: 'Sipariş Ver', cancel: 'İptal', orderSummary: 'Sipariş Özeti',
        welcome: 'Hoş Geldiniz', stayWithUs: 'Bizimle kalın',
        newArrivals: 'Yeni Gelenler', bestSellers: 'En Çok Satanlar', bestSeller: 'En Çok Satan',
        addToCart: 'Sepete Ekle', noProducts: 'Ürün bulunamadı.',
        inStock: 'Stokta Var', outOfStock: 'Tükendi', products: ' ürün',
        quantity: 'Miktar', continueShopping: 'Alışverişe Devam Et',
        websiteNotFound: 'Website bulunamadı',
        fillAllFields: 'Lütfen tüm gerekli alanları doldurun.',
        orderSuccess: 'Sipariş başarıyla verildi!',
      },
    };
    
    return translations[currentLanguage]?.[key] || key;
  };

  const value: RegionContextType = {
    selectedRegion,
    setSelectedRegion,
    formatPrice,
    currentLanguage,
    setCurrentLanguage,
    getLanguage,
    t,
  };

  return (
    <RegionContext.Provider value={value}>
      {children}
    </RegionContext.Provider>
  );
}

export function useRegion(): RegionContextType {
  const context = useContext(RegionContext);
  if (!context) {
    throw new Error('useRegion must be used within a RegionProvider');
  }
  return context;
}