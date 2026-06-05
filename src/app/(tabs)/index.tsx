import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { Camera } from "@rnmapbox/maps";
import type { ComponentRef } from "react";

type CameraRef = ComponentRef<typeof Camera>;
import { useAuth } from "@/components/Providers/AuthProvider";
import { UbicacionHooks } from "@/api/Ubicacion/Ubicacion.Hooks";
import { ConsumoHooks } from "@/api/Consumo/Consumo.Hooks";
import { TiempoHooks } from "@/api/Tiempo/Tiempo.Hooks";
import { useLayerStore } from "@/store/useLayerStore";
import {
  AnimatedBlobs,
  MapContainer,
  MapFAB,
  MapHeader,
} from "@/components/Elements/Map";
import {
  DetailChart,
  DetailSheet,
  DetailSheetColonias,
  type ColoniaCard,
  DetailSheetComparativa,
  DetailSheetHeader,
  DetailSheetMetrics,
  DetailSheetSources,
  type MetricItem,
} from "@/components/Elements/DetailSheet";
import { WaterSphere } from "@/components/Elements/WaterSphere";
import { Colors } from "@/components/colors";
import { useHaptic } from "@/lib/animation";
import {
  type Bimestre,
  getCurrentBimestre,
  getPrevBimestre,
} from "@/lib/bimestre";
import type { DisponibilidadStatus } from "@/lib/mockData";
import {
  getDisponibilidadStatus,
  getDisponibilidadIndex,
} from "@/lib/mockData";

type SelectionState = {
  codigoId: string;
  cp: string;
  alcaldia: string;
  coloniaNombre: string;
  tapCoordinates: [number, number];
  center: [number, number];
} | null;

