import React, { useState } from 'react';
import {
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { EVENT_CATEGORIES } from '../calendarData';
import { COLORS, SANS, SERIF } from '../theme';

export default function MobileSideMenu({
  open,
  activeTab,
  session,
  onClose,
  onSelectTab,
  onSelectEventCategory,
  onOpenAccount,
}) {
  const [eventsExpanded, setEventsExpanded] = useState(true);

  function goTab(tabId) {
    onSelectTab(tabId);
    onClose();
  }

  function goCategory(catId) {
    onSelectEventCategory(catId);
    onClose();
  }

  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.drawer}>
          <View style={styles.drawerHead}>
            <Text style={styles.drawerTitle}>Menu</Text>
            <Pressable style={styles.closeBtn} onPress={onClose} accessibilityLabel="Chiudi menu">
              <Text style={styles.closeBtnText}>×</Text>
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.drawerContent}>
            <Text style={styles.kicker}>Sezioni</Text>

            <Pressable style={styles.menuItem} onPress={() => goTab('home')}>
              <Text style={[styles.menuItemText, activeTab === 'home' && styles.menuItemActive]}>
                Home
              </Text>
            </Pressable>

            <Pressable style={styles.menuItem} onPress={() => goTab('cronaca')}>
              <Text style={[styles.menuItemText, activeTab === 'cronaca' && styles.menuItemActive]}>
                Cronaca
              </Text>
            </Pressable>

            {/* Eventi con sottomenu categorie */}
            <View style={styles.menuSubWrap}>
              <View style={styles.menuSubHeader}>
                <Pressable style={{ flex: 1, paddingVertical: 10 }} onPress={() => goCategory('tutti')}>
                  <Text
                    style={[styles.menuItemText, activeTab === 'eventi' && styles.menuItemActive]}
                  >
                    Eventi e Calendari
                  </Text>
                </Pressable>
                <Pressable
                  style={styles.subToggleBtn}
                  onPress={() => setEventsExpanded((v) => !v)}
                >
                  <Text style={styles.subToggleText}>{eventsExpanded ? '▴' : '▾'}</Text>
                </Pressable>
              </View>

              {eventsExpanded ? (
                <View style={styles.subList}>
                  {EVENT_CATEGORIES.map((cat) => (
                    <Pressable
                      key={cat.id}
                      style={styles.subItem}
                      onPress={() => goCategory(cat.id)}
                    >
                      <Text style={styles.subItemText}>{cat.fullLabel}</Text>
                    </Pressable>
                  ))}
                </View>
              ) : null}
            </View>

            <Text style={[styles.kicker, { marginTop: 16 }]}>La Villa</Text>

            <Pressable style={styles.menuItem} onPress={() => goTab('progetto')}>
              <Text
                style={[styles.menuItemText, activeTab === 'progetto' && styles.menuItemActive]}
              >
                Il progetto · Giardini Garibaldi
              </Text>
            </Pressable>

            <Pressable style={styles.menuItem} onPress={() => goTab('partner')}>
              <Text style={[styles.menuItemText, activeTab === 'partner' && styles.menuItemActive]}>
                Partner e Attività
              </Text>
            </Pressable>

            <Text style={[styles.kicker, { marginTop: 16 }]}>Area Cliente</Text>
            {session?.user ? (
              <Pressable
                style={styles.menuItem}
                onPress={() => {
                  onOpenAccount('login');
                  onClose();
                }}
              >
                <Text style={styles.menuItemText}>
                  Il tuo profilo ({session.user.first_name || 'Cliente'})
                </Text>
              </Pressable>
            ) : (
              <Pressable
                style={styles.menuItem}
                onPress={() => {
                  onOpenAccount('login');
                  onClose();
                }}
              >
                <Text style={styles.menuItemText}>Login</Text>
              </Pressable>
            )}

            <Text style={[styles.kicker, { marginTop: 16 }]}>In Diretta & Contatti</Text>
            <Pressable
              style={styles.menuItem}
              onPress={() => Linking.openURL('https://radiorama.online/').catch(() => {})}
            >
              <Text style={styles.menuItemText}>Radio Rama</Text>
            </Pressable>
            <Pressable
              style={styles.menuItem}
              onPress={() => Linking.openURL('https://trnews.it/').catch(() => {})}
            >
              <Text style={styles.menuItemText}>Tele Rama</Text>
            </Pressable>
            <Pressable
              style={styles.menuItem}
              onPress={() =>
                Linking.openURL('https://www.instagram.com/lavillacomunale_lecce/').catch(() => {})
              }
            >
              <Text style={styles.menuItemText}>Instagram · @lavillacomunale_lecce</Text>
            </Pressable>
            <Pressable
              style={[styles.menuItem, { borderBottomWidth: 0 }]}
              onPress={() => Linking.openURL('mailto:andiamo.lavilla@gmail.com').catch(() => {})}
            >
              <Text style={styles.menuItemText}>andiamo.lavilla@gmail.com</Text>
            </Pressable>
          </ScrollView>
        </View>

        <Pressable style={styles.backdrop} onPress={onClose} />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(28, 25, 20, 0.48)',
  },
  drawer: {
    width: '82%',
    maxWidth: 330,
    backgroundColor: '#ffffff',
    borderRightWidth: 2,
    borderRightColor: COLORS.ink,
    paddingTop: 38,
  },
  backdrop: {
    flex: 1,
  },
  drawerHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.ink,
  },
  drawerTitle: {
    fontFamily: SERIF,
    fontSize: 20,
    fontWeight: '700',
    textTransform: 'uppercase',
    color: COLORS.ink,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderWidth: 1,
    borderColor: COLORS.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 22,
    lineHeight: 24,
    color: COLORS.ink,
  },
  drawerContent: {
    padding: 16,
    paddingBottom: 40,
  },
  kicker: {
    fontFamily: SANS,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: COLORS.red,
    marginBottom: 6,
  },
  menuItem: {
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.rule,
  },
  menuItemText: {
    fontFamily: SERIF,
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.ink,
  },
  menuItemActive: {
    color: COLORS.red,
    fontWeight: '700',
  },
  menuSubWrap: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.rule,
  },
  menuSubHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  subToggleBtn: {
    width: 34,
    height: 34,
    borderWidth: 1,
    borderColor: COLORS.rule,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subToggleText: {
    fontSize: 14,
    color: COLORS.ink,
  },
  subList: {
    borderLeftWidth: 2,
    borderLeftColor: COLORS.rule,
    marginLeft: 4,
    paddingLeft: 12,
    paddingBottom: 8,
  },
  subItem: {
    paddingVertical: 7,
  },
  subItemText: {
    fontFamily: SERIF,
    fontSize: 14,
    color: COLORS.muted,
  },
});
