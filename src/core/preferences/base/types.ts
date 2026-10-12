import type {
  AccessModeType,
  AuthPageLayoutType,
  BreadcrumbStyleType,
  BuiltinThemeType,
  ContentCompactType,
  DeepPartial,
  LayoutHeaderMenuAlignType,
  LayoutHeaderModeType,
  LayoutType,
  LoginExpiredModeType,
  NavigationStyleType,
  PageTransitionType,
  PreferencesButtonPositionType,
  TabsStyleType,
  ThemeModeType,
} from '#/core/shared/types/base';

type SupportedLanguagesType = 'en-US' | 'zh-CN';

interface AppPreferences {
  accessMode: AccessModeType;
  authPageLayout: AuthPageLayoutType;
  checkUpdatesInterval: number;
  colorGrayMode: boolean;
  colorWeakMode: boolean;
  compact: boolean;
  contentCompact: ContentCompactType;
  contentCompactWidth: number;
  contentPadding: number;
  contentPaddingBottom: number;
  contentPaddingLeft: number;
  contentPaddingRight: number;
  contentPaddingTop: number;
  defaultAvatar: string;
  defaultHomePath: string;
  dynamicTitle: boolean;
  enableCheckUpdates: boolean;
  enableCopyPreferences: boolean;
  enablePreferences: boolean;
  enableRefreshToken: boolean;
  enableStickyPreferencesNavigationBar: boolean;
  isMobile: boolean;
  layout: LayoutType;
  locale: SupportedLanguagesType;
  loginExpiredMode: LoginExpiredModeType;
  name: string;
  preferencesButtonPosition: PreferencesButtonPositionType;
  timezone: string;
  watermark: boolean;
  watermarkContent: string;
  zIndex: number;
}

interface BreadcrumbPreferences {
  enable: boolean;
  hideOnlyOne: boolean;
  showHome: boolean;
  showIcon: boolean;
  styleType: BreadcrumbStyleType;
}

interface CopyrightPreferences {
  companyName: string;
  companySiteLink: string;
  date: string;
  enable: boolean;
  icp: string;
  icpLink: string;
  settingShow: boolean;
}

interface FooterPreferences {
  enable: boolean;
  fixed: boolean;
  height: number;
}

interface HeaderPreferences {
  enable: boolean;
  height: number;
  hidden: boolean;
  menuAlign: LayoutHeaderMenuAlignType;
  mode: LayoutHeaderModeType;
}

interface LogoPreferences {
  enable: boolean;
  fit: string;
  source: string;
  sourceDark?: string;
}

interface NavigationPreferences {
  accordion: boolean;
  split: boolean;
  styleType: NavigationStyleType;
}

interface ShortcutKeyPreferences {
  enable: boolean;
  globalLockScreen: boolean;
  globalLogout: boolean;
  globalPreferences: boolean;
  globalSearch: boolean;
}

interface SidebarPreferences {
  autoActivateChild: boolean;
  collapsed: boolean;
  collapsedButton: boolean;
  collapsedShowTitle: boolean;
  collapseWidth: number;
  draggable: boolean;
  enable: boolean;
  expandOnHover: boolean;
  extraCollapse: boolean;
  extraCollapsedWidth: number;
  fixedButton: boolean;
  hidden: boolean;
  mixedWidth: number;
  width: number;
}

interface TabbarPreferences {
  draggable: boolean;
  enable: boolean;
  height: number;
  keepAlive: boolean;
  maxCount: number;
  middleClickToClose: boolean;
  persist: boolean;
  showIcon: boolean;
  showMaximize: boolean;
  showMore: boolean;
  showRefresh: boolean;
  styleType: TabsStyleType;
  visitHistory: boolean;
  wheelable: boolean;
}

interface ThemePreferences {
  builtinType: BuiltinThemeType;
  colorDestructive: string;
  colorPrimary: string;
  colorSuccess: string;
  colorWarning: string;
  mode: ThemeModeType;
  radius: string;
  fontSize: number;
  semiDarkHeader: boolean;
  semiDarkSidebar: boolean;
  semiDarkSidebarSub: boolean;
}

interface TransitionPreferences {
  enable: boolean;
  loading: boolean;
  name: PageTransitionType | string;
  progress: boolean;
}

interface WidgetPreferences {
  fullscreen: boolean;
  globalSearch: boolean;
  languageToggle: boolean;
  lockScreen: boolean;
  notification: boolean;
  refresh: boolean;
  sidebarToggle: boolean;
  themeToggle: boolean;
  timezone: boolean;
}

interface Preferences {
  app: AppPreferences;
  breadcrumb: BreadcrumbPreferences;
  copyright: CopyrightPreferences;
  footer: FooterPreferences;
  header: HeaderPreferences;
  logo: LogoPreferences;
  navigation: NavigationPreferences;
  shortcutKeys: ShortcutKeyPreferences;
  sidebar: SidebarPreferences;
  tabbar: TabbarPreferences;
  theme: ThemePreferences;
  transition: TransitionPreferences;
  widget: WidgetPreferences;
}

type CustomPreferencesRecord = Record<string, any>;

interface CustomPreferencesField {
  key: string;
  component: 'input' | 'number' | 'select' | 'switch' | string;
  defaultValue: any;
  componentProps?: Record<string, any>;
  options?: Array<{ label: string; value: any }>;
}

interface PreferencesExtension<T = CustomPreferencesRecord> {
  fields: CustomPreferencesField[];
  [key: string]: any;
}

interface InitialOptions<T = CustomPreferencesRecord> {
  namespace: string;
  overrides?: DeepPartial<Preferences>;
  extension?: PreferencesExtension<T> | null;
}

export type {
  CustomPreferencesField,
  CustomPreferencesRecord,
  DeepPartial,
  InitialOptions,
  Preferences,
  PreferencesExtension,
  SupportedLanguagesType,
};
