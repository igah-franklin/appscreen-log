export type NavLink = { label: string; href: string };

export const APP_STORE_CATEGORIES: NavLink[] = [
  { label: "Books", href: "/templates/books" },
  { label: "Business", href: "/templates/business" },
  { label: "Developer Tools", href: "/templates/developer-tools" },
  { label: "Education", href: "/templates/education" },
  { label: "Entertainment", href: "/templates/entertainment" },
  { label: "Finance", href: "/templates/finance" },
  { label: "Food & Drink", href: "/templates/food-drink" },
  { label: "Games", href: "/templates/games" },
  { label: "Graphics & Design", href: "/templates/graphics-design" },
  { label: "Health & Fitness", href: "/templates/health-fitness" },
  { label: "Lifestyle", href: "/templates/lifestyle" },
  { label: "Magazines & Newspapers", href: "/templates/magazines-newspapers" },
  { label: "Music", href: "/templates/music" },
  { label: "Navigation", href: "/templates/navigation" },
  { label: "News", href: "/templates/news" },
  { label: "Photo & Video", href: "/templates/photo-video" },
  { label: "Productivity", href: "/templates/productivity" },
  { label: "Reference", href: "/templates/reference" },
  { label: "Shopping", href: "/templates/shopping" },
  { label: "Social Networking", href: "/templates/social-networking" },
  { label: "Sports", href: "/templates/sports" },
  { label: "Travel", href: "/templates/travel" },
  { label: "Utilities", href: "/templates/utilities" },
  { label: "Weather", href: "/templates/weather" },
];

export const STORE_AND_DEVICE: NavLink[] = [
  { label: "Feature graphic templates", href: "/templates/feature-graphic" },
  {
    label: "Product Page Header templates",
    href: "/templates/app-store-product-page-header",
  },
  {
    label: "Search Results templates",
    href: "/templates/app-store-search-results",
  },
  {
    label: "Universal Creative Asset templates",
    href: "/templates/app-store-universal-creative-asset",
  },
  { label: "Mac, Desktop & Other", href: "/templates/mac-desktop-other" },
  { label: "Watch templates", href: "/templates/watch" },
  { label: "iPhone templates", href: "/templates/iphone" },
  { label: "iPad templates", href: "/templates/ipad" },
  { label: "Android phone templates", href: "/templates/android-phone" },
  { label: "Android tablet templates", href: "/templates/android-tablet" },
  { label: "App Store templates", href: "/templates/app-store" },
  { label: "Google Play templates", href: "/templates/google-play" },
  { label: "Free templates", href: "/templates/free" },
];

export type MenuItem = {
  label: string;
  href?: string;
  icon: string;
  external?: boolean;
  badge?: string;
};

export const HELP_MENU: MenuItem[] = [
  { label: "Chat with Us", icon: "message" },
  {
    label: "FAQ & Tutorials",
    href: "https://help.appscreens.com",
    icon: "question",
    external: true,
  },
  {
    label: "How to Videos",
    href: "https://www.youtube.com/@appscreens",
    icon: "video",
    external: true,
  },
  { label: "Blog & Guides", href: "/blog", icon: "rss", external: true },
  { label: "Free ASO Review", href: "/aso-review", icon: "chart" },
  { label: "Changelog", href: "/changelog", icon: "history" },
  {
    label: "Become an Affiliate",
    href: "/blog/appscreens-affiliate",
    icon: "badge",
    external: true,
  },
  { label: "About us", href: "/about", icon: "astronaut" },
  {
    label: "Email us",
    href: "mailto:hello@appscreens.com",
    icon: "at",
    external: true,
  },
];

export const ACCOUNT_MENU: MenuItem[] = [
  { label: "Create Screenshots Free", href: "/user/sandbox", icon: "shapes" },
  { label: "Register / Login", icon: "user" },
];

export const FOOTER_COLUMNS: {
  title: string;
  icon: "app" | "product" | "resources" | "legal";
  links: (NavLink & { external?: boolean; badge?: string })[];
}[] = [
  {
    title: "AppScreens",
    icon: "app",
    links: [
      { label: "Screenshot Generator", href: "/" },
      { label: "Templates", href: "/templates" },
      { label: "Pricing", href: "/pricing" },
      { label: "Try now", href: "/user/sandbox" },
      { label: "Free ASO Review", href: "/aso-review" },
    ],
  },
  {
    title: "Product",
    icon: "product",
    links: [
      { label: "Screenshot Feedback", href: "/aso-review" },
      { label: "Improve ASO", href: "/app-store-optimization-screenshots" },
      {
        label: "App Store CPP & PPO",
        href: "/app-store-ppo-and-cpp-optimization-screenshots",
      },
      { label: "Translate & Localize", href: "/localize-app-store-screenshots" },
      {
        label: "iPhone and iPad Screenshots",
        href: "/iphone-ipad-screenshot-maker",
      },
      {
        label: "Google Play Screenshots",
        href: "/google-play-screenshot-generator",
      },
      { label: "App Store Templates", href: "/app-store-screenshot-templates" },
      { label: "iOS Screenshot Sizes", href: "/app-store-screenshot-sizes" },
      {
        label: "Google Screenshot Sizes",
        href: "/google-play-screenshot-sizes",
      },
      {
        label: "Feature Graphic Generator",
        href: "/google-play-feature-graphic-generator",
      },
      { label: "AppLaunchpad Alternative", href: "/applaunchpad-alternative" },
    ],
  },
  {
    title: "Resources",
    icon: "resources",
    links: [
      { label: "About us", href: "/about" },
      { label: "Chat with us", href: "/help" },
      { label: "Blog & Guides", href: "/blog", external: true },
      { label: "Changelog", href: "/changelog" },
      { label: "Screenshot Review", href: "/aso-review" },
      {
        label: "Why ASO Matters?",
        href: "/blog/why-aso-matters-ab-test-downloads",
        external: true,
      },
      {
        label: "Why Localize?",
        href: "/blog/app-localization-download-lift",
        external: true,
      },
      {
        label: "FAQ & Tutorials",
        href: "https://help.appscreens.com/",
        external: true,
      },
      {
        label: "How to Videos",
        href: "https://www.youtube.com/@appscreens",
        external: true,
      },
      {
        label: "Affiliates",
        href: "/blog/appscreens-affiliate",
        external: true,
        badge: "50%",
      },
    ],
  },
  {
    title: "Legal",
    icon: "legal",
    links: [
      { label: "Terms", href: "/terms" },
      { label: "Privacy", href: "/privacy" },
      { label: "Licence", href: "/licence" },
    ],
  },
];
