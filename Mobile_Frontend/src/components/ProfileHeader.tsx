import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View, type ImageSourcePropType } from 'react-native';

import { ImagePlaceholder } from './ImagePlaceholder';

import { profileInitial } from '@/constants/profile';
import { Colors, FontSize, FontWeight, Layout, Radius, Shadow, Spacing } from '@/constants/theme';

type ProfileHeaderProps = {
  name: string;
  avatar: ImageSourcePropType | null;
  onPressAvatar?: () => void;
  onPressSettings?: () => void;
};

const AVATAR_SIZE = 56;

export function ProfileHeader({
  name,
  avatar,
  onPressAvatar,
  onPressSettings,
}: ProfileHeaderProps) {
  return (
    <View style={styles.header}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Change profile photo"
        onPress={onPressAvatar}
        style={({ pressed }) => [styles.avatarWrap, pressed && styles.pressed]}>
        {avatar ? (
          <ImagePlaceholder source={avatar} style={styles.avatar} />
        ) : (
          <View style={styles.avatar}>
            <Text style={styles.initial}>{profileInitial(name)}</Text>
          </View>
        )}
        <View style={styles.addBadge}>
          <Ionicons name="add" size={14} color={Colors.white} />
        </View>
      </Pressable>

      <Text style={styles.name} numberOfLines={1}>
        {name}
      </Text>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Settings"
        onPress={onPressSettings}
        style={({ pressed }) => [styles.settings, pressed && styles.pressed]}>
        <Ionicons name="settings-sharp" size={20} color={Colors.text} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    paddingHorizontal: Layout.screenPadding,
    paddingVertical: Spacing.lg,
  },
  avatarWrap: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: Radius.pill,
    backgroundColor: Colors.neutral,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  initial: {
    fontSize: FontSize.title,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
  },
  addBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 22,
    height: 22,
    borderRadius: Radius.pill,
    backgroundColor: Colors.primary,
    borderWidth: 2,
    borderColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    flex: 1,
    fontSize: 24,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
  settings: {
    width: 40,
    height: 40,
    borderRadius: Radius.pill,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.card,
  },
  pressed: {
    opacity: 0.7,
  },
});
