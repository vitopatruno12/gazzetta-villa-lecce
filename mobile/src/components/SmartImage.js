import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { COLORS } from '../theme';

const ratioCache = new Map();

export default function SmartImage({
  uri,
  defaultRatio = 4 / 3,
  minRatio = 0.62,
  maxRatio = 2.6,
  bordered = true,
  style,
}) {
  const [ratio, setRatio] = useState(() => ratioCache.get(uri) || defaultRatio);

  useEffect(() => {
    if (!uri) return undefined;
    if (ratioCache.has(uri)) {
      setRatio(ratioCache.get(uri));
      return undefined;
    }
    let alive = true;
    Image.getSize(
      uri,
      (w, h) => {
        if (!alive || !w || !h) return;
        const clamped = Math.min(maxRatio, Math.max(minRatio, w / h));
        ratioCache.set(uri, clamped);
        setRatio(clamped);
      },
      () => {}
    );
    return () => {
      alive = false;
    };
  }, [uri, minRatio, maxRatio]);

  if (!uri) return null;

  return (
    <View style={[styles.wrap, bordered && styles.bordered, style]}>
      <Image
        source={{
          uri,
          headers: { 'ngrok-skip-browser-warning': '1' },
        }}
        style={[styles.img, { aspectRatio: ratio }]}
        resizeMode="cover"
        onLoad={(e) => {
          const src = e?.nativeEvent?.source;
          if (src?.width && src?.height) {
            const clamped = Math.min(maxRatio, Math.max(minRatio, src.width / src.height));
            ratioCache.set(uri, clamped);
            if (Math.abs(clamped - ratio) > 0.02) {
              setRatio(clamped);
            }
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    overflow: 'hidden',
    backgroundColor: '#ffffff',
  },
  bordered: {
    borderWidth: 1,
    borderColor: COLORS.rule,
  },
  img: {
    width: '100%',
  },
});
