import React, { useEffect, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { resolveMediaUrl } from '../api';
import SmartImage from '../components/SmartImage';
import { COLORS, SANS, SERIF } from '../theme';

const AREAS = [
  {
    title: 'Restauro e Bar Storico',
    text: 'Recupero dell’immobile storico allo stato originale con un moderno bar aperto ai cittadini e ai visitatori.',
  },
  {
    title: 'Ristorante nel Parco',
    text: 'Recupero architettonico dedicato a un nuovo luogo di incontro, ristorazione e convivialità.',
  },
  {
    title: 'Ludoteca e Aree Gioco Inclusive',
    text: 'Ripristino della ludoteca e rinnovo delle aree gioco per renderle sicure e sempre più inclusive per i bambini.',
  },
  {
    title: 'Eventi, Mercatini e Mostre',
    text: 'Percorsi espositivi con banchi per mercatini, mostre all’aperto, corsi di yoga, musica, pittura e intrattenimento.',
  },
];

const PROJECT_PHOTOS = [
  {
    src: '/progetto/foto/planimetria.jpg',
    caption:
      'Planimetria dei Giardini Garibaldi: bar, ristorante, ludoteca, aree gioco, zona eventi e percorsi espositivi.',
  },
  {
    src: '/progetto/foto/percorsi.jpg',
    caption:
      'Percorsi espositivi con banchi richiudibili per mercatini, mostre temporanee e iniziative culturali.',
  },
  {
    src: '/progetto/foto/piazzale.jpg',
    caption: 'Piazzale intorno al chiosco, con gli allestimenti temporanei del progetto.',
  },
];

const TOTAL_SLIDES = 40;

export default function ProjectView({ onOpenArticle, initialSubView = 'info' }) {
  const [subView, setSubView] = useState(initialSubView);
  const [slideIdx, setSlideIdx] = useState(0);

  useEffect(() => {
    setSubView(initialSubView);
  }, [initialSubView]);

  const slideNum = String(slideIdx + 1).padStart(2, '0');
  const slideUri = resolveMediaUrl(`/progetto/slide-${slideNum}.jpg`);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.subTabs}>
        <Pressable
          style={[styles.subTab, subView === 'info' && styles.subTabActive]}
          onPress={() => setSubView('info')}
        >
          <Text style={[styles.subTabText, subView === 'info' && styles.subTabTextActive]}>
            Il progetto
          </Text>
        </Pressable>
        <Pressable
          style={[styles.subTab, subView === 'foto' && styles.subTabActive]}
          onPress={() => setSubView('foto')}
        >
          <Text style={[styles.subTabText, subView === 'foto' && styles.subTabTextActive]}>
            Foto del progetto
          </Text>
        </Pressable>
      </View>

      {subView === 'foto' ? (
        <>
          <Text style={styles.kicker}>Il nuovo volto della Villa</Text>
          <Text style={styles.heading}>Foto e Tavole del Progetto</Text>
          <Text style={styles.lead}>
            Planimetrie, percorsi e le 40 tavole progettuali dei Giardini pubblici Giuseppe Garibaldi.
          </Text>

          {PROJECT_PHOTOS.map((photo) => (
            <View key={photo.src} style={styles.photoFigure}>
              <SmartImage uri={resolveMediaUrl(photo.src)} defaultRatio={1.5} />
              <Text style={styles.photoCaption}>{photo.caption}</Text>
            </View>
          ))}

          <Text style={styles.sectionHead}>
            Tavole progettuali ({slideIdx + 1} / {TOTAL_SLIDES})
          </Text>
          <View style={styles.photoFigure}>
            <SmartImage uri={slideUri} defaultRatio={1.77} />
            <View style={styles.slideControls}>
              <Pressable
                style={[styles.outlineBtn, slideIdx === 0 && styles.btnDisabled]}
                disabled={slideIdx === 0}
                onPress={() => setSlideIdx((n) => Math.max(0, n - 1))}
              >
                <Text style={styles.outlineBtnText}>← Precedente</Text>
              </Pressable>
              <Pressable
                style={[styles.outlineBtn, slideIdx === TOTAL_SLIDES - 1 && styles.btnDisabled]}
                disabled={slideIdx === TOTAL_SLIDES - 1}
                onPress={() => setSlideIdx((n) => Math.min(TOTAL_SLIDES - 1, n + 1))}
              >
                <Text style={styles.outlineBtnText}>Successiva →</Text>
              </Pressable>
            </View>
          </View>
        </>
      ) : (
        <>
          <Text style={styles.kicker}>Città di Lecce · Giardini Giuseppe Garibaldi</Text>
          <Text style={styles.heading}>Il nuovo volto della Villa Comunale</Text>
          <Text style={styles.lead}>
            Il recupero dei Giardini pubblici Giuseppe Garibaldi e degli edifici storici: bar,
            ristorante, ludoteca, aree gioco e spazi per eventi, mercatini e laboratori.
          </Text>

          <View style={styles.actionsRow}>
            <Pressable
              style={styles.primaryBtn}
              onPress={() => onOpenArticle('nuovo-volto-villa-comunale-lecce')}
            >
              <Text style={styles.primaryBtnText}>Articolo e Video TeleRama</Text>
            </Pressable>
            <Pressable style={styles.outlineBtn} onPress={() => setSubView('foto')}>
              <Text style={styles.outlineBtnText}>Foto del progetto</Text>
            </Pressable>
          </View>

          <Text style={styles.sectionHead}>Le aree del progetto</Text>
          {AREAS.map((area) => (
            <View key={area.title} style={styles.card}>
              <Text style={styles.cardTitle}>{area.title}</Text>
              <Text style={styles.cardText}>{area.text}</Text>
            </View>
          ))}

          <Text style={styles.sectionHead}>In diretta e contatti</Text>
          <View style={styles.linksBox}>
            <Pressable
              style={styles.linkRow}
              onPress={() => Linking.openURL('https://radiorama.online/').catch(() => {})}
            >
              <Text style={styles.linkTitle}>Radio Rama — Segui la diretta radio</Text>
            </Pressable>
            <Pressable
              style={styles.linkRow}
              onPress={() => Linking.openURL('https://trnews.it/').catch(() => {})}
            >
              <Text style={styles.linkTitle}>Tele Rama — Segui la diretta TV</Text>
            </Pressable>
            <Pressable
              style={styles.linkRow}
              onPress={() =>
                Linking.openURL('https://www.instagram.com/lavillacomunale_lecce/').catch(() => {})
              }
            >
              <Text style={styles.linkTitle}>Instagram · @lavillacomunale_lecce</Text>
            </Pressable>
            <Pressable
              style={[styles.linkRow, { borderBottomWidth: 0 }]}
              onPress={() => Linking.openURL('mailto:andiamo.lavilla@gmail.com').catch(() => {})}
            >
              <Text style={styles.linkTitle}>Scrivici · andiamo.lavilla@gmail.com</Text>
            </Pressable>
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 36,
  },
  subTabs: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  subTab: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.ink,
    paddingVertical: 9,
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  subTabActive: {
    backgroundColor: COLORS.ink,
  },
  subTabText: {
    fontFamily: SANS,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    color: COLORS.ink,
  },
  subTabTextActive: {
    color: '#ffffff',
  },
  kicker: {
    fontFamily: SANS,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: COLORS.red,
    marginBottom: 4,
  },
  heading: {
    fontFamily: SERIF,
    fontSize: 25,
    fontWeight: '700',
    color: COLORS.ink,
    marginBottom: 8,
  },
  lead: {
    fontFamily: SERIF,
    fontSize: 16,
    lineHeight: 23,
    color: COLORS.muted,
    marginBottom: 14,
  },
  actionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 18,
  },
  primaryBtn: {
    backgroundColor: COLORS.ink,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  primaryBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  outlineBtn: {
    borderWidth: 1,
    borderColor: COLORS.ink,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  btnDisabled: {
    opacity: 0.4,
  },
  outlineBtnText: {
    color: COLORS.ink,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  photoFigure: {
    marginBottom: 14,
  },
  photoCaption: {
    fontFamily: SANS,
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.muted,
    marginTop: 6,
  },
  slideControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
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
    paddingVertical: 8,
    marginTop: 8,
    marginBottom: 12,
  },
  card: {
    borderWidth: 1,
    borderColor: COLORS.rule,
    padding: 12,
    marginBottom: 10,
    backgroundColor: '#ffffff',
  },
  cardTitle: {
    fontFamily: SERIF,
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.ink,
    marginBottom: 4,
  },
  cardText: {
    fontFamily: SANS,
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.muted,
  },
  linksBox: {
    borderWidth: 1,
    borderColor: COLORS.rule,
    backgroundColor: '#ffffff',
  },
  linkRow: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.rule,
  },
  linkTitle: {
    fontFamily: SERIF,
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.ink,
  },
});
