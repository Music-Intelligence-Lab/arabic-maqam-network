"use client";

import useAppContext from "@/contexts/app-context";
import useSoundContext from "@/contexts/sound-context";
import React, { useState, useEffect, useRef } from "react";
import { MaqamatModulations, Maqam } from "@/models/Maqam";
import { getEnglishNoteName } from "@/functions/noteNameMappings";
import calculateNumberOfModulations from "@/functions/calculateNumberOfModulations";
import { AjnasModulations } from "@/models/Jins";
import modulate from "@/functions/modulate";
type ModulationsPair = { ajnas: AjnasModulations; maqamat: MaqamatModulations };

export default function Modulations() {
  const {
    maqamat,
    ajnas,
    selectedMaqamDetails,
    setSelectedMaqamDetails,
    selectedMaqam,
    setSelectedMaqam,
    selectedJins,
    setSelectedJins,
    setSelectedJinsDetails,
    allPitchClasses,
    setSelectedPitchClasses,
    handleClickMaqam,
  } = useAppContext();

  const [modulationModes, setModulationModes] = useState<boolean[]>([false]);

  const [collapsedHops, setCollapsedHops] = useState<boolean[]>([]);
  const { clearHangingNotes } = useSoundContext();

  const [sourceMaqamStack, setSourceMaqamStack] = useState<Maqam[]>([]);
  const [modulationsStack, setModulationsStack] = useState<ModulationsPair[]>([]);

  const hopsRefs = useRef<Array<HTMLDivElement | null>>([]);

  function getBothModulations(transposition: Maqam): ModulationsPair {
    const ajnasMods = modulate(allPitchClasses, ajnas, maqamat, transposition, true) as AjnasModulations;
    const maqamatMods = modulate(allPitchClasses, ajnas, maqamat, transposition, false) as MaqamatModulations;
    return {
      ajnas: ajnasMods,
      maqamat: maqamatMods,
    };
  }

  useEffect(() => {
    if (sourceMaqamStack.length === 0 && selectedMaqamDetails) {
      let transposition: Maqam;
      if (selectedMaqam) transposition = selectedMaqam;
      else transposition = selectedMaqamDetails.getTahlil(allPitchClasses);
      setSourceMaqamStack([transposition]);
      setModulationsStack([getBothModulations(transposition)]);
      setModulationModes([false]); // default to maqamat for first hop
      setCollapsedHops([false]); // not collapsed by default
    }
  }, []);

  useEffect(() => {
    if (selectedMaqam) {
      const maqam = maqamat.find((m) => m.getId() === selectedMaqam.maqamId);
      if (maqam) {
        setSelectedMaqamDetails(maqam);
        setSelectedJinsDetails(null);
      }
      setSelectedPitchClasses([]); // Clear first
      setSelectedPitchClasses(selectedMaqam.ascendingPitchClasses);
    } else if (selectedJins) {
      const jins = ajnas.find((j) => j.getId() === selectedJins.jinsId);
      if (jins) {
        setSelectedJinsDetails(jins);
        setSelectedMaqamDetails(null);
      }
      setSelectedPitchClasses([]); // Clear first
      setSelectedPitchClasses(selectedJins.jinsPitchClasses);
    }
  }, [selectedMaqam, selectedJins]);

  // Handles clicking the source maqam name (propagates tonic and details)
  function handleSourceMaqamClick(sourceMaqam: Maqam) {
    // Defensive: ensure ascendingPitchClasses exists and has at least one element
    const maqamId = sourceMaqam.maqamId;
    const tonic =
      Array.isArray(sourceMaqam.ascendingPitchClasses) && sourceMaqam.ascendingPitchClasses.length > 0
        ? sourceMaqam.ascendingPitchClasses[0].noteName
        : undefined;
    if (maqamId && tonic) {
      handleClickMaqam({ maqamId, tonic } as any);
      clearHangingNotes();
    }
  }

  const addHopsWrapper = (maqamTransposition: Maqam, stackIdx: number) => {
    const ajnasMods = modulate(allPitchClasses, ajnas, maqamat, maqamTransposition, true) as AjnasModulations;
    const maqamatMods = modulate(allPitchClasses, ajnas, maqamat, maqamTransposition, false) as MaqamatModulations;
    const newModulations = {
      ajnas: ajnasMods,
      maqamat: maqamatMods,
    };
    setSourceMaqamStack((prev) => {
      const newStack = [...prev.slice(0, stackIdx + 1), maqamTransposition];
      return newStack;
    });
    setModulationsStack((prev) => {
      const newStack = [...prev.slice(0, stackIdx + 1), newModulations];
      return newStack;
    });
    setModulationModes((prev) => {
      // When adding a hop, keep previous modes, default new hop to maqamat (false)
      const newModes = [...prev.slice(0, stackIdx + 1), false];
      return newModes;
    });
    setCollapsedHops((prev) => {
      // When adding a hop, keep previous collapsed states, default new hop to not collapsed
      const newCollapsed = [...prev.slice(0, stackIdx + 1), false];
      return newCollapsed;
    });
    // Scroll to the new hop after a short delay to ensure DOM update
    setTimeout(() => {
      const nextIdx = stackIdx + 1;
      if (hopsRefs.current[nextIdx]) {
        hopsRefs.current[nextIdx]?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };

  const removeLastHopsWrapper = () => {
    setSourceMaqamStack((prev) => {
      const newStack = prev.length > 1 ? prev.slice(0, -1) : prev;
      return newStack;
    });
    setModulationsStack((prev) => {
      const newStack = prev.length > 1 ? prev.slice(0, -1) : prev;
      return newStack;
    });
    setModulationModes((prev) => {
      const newModes = prev.length > 1 ? prev.slice(0, -1) : prev;
      return newModes;
    });
    setCollapsedHops((prev) => {
      const newCollapsed = prev.length > 1 ? prev.slice(0, -1) : prev;
      return newCollapsed;
    });
    // Scroll to the previous hop or first hop after a short delay
    setTimeout(() => {
      // Find the last non-null ref (should be the last hop in DOM)
      const validRefs = hopsRefs.current.filter(Boolean);
      if (validRefs.length > 0) {
        validRefs[validRefs.length - 1]?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };

  // Handles clicking any modulation hop (for all positions: tonic, third, etc)
  function handleModulationClick(hop: any, stackIdx: number) {
    if ("ascendingPitchClasses" in hop) {
      addHopsWrapper(hop, stackIdx);
      setSelectedJins(null);
      // Pass only maqamId and tonic to handleClickMaqam, let main system handle lookup and transposition
      const maqamId = hop.maqamId || (hop.getId && hop.getId());
      const tonic = hop.ascendingPitchClasses?.[0]?.noteName || (hop.getAscendingNoteNames && hop.getAscendingNoteNames()[0]);
      const selectedId = selectedMaqamDetails?.getId ? selectedMaqamDetails.getId() : undefined;
      const selectedTonic = selectedMaqamDetails?.getAscendingNoteNames
        ? selectedMaqamDetails.getAscendingNoteNames()[0]
        : selectedMaqamDetails?.ascendingPitchClasses?.[0]?.noteName;

      // TypeScript expects a MaqamDetails or the new object type; cast for type safety
      if (!selectedMaqamDetails || maqamId !== selectedId || tonic !== selectedTonic) {
        handleClickMaqam({ maqamId, tonic } as any);
        clearHangingNotes();
      }
    } else {
      setSelectedJins(hop);
      setSelectedMaqam(null);
    }
  }

  return (
    <div className="modulations__container">
      {sourceMaqamStack.map((sourceMaqam, stackIdx) => {
        const ascendingNoteNames = sourceMaqam.ascendingPitchClasses.map((pitchClass) => pitchClass.noteName);
        const descendingNoteNames = [...sourceMaqam.descendingPitchClasses.map((pitchClass) => pitchClass.noteName)].reverse();
        // Always calculate both counts independently, regardless of mode
        const totalAjnasModulations = modulationsStack[stackIdx] ? calculateNumberOfModulations(modulationsStack[stackIdx].ajnas, "ajnas") : 0;
        const totalMaqamatModulations = modulationsStack[stackIdx] ? calculateNumberOfModulations(modulationsStack[stackIdx].maqamat, "maqamat") : 0;
        return (
          <div
            className="modulations__hops-wrapper"
            key={stackIdx}
            ref={(el) => {
              hopsRefs.current[stackIdx] = el;
            }}
          >
            {/* Maqam name/details at the top of each wrapper */}
            <div className="modulations__wrapper-modulations-header">
              <div className="modulations__source-maqam-name" onClick={() => handleSourceMaqamClick(sourceMaqam)} style={{ cursor: "pointer" }}>
                {sourceMaqam.name ? sourceMaqam.name : "Unknown"} ({ascendingNoteNames ? ascendingNoteNames[0] : "N/A"}/
                {getEnglishNoteName(ascendingNoteNames ? ascendingNoteNames[0]! : "")})
              </div>
              <button
                className="modulations__collapse-arrow"
                aria-label={collapsedHops[stackIdx] ? "Expand" : "Collapse"}
                onClick={() =>
                  setCollapsedHops((prev) => {
                    const updated = [...prev];
                    updated[stackIdx] = !updated[stackIdx];
                    return updated;
                  })
                }
              >
                <span className="modulations__collapse-arrow-icon" style={{ transform: collapsedHops[stackIdx] ? "rotate(0deg)" : "rotate(90deg)" }}>
                  ▶
                </span>
              </button>
            </div>

            {/* Only render modulations if not collapsed */}
            {modulationsStack[stackIdx] &&
              !collapsedHops[stackIdx] &&
              (() => {
                const modulations = modulationModes[stackIdx] ? modulationsStack[stackIdx].ajnas : modulationsStack[stackIdx].maqamat;
                const { noteName2p } = modulations;
                return (
                  <>
                    <div style={{ display: "flex", gap: "8px", marginBottom: "12px", alignItems: "center", justifyContent: "center" }}>
                      <button
                        className={"modulations__ajnas-count" + (modulationModes[stackIdx] ? " modulations__ajnas-count_active" : "")}
                        style={{
                          cursor: "pointer",
                          textDecoration: modulationModes[stackIdx] ? "underline" : "none",
                          marginRight: 12,
                          color: modulationModes[stackIdx] ? "#0070f3" : undefined,
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setModulationModes((prev) => {
                            const newModes = [...prev];
                            newModes[stackIdx] = true;
                            return newModes;
                          });
                        }}
                      >
                        {totalAjnasModulations} ajnās modulations
                      </button>
                      <button
                        className={"modulations__maqamat-count" + (!modulationModes[stackIdx] ? " modulations__maqamat-count_active" : "")}
                        style={{
                          cursor: "pointer",
                          textDecoration: !modulationModes[stackIdx] ? "underline" : "none",
                          color: !modulationModes[stackIdx] ? "#0070f3" : undefined,
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setModulationModes((prev) => {
                            const newModes = [...prev];
                            newModes[stackIdx] = false;
                            return newModes;
                          });
                        }}
                      >
                        {totalMaqamatModulations} maqāmāt modulations
                      </button>
                      {/* Move delete button here, only on last hop and if more than one exists */}
                      {stackIdx === sourceMaqamStack.length - 1 && sourceMaqamStack.length > 1 && (
                        <button
                          className="modulations__delete-hop-btn"
                          style={{
                            marginLeft: 8,
                            padding: "2px 8px",
                            fontSize: 14,
                            cursor: "pointer",
                          }}
                          onClick={() => {
                            // Load previous hop's source maqam before removing
                            const prevIdx = sourceMaqamStack.length - 2;
                            const prevSourceMaqam = sourceMaqamStack[prevIdx];
                            if (prevSourceMaqam) {
                              handleSourceMaqamClick(prevSourceMaqam);
                              setCollapsedHops((prev) => {
                                const updated = [...prev];
                                updated[prevIdx] = false; // Uncollapse previous hop
                                return updated;
                              });
                            }
                            removeLastHopsWrapper();
                          }}
                        >
                          Delete Hop
                        </button>
                      )}
                    </div>
                    <div className="modulations__modulations-list">
                      <span className="modulations__header">
                        <span className="modulations__header-text">
                          Tonic:
                          <br />{" "}
                        </span>
                        {ascendingNoteNames[0]} ({modulations?.modulationsOnOne ? modulations.modulationsOnOne.length : 0})
                      </span>
                      {[...modulations.modulationsOnOne]
                        .sort((a: any, b: any) => a.name.localeCompare(b.name))
                        .map((hop, index) => (
                          <span
                            className="modulations__modulation-item"
                            key={index}
                            onClick={() => {
                              if (!modulationModes[stackIdx]) {
                                // Only collapse if not in ajnas mode
                                setCollapsedHops((prev) => {
                                  const updated = [...prev];
                                  updated[stackIdx] = true;
                                  return updated;
                                });
                              }
                              handleModulationClick(hop, stackIdx);
                            }}
                            style={{ cursor: "pointer" }}
                          >
                            {hop.name}
                          </span>
                        ))}
                    </div>
                    <div className="modulations__modulations-list">
                      <span className="modulations__header">
                        <span className="modulations__header-text">
                          Third:
                          <br />{" "}
                        </span>
                        {ascendingNoteNames[2]} ({modulations?.modulationsOnThree ? modulations.modulationsOnThree.length : 0})
                      </span>
                      {[...modulations.modulationsOnThree]
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map((hop, index) => (
                          <span
                            className="modulations__modulation-item"
                            key={index}
                            onClick={() => {
                              if (!modulationModes[stackIdx]) {
                                setCollapsedHops((prev) => {
                                  const updated = [...prev];
                                  updated[stackIdx] = true;
                                  return updated;
                                });
                              }
                              handleModulationClick(hop, stackIdx);
                            }}
                            style={{ cursor: "pointer" }}
                          >
                            {hop.name}
                          </span>
                        ))}
                    </div>
                    <div className="modulations__modulations-list">
                      <span className="modulations__header">
                        <span className="modulations__header-text">
                          Third (alternative):
                          <br />{" "}
                        </span>
                        {noteName2p} ({modulations?.modulationsOnThree2p ? modulations.modulationsOnThree2p.length : 0})
                      </span>
                      {[...modulations.modulationsOnThree2p]
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map((hop, index) => (
                          <span
                            className="modulations__modulation-item"
                            key={index}
                            onClick={() => {
                              if (!modulationModes[stackIdx]) {
                                setCollapsedHops((prev) => {
                                  const updated = [...prev];
                                  updated[stackIdx] = true;
                                  return updated;
                                });
                              }
                              handleModulationClick(hop, stackIdx);
                            }}
                            style={{ cursor: "pointer" }}
                          >
                            {hop.name}
                          </span>
                        ))}
                    </div>
                    <div className="modulations__modulations-list">
                      <span className="modulations__header">
                        <span className="modulations__header-text">
                          Fourth:
                          <br />{" "}
                        </span>
                        {ascendingNoteNames[3]} ({modulations?.modulationsOnFour ? modulations.modulationsOnFour.length : 0})
                      </span>
                      {[...modulations.modulationsOnFour]
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map((hop, index) => (
                          <span
                            className="modulations__modulation-item"
                            key={index}
                            onClick={() => {
                              if (!modulationModes[stackIdx]) {
                                setCollapsedHops((prev) => {
                                  const updated = [...prev];
                                  updated[stackIdx] = true;
                                  return updated;
                                });
                              }
                              handleModulationClick(hop, stackIdx);
                            }}
                            style={{ cursor: "pointer" }}
                          >
                            {hop.name}
                          </span>
                        ))}
                    </div>
                    <div className="modulations__modulations-list">
                      <span className="modulations__header">
                        <span className="modulations__header-text">
                          Fifth:
                          <br />{" "}
                        </span>
                        {ascendingNoteNames[4]} ({modulations?.modulationsOnFive ? modulations.modulationsOnFive.length : 0})
                      </span>
                      {[...modulations.modulationsOnFive]
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map((hop, index) => (
                          <span
                            className="modulations__modulation-item"
                            key={index}
                            onClick={() => {
                              if (!modulationModes[stackIdx]) {
                                setCollapsedHops((prev) => {
                                  const updated = [...prev];
                                  updated[stackIdx] = true;
                                  return updated;
                                });
                              }
                              handleModulationClick(hop, stackIdx);
                            }}
                            style={{ cursor: "pointer" }}
                          >
                            {hop.name}
                          </span>
                        ))}
                    </div>
                    <div className="modulations__modulations-list">
                      <span className="modulations__header">
                        <span className="modulations__header-text">
                          Sixth (if no Third):
                          <br />{" "}
                        </span>
                        {ascendingNoteNames[5]} ({modulations?.modulationsOnSixNoThird ? modulations.modulationsOnSixNoThird.length : 0})
                      </span>
                      {[...modulations.modulationsOnSixNoThird]
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map((hop, index) => (
                          <span
                            className="modulations__modulation-item"
                            key={index}
                            onClick={() => {
                              if (!modulationModes[stackIdx]) {
                                setCollapsedHops((prev) => {
                                  const updated = [...prev];
                                  updated[stackIdx] = true;
                                  return updated;
                                });
                              }
                              handleModulationClick(hop, stackIdx);
                            }}
                            style={{ cursor: "pointer" }}
                          >
                            {hop.name}
                          </span>
                        ))}
                    </div>
                    <div className="modulations__modulations-list">
                      <span className="modulations__header">
                        <span className="modulations__header-text">
                          Sixth (ascending):
                          <br />{" "}
                        </span>
                        {ascendingNoteNames[5]} ({modulations?.modulationsOnSixAscending ? modulations.modulationsOnSixAscending.length : 0})
                      </span>
                      {[...modulations.modulationsOnSixAscending]
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map((hop, index) => (
                          <span
                            className="modulations__modulation-item"
                            key={index}
                            onClick={() => {
                              if (!modulationModes[stackIdx]) {
                                setCollapsedHops((prev) => {
                                  const updated = [...prev];
                                  updated[stackIdx] = true;
                                  return updated;
                                });
                              }
                              handleModulationClick(hop, stackIdx);
                            }}
                            style={{ cursor: "pointer" }}
                          >
                            {hop.name}
                          </span>
                        ))}
                    </div>
                    {/* Only show descending if different from ascending */}
                    <div className="modulations__modulations-list">
                      <span className="modulations__header">
                        <span className="modulations__header-text">
                          Sixth (descending): <br />{" "}
                        </span>
                        {descendingNoteNames[5]} ({modulations?.modulationsOnSixDescending ? modulations.modulationsOnSixDescending.length : 0})
                      </span>
                      {JSON.stringify(modulations.modulationsOnSixDescending) !== JSON.stringify(modulations.modulationsOnSixAscending) &&
                        [...modulations.modulationsOnSixDescending]
                          .sort((a, b) => a.name.localeCompare(b.name))
                          .map((hop, index) => (
                            <span
                              className="modulations__modulation-item"
                              key={index}
                              onClick={() => {
                                if (!modulationModes[stackIdx]) {
                                  setCollapsedHops((prev) => {
                                    const updated = [...prev];
                                    updated[stackIdx] = true;
                                    return updated;
                                  });
                                }
                                handleModulationClick(hop, stackIdx);
                              }}
                              style={{ cursor: "pointer" }}
                            >
                              {hop.name}
                            </span>
                          ))}
                    </div>
                  </>
                );
              })()}
          </div>
        );
      })}
    </div>
  );
}
