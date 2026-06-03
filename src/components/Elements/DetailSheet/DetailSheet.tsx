import { BottomSheetBackdrop, BottomSheetModal, type BottomSheetBackdropProps } from '@gorhom/bottom-sheet'
import { LinearGradient } from 'expo-linear-gradient'
import { type Ref, type ReactNode } from 'react'
import { StyleSheet, View } from 'react-native'
import { Colors } from '@/components/colors'

type DetailSheetProps = {
  sheetRef: Ref<BottomSheetModal>
  snapPoints?: Array<string | number>
  children: ReactNode
  onChange?: (index: number) => void
}

const DEFAULT_SNAP_POINTS: Array<string | number> = ['15%', '50%', '95%']

function renderBackdrop(props: BottomSheetBackdropProps) {
  return (
    <BottomSheetBackdrop
      {...props}
      appearsOnIndex={0}
      disappearsOnIndex={-1}
      opacity={0.25}
      pressBehavior='collapse'
    />
  )
}

export function DetailSheet({
  sheetRef,
  snapPoints = DEFAULT_SNAP_POINTS,
  children,
  onChange,
}: DetailSheetProps) {
  return (
    <BottomSheetModal
      ref={sheetRef}
      index={0}
      snapPoints={snapPoints}
      enablePanDownToClose={false}
      backdropComponent={renderBackdrop}
      handleComponent={() => (
        <View style={styles.handleWrap}>
          <LinearGradient
            colors={['#0ea5e9', '#06b6d4', '#0ea5e9']}
            start={{
              x: 0,
              y: 0,
            }}
            end={{
              x: 1,
              y: 0,
            }}
            style={styles.handle}
          />
        </View>
      )}
      backgroundComponent={({ style }) => (
        <View
          style={[
            style,
            styles.bg,
          ]}
        />
      )}
      onChange={onChange}
    >
      {children}
    </BottomSheetModal>
  )
}

const styles = StyleSheet.create({
  handleWrap: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 6,
  },
  handle: {
    width: 56,
    height: 5,
    borderRadius: 3,
    shadowColor: Colors.shine.glow,
    shadowOpacity: 0.6,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 0,
    },
  },
  bg: {
    backgroundColor: 'rgba(248, 250, 252, 0.96)',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.7)',
    shadowColor: Colors.shine.glow,
    shadowOpacity: 0.18,
    shadowRadius: 24,
    shadowOffset: {
      width: 0,
      height: -4,
    },
  },
})
