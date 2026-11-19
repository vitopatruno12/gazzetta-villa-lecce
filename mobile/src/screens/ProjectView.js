import React from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
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

export default function ProjectView({ onOpenArticle }) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
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
        <Pressable
          style={styles.outlineBtn}
          onPress={() => Linking.openURL('https://www.villacomunalelecce.it/progetto/foto').catch(() => {})}
        >
          <Text style={styles.outlineBtnText}>Planimetrie sul sito</Text>
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 36,
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
  outlineBtnText: {
    color: COLORS.ink,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
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
