import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  ActivityIndicator,
  Image,
  Linking,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { API_BASE_URL, apiGet, fetchLecceWeather, resolveMediaUrl } from './src/api';
import {
  EVENT_CALENDARS,
  EVENT_CATEGORIES,
  categoryLabelOf,
  entryMatchesCategory,
  matchesEventCategory,
} from './src/calendarData';
import MobileSideMenu from './src/components/MobileSideMenu';
import SmartImage from './src/components/SmartImage';
import AccountView from './src/screens/AccountView';
import ArticleDetailView from './src/screens/ArticleDetailView';
import ProjectView from './src/screens/ProjectView';
import { COLORS, SANS, SERIF } from './src/theme';

const LOGO_IMG = require('./assets/logo-villa-comunale.png');
const NATALE_SLUG = 'un-natale-in-villa';

const TOP_NAV_ITEMS = [
  { id: 'home', label: 'Home' },
  { id: 'progetto', label: 'Il progetto' },
  { id: 'cronaca', label: 'Cronaca' },
  { id: 'eventi', label: 'Eventi' },
  { id: 'partner', label: 'Partner' },
];

function formatDate(value) {
  if (!value) return '';
  try {
    return new Date(value).toLocaleDateString('it-IT', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return String(value).slice(0, 10);
  }
}

function todayHeader() {
  try {
    return new Date().toLocaleDateString('it-IT', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return 'Lecce';
  }
}

export default function App() {
  return (
    <SafeAreaProvider>
      <VillaAppContent />
    </SafeAreaProvider>
  );
}

function VillaAppContent() {
  const [activeTab, setActiveTab] = useState('home');
  const [accountMode, setAccountMode] = useState('login');
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedSlug, setSelectedSlug] = useState(null);
  const [eventCategory, setEventCategory] = useState('tutti');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [articles, setArticles] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [session, setSession] = useState(null);

  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError('');
    try {
      const [artRows, compRows] = await Promise.all([
        apiGet('/api/articles?limit=50'),
        apiGet('/api/companies').catch(() => []),
      ]);
      setArticles(Array.isArray(artRows) ? artRows : []);
      setCompanies(Array.isArray(compRows) ? compRows.filter((c) => c.logo_url) : []);
    } catch (e) {
      setError(`${e.message} (${API_BASE_URL})`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData(false);
    fetchLecceWeather()
      .then(setWeather)
      .catch(() => {});
  }, [loadData]);

  const openArticle = useCallback((slug) => {
    if (slug) setSelectedSlug(slug);
  }, []);

  const switchTab = useCallback((tabId) => {
    setSelectedSlug(null);
    setSearchOpen(false);
    setActiveTab(tabId);
  }, []);

  const openAccount = useCallback((mode = 'login') => {
    setAccountMode(mode);
    setSelectedSlug(null);
    setSearchOpen(false);
    setActiveTab('account');
  }, []);

  const selectCategoryFromMenu = useCallback((catId) => {
    setEventCategory(catId || 'tutti');
    setSelectedSlug(null);
    setSearchOpen(false);
    setActiveTab('eventi');
  }, []);

  const spotlight = useMemo(
    () => articles.find((a) => a.slug === NATALE_SLUG),
    [articles]
  );
  const newsHero = useMemo(
    () => articles.find((a) => a.type === 'notizia') || articles.find((a) => a.slug !== NATALE_SLUG),
    [articles]
  );
  const cronacaList = useMemo(
    () => articles.filter((a) => a.type === 'notizia'),
    [articles]
  );
  const eventsList = useMemo(
    () =>
      articles
        .filter((a) => a.type === 'evento')
        .filter((a) => matchesEventCategory(a.slug, eventCategory)),
    [articles, eventCategory]
  );
  const filteredCalendars = useMemo(
    () =>
      EVENT_CALENDARS.map((block) => ({
        ...block,
        entries: block.entries.filter((entry) => entryMatchesCategory(entry, eventCategory)),
      })).filter((b) => b.entries.length > 0),
    [eventCategory]
  );
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return articles.filter(
      (a) =>
        (a.title || '').toLowerCase().includes(q) ||
        (a.subtitle || '').toLowerCase().includes(q) ||
        (a.location || '').toLowerCase().includes(q)
    );
  }, [articles, searchQuery]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar style="light" backgroundColor={COLORS.ink} />

      {/* Top Black Bar with Hamburger Menu */}
      <View style={styles.topBar}>
        <View style={styles.topBarLeft}>
          <Pressable
            style={styles.burgerBtn}
            onPress={() => setMenuOpen(true)}
            accessibilityLabel="Apri menu"
          >
            <View style={styles.burgerLine} />
            <View style={styles.burgerLine} />
            <View style={styles.burgerLine} />
          </Pressable>
          <Text style={styles.topBarPlace} numberOfLines={1} maxFontSizeMultiplier={1.1}>
            {todayHeader()} · LECCE
          </Text>
        </View>

        <View style={styles.topBarActions}>
          <Pressable
            onPress={() => setSearchOpen((v) => !v)}
            style={styles.topBarBtn}
          >
            <Text style={styles.topBarBtnText} maxFontSizeMultiplier={1.1}>
              {searchOpen ? 'Chiudi' : '🔍'}
            </Text>
          </Pressable>
          <Pressable onPress={() => openAccount('login')} style={styles.topBarBtn}>
            <Text style={styles.topBarBtnText} numberOfLines={1} maxFontSizeMultiplier={1.1}>
              {session?.user ? session.user.first_name || 'Profilo' : 'Login'}
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Search Bar */}
      {searchOpen ? (
        <View style={styles.searchStrip}>
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Cerca eventi, mercatini, yoga, concerti..."
            placeholderTextColor={COLORS.muted}
            autoFocus
          />
        </View>
      ) : null}

      {/* Masthead */}
      <Pressable
        style={styles.masthead}
        onPress={() => {
          setSearchQuery('');
          switchTab('home');
        }}
      >
        <View style={styles.mastheadRow}>
          <Text
            style={[styles.mastheadTitle, styles.mastheadTitleLeft]}
            numberOfLines={1}
            adjustsFontSizeToFit
            maxFontSizeMultiplier={1.08}
          >
            LA VILLA
          </Text>
          <Image source={LOGO_IMG} style={styles.mastheadLogo} />
          <Text
            style={[styles.mastheadTitle, styles.mastheadTitleRight]}
            numberOfLines={1}
            adjustsFontSizeToFit
            maxFontSizeMultiplier={1.08}
          >
            COMUNALE
          </Text>
        </View>
        <View style={styles.mastheadRule} />
        <Text style={styles.tagline} maxFontSizeMultiplier={1.1}>
          Notizie · Eventi · Vita cittadina
        </Text>
        {weather ? (
          <View style={styles.weatherRow}>
            <View style={styles.weatherLine} />
            <Text style={styles.weatherText} numberOfLines={1} maxFontSizeMultiplier={1.08}>
              <Text style={{ fontWeight: '700', color: COLORS.ink }}>{weather.temp}° </Text>
              Lecce - {weather.label} · min {weather.min}° max {weather.max}°
            </Text>
            <View style={styles.weatherLine} />
          </View>
        ) : null}
      </Pressable>

      {/* Top Horizontal Section Bar */}
      <View style={styles.topNavBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.topNavContent}
        >
          {TOP_NAV_ITEMS.map((item) => {
            const active = !selectedSlug && activeTab === item.id;
            return (
              <Pressable
                key={item.id}
                style={[styles.topNavItem, active && styles.topNavItemActive]}
                onPress={() => switchTab(item.id)}
              >
                <Text
                  style={[styles.topNavLabel, active && styles.topNavLabelActive]}
                  numberOfLines={1}
                  maxFontSizeMultiplier={1.12}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Slide-out Hamburger Menu */}
      <MobileSideMenu
        open={menuOpen}
        activeTab={activeTab}
        session={session}
        onClose={() => setMenuOpen(false)}
        onSelectTab={switchTab}
        onSelectEventCategory={selectCategoryFromMenu}
        onOpenAccount={openAccount}
      />

      {/* Main Content */}
      <View style={styles.bodyFrame}>
        {selectedSlug ? (
          <ArticleDetailView
            slug={selectedSlug}
            onBack={() => setSelectedSlug(null)}
          />
        ) : searchOpen && searchQuery.trim().length > 0 ? (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Text style={styles.sectionHead}>
              Risultati per «{searchQuery.trim()}» ({searchResults.length})
            </Text>
            {searchResults.length === 0 ? (
              <Text style={styles.mutedText}>Nessun contenuto trovato.</Text>
            ) : (
              searchResults.map((item) => (
                <ArticleCard key={item.id} item={item} onPress={() => openArticle(item.slug)} />
              ))
            )}
          </ScrollView>
        ) : activeTab === 'progetto' ? (
          <ProjectView onOpenArticle={openArticle} />
        ) : activeTab === 'account' ? (
          <AccountView
            session={session}
            initialMode={accountMode}
            onLoginSuccess={(s) => setSession(s)}
            onLogout={() => setSession(null)}
          />
        ) : loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={COLORS.ink} />
          </View>
        ) : error ? (
          <View style={styles.centered}>
            <Text style={styles.errorText}>Connessione API non riuscita: {error}</Text>
            <Text style={styles.mutedText}>
              Assicurati che il backend sia avviato (`npm run dev`).
            </Text>
            <Pressable style={styles.retryBtn} onPress={() => loadData(false)}>
              <Text style={styles.retryBtnText}>Riprova</Text>
            </Pressable>
          </View>
        ) : activeTab === 'partner' ? (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={() => loadData(true)} />
            }
          >
            <Text style={styles.sectionHead}>Partner e Attività Locali</Text>
            <Text style={[styles.mutedText, { textAlign: 'left', marginBottom: 14 }]}>
              Spazi pubblicitari e collaborazioni con aziende del territorio.
            </Text>
            <SponsorGrid companies={companies} onOpenArticle={openArticle} showName />
          </ScrollView>
        ) : activeTab === 'eventi' ? (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={() => loadData(true)} />
            }
          >
            <Text style={styles.sectionHead}>Eventi e Calendari</Text>

            {/* Category filter chips */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.catChipsRow}
            >
              {EVENT_CATEGORIES.map((cat) => {
                const active = eventCategory === cat.id;
                return (
                  <Pressable
                    key={cat.id}
                    style={[styles.catChip, active && styles.catChipActive]}
                    onPress={() => setEventCategory(cat.id)}
                  >
                    <Text style={[styles.catChipText, active && styles.catChipTextActive]}>
                      {cat.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            {/* Official Calendars */}
            <Text style={styles.kicker}>Il calendario ufficiale · Dic 2026 – Feb 2027</Text>
            {filteredCalendars.map((block) => (
              <View key={block.id} style={styles.calCard}>
                <View style={styles.calHeader}>
                  <Text style={styles.calHeaderTitle}>{block.period}</Text>
                </View>
                {block.entries.map((entry, idx) => (
                  <Pressable
                    key={`${block.id}-${idx}`}
                    style={[
                      styles.calRow,
                      idx === block.entries.length - 1 && { borderBottomWidth: 0 },
                    ]}
                    onPress={() => entry.slug && openArticle(entry.slug)}
                  >
                    <View style={styles.calTopLine}>
                      <Text style={styles.calDates}>{entry.dates}</Text>
                      <Text style={styles.calPill}>{categoryLabelOf(entry.category)}</Text>
                    </View>
                    <Text style={styles.calTitle}>{entry.title}</Text>
                    {entry.detail ? <Text style={styles.calDetail}>{entry.detail}</Text> : null}
                  </Pressable>
                ))}
              </View>
            ))}

            <Text style={styles.sectionHead}>
              {eventCategory === 'tutti'
                ? 'Tutte le schede eventi'
                : `Schede · ${categoryLabelOf(eventCategory)}`}
            </Text>
            {eventsList.map((item) => (
              <ArticleCard key={item.id} item={item} onPress={() => openArticle(item.slug)} />
            ))}
          </ScrollView>
        ) : activeTab === 'cronaca' ? (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={() => loadData(true)} />
            }
          >
            <Text style={styles.sectionHead}>Cronaca e Notizie</Text>
            {cronacaList.map((item) => (
              <ArticleCard key={item.id} item={item} onPress={() => openArticle(item.slug)} />
            ))}
          </ScrollView>
        ) : (
          /* HOME TAB */
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={() => loadData(true)} />
            }
          >
            {/* Natale in Villa Spotlight — full-width poster, zero white space, wrapped buttons */}
            {spotlight ? (
              <View style={styles.spotlightCard}>
                {spotlight.cover_url ? (
                  <Pressable onPress={() => openArticle(spotlight.slug)}>
                    <SmartImage
                      uri={resolveMediaUrl(spotlight.cover_url)}
                      defaultRatio={1322 / 1868}
                      minRatio={0.68}
                      maxRatio={1.2}
                      bordered={false}
                      style={styles.spotlightPosterWrap}
                    />
                  </Pressable>
                ) : null}
                <View style={styles.spotlightCopy}>
                  <Text style={styles.kicker}>In evidenza · Dicembre 2026 – Febbraio 2027</Text>
                  <Pressable onPress={() => openArticle(spotlight.slug)}>
                    <Text style={styles.spotlightTitle}>{spotlight.title}</Text>
                  </Pressable>
                  <Text style={styles.spotlightText}>
                    Mercatini dell’artigianato salentino, Villa Lab per bambini, concerti, rapaci,
                    Yoga con Cristiana Vergari e Lecce Comic.
                  </Text>
                  <View style={styles.spotlightLinks}>
                    <Pressable
                      style={styles.spotlightActionBtn}
                      onPress={() => openArticle(spotlight.slug)}
                    >
                      <Text style={styles.spotlightActionText}>Scopri il programma →</Text>
                    </Pressable>
                    <Pressable
                      style={styles.spotlightActionOutline}
                      onPress={() => switchTab('eventi')}
                    >
                      <Text style={styles.spotlightActionOutlineText}>Vai ai calendari →</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            ) : null}

            {/* Main News Hero */}
            {newsHero ? (
              <Pressable
                style={styles.heroCard}
                onPress={() => openArticle(newsHero.slug)}
              >
                <Text style={styles.kicker}>{newsHero.type}</Text>
                <Text style={styles.heroTitle}>{newsHero.title}</Text>
                {newsHero.subtitle ? (
                  <Text style={styles.heroDeck}>{newsHero.subtitle}</Text>
                ) : null}
                {newsHero.cover_url ? (
                  <SmartImage
                    uri={resolveMediaUrl(newsHero.cover_url)}
                    style={{ marginBottom: 10 }}
                  />
                ) : null}
                {newsHero.video_url ? (
                  <Pressable
                    style={styles.videoStripBtn}
                    onPress={() => Linking.openURL(newsHero.video_url).catch(() => {})}
                  >
                    <Text style={styles.videoStripText}>▶ Guarda il servizio video TeleRama</Text>
                  </Pressable>
                ) : null}
              </Pressable>
            ) : null}

            {/* Sponsor Banners — 2-column full-bleed logos without white padding */}
            {companies.length > 0 ? (
              <View style={styles.sponsorsSection}>
                <Text style={styles.sectionHead}>Pubblicità e Partner</Text>
                <SponsorGrid companies={companies} onOpenArticle={openArticle} />
              </View>
            ) : null}

            {/* Featured Events on Home */}
            <Text style={styles.sectionHead}>Eventi in Villa</Text>
            {articles
              .filter((a) => a.type === 'evento' && a.slug !== NATALE_SLUG)
              .slice(0, 6)
              .map((item) => (
                <ArticleCard key={item.id} item={item} onPress={() => openArticle(item.slug)} />
              ))}
            <Pressable style={styles.allEventsBtn} onPress={() => switchTab('eventi')}>
              <Text style={styles.allEventsBtnText}>Vedi tutti gli eventi e i calendari →</Text>
            </Pressable>

            {/* Cronaca on Home */}
            <Text style={styles.sectionHead}>Cronaca</Text>
            {cronacaList.slice(0, 4).map((item) => (
              <ArticleCard key={item.id} item={item} onPress={() => openArticle(item.slug)} />
            ))}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

function SponsorGrid({ companies, onOpenArticle, showName = false }) {
  return (
    <View style={styles.partnerGrid}>
      {companies.map((c) => (
        <Pressable
          key={c.id}
          style={styles.partnerCard}
          onPress={() => {
            if (c.slug === 'quarta-caffe') {
              onOpenArticle('stefania-quarta-casa-quarta');
            } else if (c.slug === 'cristiana-vergari-academy') {
              onOpenArticle('cristiana-vergari-yoga-villa-comunale');
            } else if (c.website) {
              Linking.openURL(c.website).catch(() => {});
            }
          }}
        >
          <SmartImage
            uri={resolveMediaUrl(c.logo_url)}
            defaultRatio={c.slug === 'quarta-caffe' ? 1.55 : 1}
            minRatio={0.85}
            maxRatio={1.65}
            bordered={false}
          />
          {showName ? (
            <View style={styles.partnerCaption}>
              <Text style={styles.partnerCardName}>{c.name}</Text>
              {c.city ? <Text style={styles.partnerCardCity}>{c.city}</Text> : null}
            </View>
          ) : null}
        </Pressable>
      ))}
    </View>
  );
}

function ArticleCard({ item, onPress }) {
  const thumbUri = resolveMediaUrl(item.cover_url);
  const subDate =
    item.type === 'evento'
      ? formatDate(item.event_start) || item.location || ''
      : formatDate(item.published_at);

  return (
    <Pressable style={styles.articleCard} onPress={onPress}>
      {thumbUri ? (
        <SmartImage
          uri={thumbUri}
          minRatio={0.68}
          maxRatio={2.4}
          style={styles.cardImage}
        />
      ) : null}
      <View style={styles.cardBody}>
        <Text style={styles.badgeSmall}>{item.type}</Text>
        <Text style={styles.cardTitle}>{item.title}</Text>
        {item.subtitle ? <Text style={styles.cardSubtitle}>{item.subtitle}</Text> : null}
        {item.body ? (
          <Text style={styles.cardExcerpt} numberOfLines={5}>
            {String(item.body).replace(/\s+/g, ' ').trim()}
          </Text>
        ) : null}
        {subDate ? <Text style={styles.cardMeta}>{subDate}</Text> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.paper,
  },
  topBar: {
    backgroundColor: COLORS.ink,
    paddingHorizontal: 10,
    paddingVertical: 7,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    minWidth: 0,
  },
  burgerBtn: {
    width: 32,
    height: 30,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    flexShrink: 0,
  },
  burgerLine: {
    width: 16,
    height: 1.8,
    backgroundColor: '#ffffff',
  },
  topBarPlace: {
    color: '#ffffff',
    fontFamily: SANS,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    flexShrink: 1,
  },
  topBarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexShrink: 0,
  },
  topBarBtn: {
    paddingVertical: 2,
  },
  topBarBtnText: {
    color: '#ffffff',
    fontFamily: SANS,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  searchStrip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: COLORS.paperSoft,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.rule,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: COLORS.ink,
    backgroundColor: '#ffffff',
    paddingHorizontal: 10,
    paddingVertical: 7,
    fontSize: 14,
    color: COLORS.ink,
  },
  masthead: {
    paddingHorizontal: 10,
    paddingTop: 9,
    paddingBottom: 7,
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  mastheadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    gap: 8,
  },
  mastheadTitle: {
    flex: 1,
    fontFamily: SERIF,
    fontSize: 19,
    fontWeight: '700',
    color: COLORS.ink,
    letterSpacing: 0.2,
  },
  mastheadTitleLeft: {
    textAlign: 'right',
  },
  mastheadTitleRight: {
    textAlign: 'left',
  },
  mastheadLogo: {
    width: 44,
    height: 44,
    flexShrink: 0,
  },
  mastheadRule: {
    width: '94%',
    height: 1.5,
    backgroundColor: COLORS.ink,
    marginTop: 5,
  },
  tagline: {
    fontFamily: SANS,
    fontSize: 9.5,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: COLORS.muted,
    marginTop: 4,
  },
  weatherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '94%',
    marginTop: 4,
    gap: 6,
  },
  weatherLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#c2b9ac',
  },
  weatherText: {
    fontFamily: SANS,
    fontSize: 10.5,
    color: COLORS.muted,
    flexShrink: 1,
  },
  topNavBar: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.rule,
    backgroundColor: '#ffffff',
  },
  topNavContent: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 4,
    alignItems: 'center',
  },
  topNavItem: {
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  topNavItemActive: {
    borderColor: COLORS.rule,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.red,
  },
  topNavLabel: {
    fontFamily: SERIF,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.ink,
  },
  topNavLabelActive: {
    color: COLORS.red,
    fontWeight: '700',
  },
  bodyFrame: {
    flex: 1,
    marginHorizontal: 8,
    marginTop: 6,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.ink,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    padding: 12,
    paddingBottom: 34,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorText: {
    color: COLORS.red,
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 6,
  },
  mutedText: {
    color: COLORS.muted,
    textAlign: 'center',
    fontSize: 13,
  },
  retryBtn: {
    marginTop: 12,
    backgroundColor: COLORS.ink,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  retryBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  kicker: {
    fontFamily: SANS,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.9,
    textTransform: 'uppercase',
    color: COLORS.red,
    marginBottom: 4,
  },
  sectionHead: {
    fontFamily: SERIF,
    fontSize: 15,
    fontWeight: '700',
    textTransform: 'uppercase',
    color: COLORS.ink,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#9a9084',
    paddingVertical: 7,
    marginTop: 8,
    marginBottom: 12,
  },
  spotlightCard: {
    borderWidth: 1,
    borderColor: COLORS.ink,
    marginBottom: 16,
    backgroundColor: '#ffffff',
    overflow: 'hidden',
  },
  spotlightPosterWrap: {
    backgroundColor: '#0d3322',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.ink,
  },
  spotlightCopy: {
    padding: 12,
    minWidth: 0,
  },
  spotlightTitle: {
    fontFamily: SERIF,
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.ink,
    marginBottom: 5,
  },
  spotlightText: {
    fontFamily: SANS,
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.ink,
    marginBottom: 12,
  },
  spotlightLinks: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  spotlightActionBtn: {
    backgroundColor: COLORS.ink,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  spotlightActionText: {
    fontFamily: SANS,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: '#ffffff',
  },
  spotlightActionOutline: {
    borderWidth: 1,
    borderColor: COLORS.ink,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  spotlightActionOutlineText: {
    fontFamily: SANS,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: COLORS.ink,
  },
  heroCard: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.rule,
    paddingBottom: 14,
    marginBottom: 14,
  },
  heroTitle: {
    fontFamily: SERIF,
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.ink,
    lineHeight: 27,
    marginBottom: 5,
  },
  heroDeck: {
    fontFamily: SERIF,
    fontStyle: 'italic',
    fontSize: 15,
    color: COLORS.muted,
    marginBottom: 8,
  },
  videoStripBtn: {
    backgroundColor: COLORS.ink,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  videoStripText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  sponsorsSection: {
    marginBottom: 12,
  },
  partnerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
  },
  partnerCard: {
    width: '48.5%',
    borderWidth: 1,
    borderColor: COLORS.rule,
    backgroundColor: '#ffffff',
    overflow: 'hidden',
    justifyContent: 'center',
  },
  partnerCaption: {
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.rule,
    alignItems: 'center',
  },
  partnerCardName: {
    fontFamily: SERIF,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.ink,
    textAlign: 'center',
  },
  partnerCardCity: {
    fontFamily: SANS,
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 2,
  },
  articleCard: {
    paddingBottom: 14,
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.rule,
  },
  cardImage: {
    marginBottom: 9,
  },
  cardBody: {
    width: '100%',
    minWidth: 0,
  },
  badgeSmall: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: COLORS.red,
    color: COLORS.red,
    fontSize: 9.5,
    fontWeight: '700',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    marginBottom: 5,
  },
  cardTitle: {
    fontFamily: SERIF,
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.ink,
    lineHeight: 23,
  },
  cardSubtitle: {
    fontFamily: SERIF,
    fontStyle: 'italic',
    fontSize: 14,
    color: COLORS.muted,
    marginTop: 4,
    lineHeight: 19,
  },
  cardExcerpt: {
    fontFamily: SERIF,
    fontSize: 14.5,
    color: COLORS.ink,
    marginTop: 6,
    lineHeight: 21,
  },
  cardMeta: {
    fontFamily: SANS,
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.red,
    marginTop: 5,
  },
  allEventsBtn: {
    borderWidth: 1,
    borderColor: COLORS.ink,
    paddingVertical: 11,
    paddingHorizontal: 10,
    alignItems: 'center',
    marginBottom: 14,
  },
  allEventsBtnText: {
    fontFamily: SANS,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    color: COLORS.ink,
    textAlign: 'center',
  },
  catChipsRow: {
    gap: 7,
    paddingBottom: 12,
  },
  catChip: {
    borderWidth: 1,
    borderColor: COLORS.ink,
    paddingHorizontal: 11,
    paddingVertical: 6,
    backgroundColor: '#ffffff',
  },
  catChipActive: {
    backgroundColor: COLORS.red,
    borderColor: COLORS.red,
  },
  catChipText: {
    fontFamily: SANS,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    color: COLORS.ink,
  },
  catChipTextActive: {
    color: '#ffffff',
  },
  calCard: {
    borderWidth: 1,
    borderColor: COLORS.rule,
    marginBottom: 12,
    backgroundColor: '#ffffff',
  },
  calHeader: {
    backgroundColor: COLORS.ink,
    paddingVertical: 7,
    paddingHorizontal: 10,
  },
  calHeaderTitle: {
    fontFamily: SERIF,
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    color: '#ffffff',
  },
  calRow: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.rule,
    minWidth: 0,
  },
  calTopLine: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
    marginBottom: 4,
  },
  calDates: {
    fontFamily: SANS,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    color: COLORS.red,
  },
  calPill: {
    borderWidth: 1,
    borderColor: COLORS.rule,
    backgroundColor: COLORS.paperSoft,
    paddingHorizontal: 6,
    paddingVertical: 1,
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    color: COLORS.ink,
  },
  calTitle: {
    fontFamily: SERIF,
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.ink,
    lineHeight: 20,
  },
  calDetail: {
    fontFamily: SANS,
    fontSize: 12.5,
    color: COLORS.muted,
    marginTop: 2,
    lineHeight: 17,
  },
});
