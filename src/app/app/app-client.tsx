"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import useAppContext from "@/contexts/app-context";
import useMenuContext from "@/contexts/menu-context";
import TuningSystemManager from "@/components/tuning-system-manager";
import JinsTranspositions from "@/components/jins-transpositions";
import MaqamTranspositions from "@/components/maqam-transpositions";
import SayrManager from "@/components/sayr-manager";
import KeyboardControls from "@/components/keyboard-controls";
import getFirstNoteName from "@/functions/getFirstNoteName";
import PatternsManager from "@/components/patterns-manager";
import JinsManager from "@/components/jins-manager";
import MaqamManager from "@/components/maqam-manager";
import PitchClassBar from "@/components/pitch-class-bar";
import Modulations from "@/components/modulations";
export default function AppClient() {
  const {
    tuningSystems,
    ajnas,
    maqamat,
    handleUrlParams,
    selectedTuningSystem,
    selectedJinsData,
    selectedMaqamData,
    maqamSayrId,
    selectedIndices,
    selectedMaqam,
    selectedJins,
  } = useAppContext();

  const { setSelectedMenu, selectedMenu } = useMenuContext();

  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const maqamDataId = searchParams.get("maqamData") ?? undefined;
    const jinsDataId = searchParams.get("jinsData") ?? undefined;

    handleUrlParams({
      tuningSystemId: searchParams.get("tuningSystem") ?? undefined,
      jinsDataId,
      maqamDataId,
      jinsFirstNote: searchParams.get("jinsFirstNote") ?? undefined,
      maqamFirstNote: searchParams.get("maqamFirstNote") ?? undefined,
      sayrId: searchParams.get("sayr") ?? undefined,
      firstNote: searchParams.get("firstNote") ?? undefined,
    });

    if (maqamDataId) setSelectedMenu("maqam");
    else if (jinsDataId) setSelectedMenu("jins");
  }, [tuningSystems, ajnas, maqamat]);

  useEffect(() => {
    const params: string[] = [];

    if (selectedTuningSystem) {
      params.push(`tuningSystem=${selectedTuningSystem.getId()}`);
      const first = getFirstNoteName(selectedIndices);
      if (first) params.push(`firstNote=${first}`);
    }

    if (selectedJinsData) params.push(`jinsData=${selectedJinsData.getId()}`);
    if (selectedMaqamData) params.push(`maqamData=${selectedMaqamData.getId()}`);
    if (maqamSayrId) params.push(`sayr=${maqamSayrId}`);

    if (selectedJins) params.push(`jinsFirstNote=${selectedJins.jinsPitchClasses[0].noteName}`);
    if (selectedMaqam) params.push(`maqamFirstNote=${selectedMaqam.ascendingPitchClasses[0].noteName}`);

    if (typeof window !== "undefined" && window.location.pathname === "/app") {
      router.replace(`/app?${params.join("&")}`, { scroll: false });
    }
  }, [selectedTuningSystem, selectedJinsData, selectedMaqamData, maqamSayrId, selectedIndices, selectedMaqam, selectedJins]);

  return (
    <div className="tools-page">
      {selectedMenu === "tuningSystem" && <TuningSystemManager admin={false} />}
      {selectedMenu === "tuningSystem-admin" && <TuningSystemManager admin />}
      {selectedMenu === "maqam" && selectedTuningSystem && <MaqamManager admin={false} />}
      {selectedMenu === "maqam-admin" && selectedTuningSystem && <MaqamManager admin />}
      {selectedMenu === "jins" && selectedTuningSystem && <JinsManager admin={false} />}
      {selectedMenu === "jins-admin" && selectedTuningSystem && <JinsManager admin />}
      {selectedTuningSystem && (!["tuningSystem", "tuningSystem-admin", "bibliography", "bibliography-admin", "pattern-admin"].includes(selectedMenu)) && <PitchClassBar />}
      {(selectedMenu === "maqam" || selectedMenu === "maqam-admin") && selectedTuningSystem && <MaqamTranspositions />}
      {(selectedMenu === "jins" || selectedMenu === "jins-admin") && selectedTuningSystem && <JinsTranspositions />}
      {selectedMenu === "sayr" && selectedMaqamData && <SayrManager admin={false} />}
      {selectedMenu === "sayr-admin" && selectedMaqamData && <SayrManager admin />}
      {selectedMenu === "modulation" && <Modulations />}
      {selectedMenu === "pattern-admin" && <PatternsManager />}
      <KeyboardControls />
    </div>
  );
}