export default function MapScreen() {
  const { width, height } = useWindowDimensions();
  const { user } = useAuth();
  const sheetRef = useRef<BottomSheetModal>(null);
  const cameraRef = useRef<CameraRef>(null);
  const haptic = useHaptic();

  const { data: currentTiempo } = TiempoHooks.useCurrentTiempo();
  const [bimestre, setBimestre] = useState<Bimestre>(
    getCurrentBimestre().bimestre,
  );
  const [anio, setAnio] = useState<number>(getCurrentBimestre().anio);
  const [selection, setSelection] = useState<SelectionState>(null);

  useEffect(() => {
    if (currentTiempo) {
      setBimestre(currentTiempo.bimestre);
      setAnio(currentTiempo.anio);
    }
  }, [currentTiempo]);

  const units = useLayerStore((s) => s.units);

  const { data: colonia } = UbicacionHooks.useColonia(
    selection?.codigoId ?? null,
  );
  const { data: coloniasByCp } = UbicacionHooks.useColoniasByCp(
    selection?.cp ?? null,
  );
  const { data: consumoActual } = ConsumoHooks.useConsumoByColonia(
    selection?.codigoId ?? null,
    bimestre,
    anio,
  );
  const prev = getPrevBimestre(bimestre, anio);
  const { data: consumoAnterior } = ConsumoHooks.useConsumoByColonia(
    selection?.codigoId ?? null,
    prev.bimestre,
    prev.anio,
  );

  const handleSelectZone = useCallback(
    (
      codigoId: string,
      cp: string,
      center: [number, number],
      tapCoord: [number, number],
      coloniaNombre: string,
      alcaldia: string,
    ) => {
      haptic.light();
      setSelection({
        codigoId,
        cp,
        alcaldia: alcaldia || colonia?.municipio_nombre || "",
        coloniaNombre: coloniaNombre || "",
        tapCoordinates: tapCoord,
        center,
      });
      cameraRef.current?.setCamera({
        centerCoordinate: center,
        zoomLevel: 14,
        animationMode: "flyTo",
        animationDuration: 1200,
      });
      sheetRef.current?.snapToIndex(0);
    },
    [haptic, colonia],
  );

  const handleSelectColoniaInCp = useCallback(
    (codigoId: string) => {
      const c = coloniasByCp?.find((x) => x.codigo_id === codigoId);
      if (!c) return;
      haptic.light();
      const centro: [number, number] =
        c.centro_lon != null && c.centro_lat != null
          ? [c.centro_lon, c.centro_lat]
          : [0, 0];
      setSelection({
        codigoId: c.codigo_id,
        cp: c.codigo,
        alcaldia: c.municipio_nombre ?? "",
        coloniaNombre: c.colonia_nombre,
        tapCoordinates: centro,
        center: centro,
      });
      cameraRef.current?.setCamera({
        centerCoordinate: centro,
        zoomLevel: 14,
        animationMode: "flyTo",
        animationDuration: 1200,
      });
      sheetRef.current?.snapToIndex(0);
    },
    [haptic, coloniasByCp],
  );

  const handleDismiss = useCallback(() => {
    setSelection(null);
  }, []);

  const handleChangeBimestre = useCallback(
    (b: Bimestre, a: number) => {
      haptic.selection();
      setBimestre(b);
      setAnio(a);
    },
    [haptic],
  );

  const coloniasCards: ColoniaCard[] = useMemo(() => {
    if (!coloniasByCp) return [];
    return coloniasByCp.map((c) => {
      const consumo = ConsumoService_static_getConsumo_forCard(
        c.codigo_id,
        bimestre,
        anio,
      );
      return {
        codigo_id: c.codigo_id,
        codigo: c.codigo,
        colonia_nombre: c.colonia_nombre,
        municipio_nombre: c.municipio_nombre ?? "",
        consumo_total: consumo.consumo_total,
        disponibilidadIndex: getDisponibilidadIndex(consumo.consumo_total),
        status: getDisponibilidadStatus(consumo.consumo_total),
        indice_des: consumo.indice_des,
      };
    });
  }, [coloniasByCp, bimestre, anio]);

  const metricSections: { title: string; metrics: MetricItem[] }[] =
    useMemo(() => {
      if (!consumoActual) return [];
      const factorGal = 264.172;
      const toGal = (n: number) => Math.round(n * factorGal);
      const consumoTotal =
        units === "imperial"
          ? toGal(consumoActual.consumo_total)
          : consumoActual.consumo_total;
      const consumoDom =
        units === "imperial"
          ? toGal(consumoActual.consumo_total_dom)
          : consumoActual.consumo_total_dom;
      const consumoNoDom =
        units === "imperial"
          ? toGal(consumoActual.consumo_total_no_dom)
          : consumoActual.consumo_total_no_dom;
      const consumoMixto =
        units === "imperial"
          ? toGal(consumoActual.consumo_total_mixto)
          : consumoActual.consumo_total_mixto;
      const unitLabel = units === "imperial" ? "gal" : "m³";

      const municipioNombre = colonia?.municipio_nombre ?? "";
      return [
        {
          title: "Consumo",
          metrics: [
            {
              key: "consumo_total",
              icon: "water-outline",
              label: "Total",
              value: consumoTotal,
              unit: unitLabel,
              color: "#0284c7",
            },
            {
              key: "consumo_prom",
              icon: "speedometer-outline",
              label: "Promedio",
              value: consumoActual.consumo_prom,
              unit: `${unitLabel}/d`,
              precision: 1,
              color: "#06b6d4",
            },
            {
              key: "consumo_dom",
              icon: "home-outline",
              label: "Doméstico",
              value: consumoDom,
              unit: unitLabel,
              color: "#0ea5e9",
            },
            {
              key: "consumo_no_dom",
              icon: "business-outline",
              label: "No doméstico",
              value: consumoNoDom,
              unit: unitLabel,
              color: "#f59e0b",
            },
            {
              key: "consumo_mixto",
              icon: "git-merge-outline",
              label: "Mixto",
              value: consumoMixto,
              unit: unitLabel,
              color: "#8b5cf6",
            },
          ],
        },
      ];
    }, [consumoActual, units, colonia]);

  const handleSearchSelect = useCallback(
    (
      codigoId: string,
      cp: string,
      coordinates: [number, number],
      coloniaNombre: string,
      alcaldia: string,
    ) => {
      setSelection({
        codigoId,
        cp,
        alcaldia,
        coloniaNombre,
        tapCoordinates: coordinates,
        center: coordinates,
      });
      cameraRef.current?.setCamera({
        centerCoordinate: coordinates,
        zoomLevel: 14,
        animationMode: "flyTo",
        animationDuration: 1200,
      });
      sheetRef.current?.snapToIndex(0);
    },
    [],
  );

  const status: DisponibilidadStatus = consumoActual?.status ?? "ok";
  const disponibilidadIndex = consumoActual?.disponibilidadIndex ?? 0;
  const alcaldia = colonia?.municipio_nombre ?? "";
  const cp = colonia?.codigo ?? "";

  return (
    <View className="flex-1 bg-water-bg">
      <AnimatedBlobs width={width} height={height} />

      <View className="flex-1">
        <MapContainer
          selectedId={selection?.codigoId}
          onSelectZone={(id, cp, center, tap, name, alcaldia) =>
            handleSelectZone(id, cp, center, tap, name, alcaldia)
          }
        />
      </View>

      <SafeAreaView
        edges={["top"]}
        className="absolute inset-0"
        pointerEvents="box-none"
      >
        <MapHeader onSelectSearchResult={handleSearchSelect} />
      </SafeAreaView>

      <SafeAreaView
        edges={["bottom"]}
        className="absolute bottom-0 left-0 right-0"
        pointerEvents="box-none"
      >
        <Animated.View
          entering={FadeIn.duration(500)}
          exiting={FadeOut.duration(300)}
          style={{
            position: "absolute",
            left: 16,
            bottom: 120,
            maxWidth: 260,
          }}
        >
          {selection ? (
            <View
              style={{
                backgroundColor: "#ffffff",
                borderRadius: 16,
                paddingVertical: 8,
                paddingHorizontal: 10,
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                shadowColor: "#0f172a",
                shadowOpacity: 0.18,
                shadowRadius: 12,
                shadowOffset: { width: 0, height: 4 },
                elevation: 6,
                marginBottom: 8,
              }}
            >
              <View
                style={{
                  width: 6,
                  height: 28,
                  borderRadius: 3,
                  backgroundColor: "#0ea5e9",
                }}
              />
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text
                  className="font-montserrat-extrabold text-xs text-gray-900"
                  numberOfLines={1}
                >
                  {selection.coloniaNombre}
                </Text>
                <Text
                  className="font-montserrat-light text-[10px] text-gray-500"
                  numberOfLines={1}
                >
                  {selection.alcaldia} · CP {selection.cp}
                </Text>
              </View>
            </View>
          ) : null}

          <View
            style={{
              backgroundColor: "#ffffff",
              borderRadius: 18,
              paddingVertical: 12,
              paddingHorizontal: 12,
              alignItems: "center",
              shadowColor: "#0f172a",
              shadowOpacity: 0.18,
              shadowRadius: 16,
              shadowOffset: {
                width: 0,
                height: 6,
              },
              elevation: 8,
              minWidth: 130,
            }}
          >
            <WaterSphere
              value={consumoActual?.consumo_total ?? 600}
              size={56}
              showGlow={false}
              showScale
            />
            <Text
              className="font-montserrat-extrabold text-base"
              style={{
                color: "#0c4a6e",
                marginTop: 8,
              }}
            >
              {(consumoActual?.consumo_total ?? 600).toLocaleString("es-MX", {
                maximumFractionDigits: 0,
              })}
              {" m³"}
            </Text>
            <Text className="font-montserrat-light text-[10px] text-gray-500">
              consumo bimestral
            </Text>
            <Text className="font-montserrat-medium text-[10px] text-gray-600 text-center mt-1.5 px-1">
              {selection
                ? "Toca otra colonia para cambiar"
                : "Toca una colonia del mapa"}
            </Text>
          </View>
        </Animated.View>
      </SafeAreaView>

      <MapFAB />

      <DetailSheet
        sheetRef={sheetRef}
        onChange={(index) => {
          if (index === -1) {
            handleDismiss();
          }
        }}
      >
        <View className="pb-10">
          {consumoActual && colonia ? (
            <>
              <DetailSheetHeader
                coloniaNombre={colonia.colonia_nombre}
                alcaldia={alcaldia}
                cp={cp}
                indiceDes={consumoActual.indice_des}
                disponibilidadIndex={disponibilidadIndex}
                status={status}
                bimestre={bimestre}
                anio={anio}
                onChangeBimestre={handleChangeBimestre}
              />
              {coloniasCards.length > 1 ? (
                <DetailSheetColonias
                  colonias={coloniasCards}
                  selectedId={selection?.codigoId}
                  onSelect={handleSelectColoniaInCp}
                />
              ) : null}
              <DetailSheetMetrics sections={metricSections} />
              <View className="px-5 pt-3">
                {consumoAnterior && consumoAnterior.consumo_total > 0 ? (
                  <DetailSheetComparativa
                    current={consumoActual.consumo_total}
                    previous={consumoAnterior.consumo_total}
                    unit={units === "imperial" ? "gal" : "m³"}
                    label="Consumo total"
                  />
                ) : null}
              </View>
              <View className="px-5 pt-3">
                <DetailChart
                  data={consumoActual.trend}
                  width={width - 40}
                  current={consumoActual.consumo_total}
                  unit={units === "imperial" ? "gal" : "m³"}
                />
              </View>
              <DetailSheetSources
                potable={consumoActual.sources.potable}
                rain={consumoActual.sources.rain}
                residual={consumoActual.sources.residual}
                recycled={consumoActual.sources.recycled}
              />
              <View className="px-5 pt-3">
                <Text className="font-montserrat-light text-[10px] text-gray-400 text-center">
                  Datos del bimestre {bimestre}/{anio} · Bimestre anterior:{" "}
                  {prev.bimestre}/{prev.anio}
                </Text>
              </View>
            </>
          ) : (
            <View className="px-5 pt-4 items-center">
              <Text className="font-montserrat-semibold text-base text-gray-700 text-center">
                {selection ? "Cargando datos..." : "Selecciona una colonia"}
              </Text>
              <Text className="font-montserrat-light text-sm text-gray-500 mt-1 text-center">
                Toca un polígono del mapa o busca por nombre
              </Text>
            </View>
          )}
        </View>
      </DetailSheet>
    </View>
  );
}

function ConsumoService_static_getConsumo_forCard(
  codigo_id: string,
  bimestre: Bimestre,
  anio: number,
) {
  const { generateConsumo } =
    require("@/lib/mockData") as typeof import("@/lib/mockData");
  return generateConsumo(codigo_id, bimestre, anio);
}

void StyleSheet;
void Colors;
