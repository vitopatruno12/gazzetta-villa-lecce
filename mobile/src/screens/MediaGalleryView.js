import React, { useMemo, useState } from 'react';
import {
  Image,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { resolveMediaUrl } from '../api';
import { EVENT_CATEGORIES, SLUG_CATEGORIES, categoryLabelOf } from '../calendarData';
import SmartImage from '../components/SmartImage';
import { COLORS, SANS, SERIF } from '../theme';

const MEDIA_FILTERS = [
  { id: 'tutti', label: 'Tutto' },
  { id: 'video', label: '▶ Video' },
  ...EVENT_CATEGORIES.filter((c) => c.id !== 'tutti'),
];

function parseGallery(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.filter(Boolean);
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
  } catch {
    return [];
  }
}

export default function MediaGalleryView({
  articles = [],
  activeCategory = 'tutti',
  onChangeCategory,
  onOpenArticle,
}) {
  const [zoomItem, setZoomItem] = useState(null);

  const videos = useMemo(() => {
    const list = [];
    const seen = new Set();
    for (const art of articles) {
      if (!art.video_url || seen.has(art.video_url)) continue;
      seen.add(art.video_url);
      const cats = SLUG_CATEGORIES[art.slug] || [];
      list.push({
        id: `vid-${art.id}`,
        title:
          art.slug === 'un-natale-in-villa'
            ? `${art.title} · Un mese pieno di spettacoli`
            : art.title,
        subtitle: art.subtitle || 'Servizio video dalla Villa Comunale di Lecce',
        videoUrl: resolveMediaUrl(art.video_url),
        slug: art.slug,
        kicker: art.type === 'evento' ? 'Video Evento' : 'Servizio Video · TeleRama',
        categories: cats,
      });
    }
    list.push({
      id: 'vid-progetto-villa',
      title: 'Giardini pubblici Giuseppe Garibaldi · Il nuovo volto della Villa',
      subtitle: 'Video ufficiale degli spazi del parco, mercatini, eventi, laboratori e aree gioco.',
      videoUrl: resolveMediaUrl('/progetto/nuovo-volto-villa.mp4'),
      slug: null,
      kicker: 'Video Ufficiale · La Villa',
      categories: [],
    });
    return list;
  }, [articles]);

  const photos = useMemo(() => {
    const items = [];
    const seen = new Set();
    const events = articles.filter((a) => a.type === 'evento');
    for (const ev of events) {
      const urls = [...new Set([ev.cover_url, ...parseGallery(ev.gallery_urls)].filter(Boolean))];
      const cats = SLUG_CATEGORIES[ev.slug] || ['musica'];
      const primaryCat = cats[0] || 'musica';
      urls.forEach((src, idx) => {
        const key = `${ev.slug}::${src}`;
        if (seen.has(key)) return;
        seen.add(key);
        items.push({
          id: `${ev.id}-${idx}`,
          uri: resolveMediaUrl(src),
          slug: ev.slug,
          title: ev.title,
          categories: cats,
          catLabel: categoryLabelOf(primaryCat),
          badge: urls.length > 1 ? `${idx + 1}/${urls.length}` : null,
        });
      });
    }
    return items;
  }, [articles]);

  const filteredVideos = useMemo(() => {
    if (activeCategory === 'tutti' || activeCategory === 'video') return videos;
    return videos.filter((v) => v.categories.includes(activeCategory));
  }, [videos, activeCategory]);

  const filteredPhotos = useMemo(() => {
    if (activeCategory === 'video') return [];
    if (activeCategory === 'tutti') return photos;
    return photos.filter((p) => p.categories.includes(activeCategory));
  }, [photos, activeCategory]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.kicker}>Archivio Multimediale · Giardini Garibaldi</Text>
      <Text style={styles.heading}>Foto e Video degli Eventi</Text>
      <Text style={styles.lead}>
        Tutte le foto e i video degli eventi, concerti, mercatini, laboratori e attività in Villa.
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsRow}
      >
        {MEDIA_FILTERS.map((f) => {
          const active = activeCategory === f.id;
          return (
            <Pressable
              key={f.id}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => onChangeCategory(f.id)}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{f.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {filteredVideos.length > 0 ? (
        <View style={styles.block}>
          <Text style={styles.sectionHead}>
            {activeCategory === 'video' ? 'Tutti i Video' : 'Video in evidenza'}
          </Text>
          {filteredVideos.map((vid) => (
            <View key={vid.id} style={styles.videoCard}>
              <Text style={styles.kicker}>{vid.kicker}</Text>
              <Text style={styles.videoTitle}>{vid.title}</Text>
              {vid.subtitle ? <Text style={styles.videoSub}>{vid.subtitle}</Text> : null}
              <View style={styles.videoActions}>
                <Pressable
                  style={styles.playBtn}
                  onPress={() => vid.videoUrl && Linking.openURL(vid.videoUrl).catch(() => {})}
                >
                  <Text style={styles.playBtnText}>▶ Guarda il video</Text>
                </Pressable>
                {vid.slug ? (
                  <Pressable style={styles.linkBtn} onPress={() => onOpenArticle(vid.slug)}>
                    <Text style={styles.linkBtnText}>Scheda →</Text>
                  </Pressable>
                ) : null}
              </View>
            </View>
          ))}
        </View>
      ) : null}

      {activeCategory !== 'video' ? (
        <View style={styles.block}>
          <Text style={styles.sectionHead}>
            Foto degli eventi ({filteredPhotos.length})
          </Text>
          <View style={styles.grid}>
            {filteredPhotos.map((p) => (
              <View key={p.id} style={styles.photoCard}>
                <Pressable onPress={() => setZoomItem(p)}>
                  <SmartImage uri={p.uri} defaultRatio={1.25} minRatio={0.85} maxRatio={1.5} bordered={false} />
                  {p.badge ? (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{p.badge}</Text>
                    </View>
                  ) : null}
                </Pressable>
                <Pressable style={styles.photoMeta} onPress={() => onOpenArticle(p.slug)}>
                  <Text style={styles.photoCat}>{p.catLabel}</Text>
                  <Text style={styles.photoTitle} numberOfLines={2}>
                    {p.title}
                  </Text>
                </Pressable>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      <Modal visible={Boolean(zoomItem)} transparent animationType="fade" onRequestClose={() => setZoomItem(null)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setZoomItem(null)}>
          {zoomItem ? (
            <View style={styles.modalCard}>
              <Image source={{ uri: zoomItem.uri }} style={styles.modalImage} resizeMode="contain" />
              <View style={styles.modalFooter}>
                <Text style={styles.modalTitle} numberOfLines={2}>
                  {zoomItem.title}
                </Text>
                <Pressable
                  style={styles.playBtn}
                  onPress={() => {
                    const slug = zoomItem.slug;
                    setZoomItem(null);
                    onOpenArticle(slug);
                  }}
                >
                  <Text style={styles.playBtnText}>Vai all’evento →</Text>
                </Pressable>
              </View>
            </View>
          ) : null}
        </Pressable>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 14, paddingBottom: 36 },
  kicker: {
    fontFamily: SANS,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.9,
    textTransform: 'uppercase',
    color: COLORS.red,
    marginBottom: 4,
  },
  heading: {
    fontFamily: SERIF,
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.ink,
    marginBottom: 6,
  },
  lead: {
    fontFamily: SERIF,
    fontSize: 15,
    lineHeight: 21,
    color: COLORS.muted,
    marginBottom: 12,
  },
  chipsRow: {
    gap: 8,
    paddingBottom: 12,
  },
  chip: {
    borderWidth: 1,
    borderColor: COLORS.rule,
    backgroundColor: '#ffffff',
    paddingVertical: 7,
    paddingHorizontal: 12,
  },
  chipActive: {
    backgroundColor: COLORS.ink,
    borderColor: COLORS.ink,
  },
  chipText: {
    fontFamily: SANS,
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.ink,
  },
  chipTextActive: {
    color: '#ffffff',
  },
  block: { marginTop: 6, marginBottom: 14 },
  sectionHead: {
    fontFamily: SERIF,
    fontSize: 15,
    fontWeight: '700',
    textTransform: 'uppercase',
    color: COLORS.ink,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#9a9084',
    paddingVertical: 8,
    marginBottom: 12,
  },
  videoCard: {
    borderWidth: 1,
    borderColor: COLORS.rule,
    backgroundColor: '#ffffff',
    padding: 12,
    marginBottom: 10,
  },
  videoTitle: {
    fontFamily: SERIF,
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.ink,
    marginBottom: 4,
  },
  videoSub: {
    fontFamily: SANS,
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.muted,
    marginBottom: 10,
  },
  videoActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  playBtn: {
    backgroundColor: COLORS.ink,
    paddingVertical: 9,
    paddingHorizontal: 14,
  },
  playBtnText: {
    color: '#ffffff',
    fontFamily: SANS,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  linkBtn: {
    borderWidth: 1,
    borderColor: COLORS.ink,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  linkBtnText: {
    color: COLORS.ink,
    fontFamily: SANS,
    fontSize: 12,
    fontWeight: '700',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
  },
  photoCard: {
    width: '48.5%',
    borderWidth: 1,
    borderColor: COLORS.rule,
    backgroundColor: '#ffffff',
    overflow: 'hidden',
  },
  badge: {
    position: 'absolute',
    right: 6,
    bottom: 6,
    backgroundColor: 'rgba(28, 25, 20, 0.82)',
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
  },
  photoMeta: {
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.rule,
  },
  photoCat: {
    fontFamily: SANS,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    color: COLORS.red,
    marginBottom: 2,
  },
  photoTitle: {
    fontFamily: SERIF,
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.ink,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(18, 16, 13, 0.88)',
    justifyContent: 'center',
    padding: 16,
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: COLORS.ink,
    overflow: 'hidden',
  },
  modalImage: {
    width: '100%',
    height: 360,
    backgroundColor: '#141210',
  },
  modalFooter: {
    padding: 12,
    gap: 8,
  },
  modalTitle: {
    fontFamily: SERIF,
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.ink,
  },
});
