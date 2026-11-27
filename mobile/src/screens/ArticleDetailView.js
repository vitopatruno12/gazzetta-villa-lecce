import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { apiGet, resolveMediaUrl } from '../api';
import SmartImage from '../components/SmartImage';
import { COLORS, SANS, SERIF } from '../theme';

const URL_REGEX = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi;

function parseGallery(galleryUrls, coverUrl) {
  if (!galleryUrls) return [];
  try {
    const arr = JSON.parse(galleryUrls);
    return Array.isArray(arr) ? arr.filter((u) => u && u !== coverUrl) : [];
  } catch {
    return [];
  }
}

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

function LinkedBody({ text }) {
  if (!text) return null;
  const parts = String(text).split(URL_REGEX);
  return (
    <Text style={styles.bodyText}>
      {parts.map((part, idx) => {
        if (/^(https?:\/\/|www\.)/i.test(part)) {
          const clean = part.replace(/[.,;)]+$/, '');
          const trailing = part.slice(clean.length);
          const href = /^https?:\/\//i.test(clean) ? clean : `https://${clean}`;
          return (
            <React.Fragment key={idx}>
              <Text
                style={styles.extLink}
                onPress={() => Linking.openURL(href).catch(() => {})}
              >
                {clean}
              </Text>
              {trailing}
            </React.Fragment>
          );
        }
        return <React.Fragment key={idx}>{part}</React.Fragment>;
      })}
    </Text>
  );
}

export default function ArticleDetailView({ slug, onBack }) {
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError('');
    apiGet(`/api/articles/slug/${encodeURIComponent(slug)}`)
      .then((data) => {
        if (alive) setArticle(data);
      })
      .catch((e) => {
        if (alive) setError(e.message);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.ink} />
      </View>
    );
  }

  if (error || !article) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error || 'Articolo non trovato'}</Text>
        <Pressable style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backBtnText}>← Torna indietro</Text>
        </Pressable>
      </View>
    );
  }

  const coverUri = resolveMediaUrl(article.cover_url);
  const gallery = parseGallery(article.gallery_urls, article.cover_url);
  const startLabel = formatDate(article.event_start);
  const endLabel = formatDate(article.event_end);
  const dateRange =
    startLabel && endLabel && startLabel !== endLabel ? `${startLabel} – ${endLabel}` : startLabel;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Pressable style={styles.backBtn} onPress={onBack}>
        <Text style={styles.backBtnText}>
          ← {article.type === 'evento' ? 'Torna agli eventi' : 'Torna indietro'}
        </Text>
      </Pressable>

      <View style={styles.metaRow}>
        <Text style={styles.badgeType}>{article.type}</Text>
        {article.type !== 'evento' && article.published_at ? (
          <Text style={styles.metaDate}>{formatDate(article.published_at)}</Text>
        ) : null}
      </View>

      <Text style={styles.title}>{article.title}</Text>
      {article.subtitle ? <Text style={styles.subtitle}>{article.subtitle}</Text> : null}

      {dateRange || article.location ? (
        <Text style={styles.whenWhere}>
          {[dateRange, article.location].filter(Boolean).join(' · ')}
        </Text>
      ) : null}

      {coverUri ? (
        <SmartImage
          uri={coverUri}
          minRatio={0.5}
          maxRatio={2.4}
          style={styles.coverImage}
        />
      ) : null}

      {article.video_url ? (
        <Pressable
          style={styles.videoButton}
          onPress={() => {
            const target = resolveMediaUrl(article.video_url);
            if (target) Linking.openURL(target).catch(() => {});
          }}
        >
          <Text style={styles.videoButtonText}>▶ Guarda il video completo</Text>
        </Pressable>
      ) : null}

      <LinkedBody text={article.body} />

      {gallery.length > 0 ? (
        <View style={styles.galleryWrap}>
          <Text style={styles.galleryHeading}>Galleria e schede</Text>
          <View style={styles.galleryStack}>
            {gallery.map((src) => {
              const uri = resolveMediaUrl(src);
              return (
                <Pressable
                  key={src}
                  style={styles.galleryItemWrap}
                  onPress={() => uri && Linking.openURL(uri).catch(() => {})}
                >
                  <SmartImage uri={uri} minRatio={0.65} maxRatio={2.5} />
                </Pressable>
              );
            })}
          </View>
        </View>
      ) : null}

      <Pressable style={[styles.backBtn, { marginTop: 22 }]} onPress={onBack}>
        <Text style={styles.backBtnText}>← Torna indietro</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 14,
    paddingBottom: 38,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorText: {
    fontFamily: SANS,
    color: COLORS.red,
    marginBottom: 12,
    textAlign: 'center',
  },
  backBtn: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: COLORS.ink,
    paddingVertical: 6,
    paddingHorizontal: 11,
    marginBottom: 12,
  },
  backBtnText: {
    fontFamily: SANS,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: COLORS.ink,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  badgeType: {
    borderWidth: 1,
    borderColor: COLORS.red,
    color: COLORS.red,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  metaDate: {
    fontSize: 11,
    color: COLORS.muted,
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: SERIF,
    fontSize: 23,
    fontWeight: '700',
    color: COLORS.ink,
    lineHeight: 29,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: SERIF,
    fontStyle: 'italic',
    fontSize: 16,
    color: COLORS.muted,
    lineHeight: 22,
    marginBottom: 8,
  },
  whenWhere: {
    fontFamily: SANS,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.red,
    marginBottom: 12,
  },
  coverImage: {
    marginBottom: 14,
  },
  videoButton: {
    backgroundColor: COLORS.red,
    paddingVertical: 11,
    paddingHorizontal: 14,
    alignItems: 'center',
    marginBottom: 14,
  },
  videoButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  bodyText: {
    fontFamily: SERIF,
    fontSize: 17,
    lineHeight: 27,
    color: COLORS.ink,
  },
  extLink: {
    color: COLORS.blue,
    textDecorationLine: 'underline',
  },
  galleryWrap: {
    marginTop: 22,
    borderTopWidth: 1,
    borderTopColor: COLORS.rule,
    paddingTop: 14,
  },
  galleryHeading: {
    fontFamily: SERIF,
    fontSize: 15,
    fontWeight: '700',
    textTransform: 'uppercase',
    color: COLORS.ink,
    marginBottom: 12,
  },
  galleryStack: {
    gap: 12,
  },
  galleryItemWrap: {
    width: '100%',
  },
});
