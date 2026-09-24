import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ImagePlaceholder } from './ImagePlaceholder';

import type { LearningPath as LearningPathData, PathNode, PathRow } from '@/constants/learningPath';
import { Colors, FontSize, FontWeight, Radius, Shadow, Spacing } from '@/constants/theme';

/** Geometry shared by the nodes and the connectors that link them. */
const NODE_SIZE = 76;
const LABEL_GAP = 10;
const LABEL_HEIGHT = 20;
const ROW_GAP = 38;
const ROW_HEIGHT = NODE_SIZE + LABEL_GAP + LABEL_HEIGHT;
/** Vertical distance between the circle centres of consecutive rows. */
const PITCH = ROW_HEIGHT + ROW_GAP;
const SIDE_PADDING = 52;
const ARC_INSET = 8;
const ARC_WIDTH = SIDE_PADDING + NODE_SIZE / 2 - ARC_INSET;
const TRACK = '#DDDFE3';
const TRACK_WIDTH = 3;

function LessonNode({ node, onPress }: { node: PathNode; onPress?: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={node.title}
      onPress={onPress}
      style={({ pressed }) => [styles.node, pressed && styles.pressed]}>
      <View style={[styles.circle, { backgroundColor: node.color }]}>
        {node.image ? (
          <ImagePlaceholder source={node.image} style={styles.nodeImage} />
        ) : (
          <Text style={styles.emoji}>{node.emoji}</Text>
        )}
      </View>
      <Text style={styles.nodeLabel} numberOfLines={1}>
        {node.title}
      </Text>
    </Pressable>
  );
}

/**
 * Connectors are drawn with partially transparent borders on rounded boxes,
 * which keeps the curves crisp without pulling in an SVG dependency.
 */
function RowConnectorShape({ row }: { row: PathRow }) {
  if (row.connector === 'corner-right') {
    return (
      <View
        pointerEvents="none"
        style={[
          styles.connector,
          styles.cornerRight,
          { height: PITCH, top: NODE_SIZE / 2, right: SIDE_PADDING + NODE_SIZE / 2 },
        ]}
      />
    );
  }

  if (row.connector === 'arc-left') {
    return (
      <View
        pointerEvents="none"
        style={[
          styles.connector,
          styles.arcLeft,
          { height: PITCH, top: NODE_SIZE / 2, left: ARC_INSET, width: ARC_WIDTH },
        ]}
      />
    );
  }

  if (row.connector === 'arc-right') {
    return (
      <View
        pointerEvents="none"
        style={[
          styles.connector,
          styles.arcRight,
          { height: PITCH, top: NODE_SIZE / 2, right: ARC_INSET, width: ARC_WIDTH },
        ]}
      />
    );
  }

  return null;
}

type LearningPathProps = {
  path: LearningPathData;
  onSelectNode?: (node: PathNode) => void;
};

export function LearningPath({ path, onSelectNode }: LearningPathProps) {
  return (
    <View style={styles.container}>
      {path.rows.map((row, index) => {
        const isPair = row.nodes.length > 1;

        return (
          <View key={row.nodes[0].id} style={styles.row}>
            <RowConnectorShape row={row} />

            {isPair ? (
              <View pointerEvents="none" style={styles.straightLine} />
            ) : null}

            {row.marker ? (
              <View
                pointerEvents="none"
                style={[styles.marker, Shadow.card, { top: NODE_SIZE / 2 + PITCH - 20 }]}>
                <Ionicons name="arrow-down" size={18} color={Colors.text} />
              </View>
            ) : null}

            <View style={[styles.rowInner, !isPair && styles.rowInnerSingle]}>
              {row.nodes.map((node) => (
                <LessonNode key={node.id} node={node} onPress={() => onSelectNode?.(node)} />
              ))}
            </View>

            {index < path.rows.length - 1 ? <View style={styles.rowSpacer} /> : null}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  row: {
    width: '100%',
  },
  rowInner: {
    height: ROW_HEIGHT,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SIDE_PADDING,
  },
  rowInnerSingle: {
    justifyContent: 'center',
  },
  rowSpacer: {
    height: ROW_GAP,
  },
  node: {
    width: NODE_SIZE,
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.75,
  },
  circle: {
    width: NODE_SIZE,
    height: NODE_SIZE,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  nodeImage: {
    width: '70%',
    height: '70%',
  },
  emoji: {
    fontSize: 36,
    lineHeight: 44,
  },
  nodeLabel: {
    marginTop: LABEL_GAP,
    height: LABEL_HEIGHT,
    fontSize: FontSize.body,
    fontWeight: FontWeight.medium,
    color: Colors.text,
    textAlign: 'center',
    width: 120,
  },
  straightLine: {
    position: 'absolute',
    top: NODE_SIZE / 2 - TRACK_WIDTH / 2,
    left: SIDE_PADDING + NODE_SIZE + Spacing.md,
    right: SIDE_PADDING + NODE_SIZE + Spacing.md,
    height: TRACK_WIDTH,
    borderRadius: Radius.pill,
    backgroundColor: TRACK,
  },
  connector: {
    position: 'absolute',
    borderWidth: TRACK_WIDTH,
    borderColor: 'transparent',
  },
  cornerRight: {
    left: '50%',
    marginLeft: NODE_SIZE / 2,
    borderTopColor: TRACK,
    borderRightColor: TRACK,
    borderTopRightRadius: 56,
  },
  arcLeft: {
    borderTopColor: TRACK,
    borderLeftColor: TRACK,
    borderBottomColor: TRACK,
    borderTopLeftRadius: ARC_WIDTH,
    borderBottomLeftRadius: ARC_WIDTH,
  },
  arcRight: {
    borderTopColor: TRACK,
    borderRightColor: TRACK,
    borderBottomColor: TRACK,
    borderTopRightRadius: ARC_WIDTH,
    borderBottomRightRadius: ARC_WIDTH,
  },
  marker: {
    position: 'absolute',
    right: Spacing.lg,
    width: 40,
    height: 40,
    borderRadius: Radius.pill,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
});
