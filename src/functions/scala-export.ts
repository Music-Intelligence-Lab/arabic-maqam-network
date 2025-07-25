import TuningSystem from "@/models/TuningSystem";
import NoteName from "@/models/NoteName";
import PitchClass from "@/models/PitchClass";
import getTuningSystemCells from "./getTuningSystemCells";
import { Jins } from "@/models/Jins";
import { Maqam } from "@/models/Maqam";
import JinsData from "@/models/Jins";
import MaqamData from "@/models/Maqam";

/**
 * Exports a tuning system to Scala (.scl) format
 * https://www.huygens-fokker.org/scala/scl_format.html
 */
export function exportToScala(
  tuningSystem: TuningSystem,
  startingNote: NoteName,
  description?: string
): string {
  const pitchClasses = getTuningSystemCells(tuningSystem, startingNote);
  
  // Get unique pitch classes within one octave, sorted by cents
  const octavePitchClasses = pitchClasses
    .filter(pc => {
      const cents = parseFloat(pc.cents);
      return cents >= 0 && cents < 1200;
    })
    .sort((a, b) => parseFloat(a.cents) - parseFloat(b.cents));
  
  // Remove duplicates based on cents (within 1 cent tolerance)
  const uniquePitchClasses: PitchClass[] = [];
  for (const pc of octavePitchClasses) {
    const cents = parseFloat(pc.cents);
    if (!uniquePitchClasses.some(existing => Math.abs(parseFloat(existing.cents) - cents) < 1)) {
      uniquePitchClasses.push(pc);
    }
  }
  
  // Remove the root note (0 cents) as it's implicit in Scala format
  const scaleNotes = uniquePitchClasses.filter(pc => parseFloat(pc.cents) > 0);
  
  // Generate description
  const desc = description || 
    `${tuningSystem.getTitleEnglish()} (${tuningSystem.getCreatorEnglish()}, ${tuningSystem.getYear()})`;
  
  // Build Scala file content
  const lines = [
    `! ${desc}`,
    `! Generated by Arabic Maqam Network`,
    `! Starting note: ${startingNote}`,
    `! Source: ${tuningSystem.getSourceEnglish()}`,
    `!`,
    `${desc}`,
    `${scaleNotes.length}`,
    `!`,
    ...scaleNotes.map(pc => {
      // Format as cents (preferred for microtonal scales)
      const cents = parseFloat(pc.cents);
      return `${cents.toFixed(2)}`;
    })
  ];
  
  return lines.join('\n') + '\n';
}

/**
 * Exports a tuning system to Scala keymap (.kbm) format
 * https://www.huygens-fokker.org/scala/help.htm#mappings
 */
export function exportToScalaKeymap(
  tuningSystem: TuningSystem,
  startingNote: NoteName,
  referenceNote: NoteName = startingNote,
  referenceFrequency?: number,
  mapSize?: number
): string {
  const pitchClasses = getTuningSystemCells(tuningSystem, startingNote);
  
  // Get unique pitch classes within one octave, sorted by cents
  const octavePitchClasses = pitchClasses
    .filter(pc => {
      const cents = parseFloat(pc.cents);
      return cents >= 0 && cents < 1200;
    })
    .sort((a, b) => parseFloat(a.cents) - parseFloat(b.cents));
  
  // Remove duplicates based on cents (within 1 cent tolerance)
  const uniquePitchClasses: PitchClass[] = [];
  for (const pc of octavePitchClasses) {
    const cents = parseFloat(pc.cents);
    if (!uniquePitchClasses.some(existing => Math.abs(parseFloat(existing.cents) - cents) < 1)) {
      uniquePitchClasses.push(pc);
    }
  }
  
  const scaleSize = uniquePitchClasses.length;
  const actualMapSize = mapSize || 128; // Default to 128 keys (full MIDI range)
  const refFreq = referenceFrequency || tuningSystem.getDefaultReferenceFrequency() || 440.0;
  
  // Find the reference note index in the scale
  const referenceNoteIndex = uniquePitchClasses.findIndex(pc => 
    pc.noteName === referenceNote
  );
  
  // Default mapping: map each key to the corresponding scale degree
  const mapping = Array.from({ length: actualMapSize }, (_, i) => {
    if (i < scaleSize) {
      return i;
    }
    return i % scaleSize;
  });
  
  // Generate description
  const desc = `${tuningSystem.getTitleEnglish()} Keymap (${tuningSystem.getCreatorEnglish()}, ${tuningSystem.getYear()})`;
  
  // Build Scala keymap file content
  const lines = [
    `! ${desc}`,
    `! Generated by Arabic Maqam Network`,
    `! Starting note: ${startingNote}`,
    `! Reference note: ${referenceNote}`,
    `! Reference frequency: ${refFreq} Hz`,
    `!`,
    `${actualMapSize}`, // Map size
    `0`, // First MIDI note (C)
    `0`, // Last MIDI note (relative to first)
    `${Math.max(0, referenceNoteIndex)}`, // Reference note index
    `${refFreq}`, // Reference frequency
    `${scaleSize}`, // Scale size
    `! Key mapping:`,
    ...mapping.map((degree) => `${degree}`)
  ];
  
  return lines.join('\n') + '\n';
}

/**
 * Helper function to generate a filename-safe version of a string
 */
export function sanitizeFilename(str: string): string {
  return str
    .replace(/[^a-zA-Z0-9\-_\s]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Collapse multiple hyphens
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
    .toLowerCase();
}

/**
 * Generates a standardized filename for exports
 */
export function generateExportFilename(
  tuningSystem: TuningSystem,
  exportType: 'tuning-details' | 'maqamat-details' | 'modulations-maqamat' | 'modulations-ajnas' | 'scala' | 'scala-keymap',
  format: string = ''
): string {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const timeStr = now.toTimeString().slice(0, 5).replace(':', '-');
  
  const tuningSystemName = sanitizeFilename(tuningSystem.getTitleEnglish());
  
  const baseName = `amn-export_${dateStr}_${timeStr}_${tuningSystemName}_${exportType}`;
  
  return format ? `${baseName}.${format}` : baseName;
}

/**
 * Exports a jins to Scala (.scl) format
 */
export function exportJinsToScala(
  jinsInput: Jins | JinsData,
  tuningSystem: TuningSystem,
  startingNote?: NoteName,
  description?: string
): string {
  let jins: Jins;
  
  // Check if input is a Jins instance or JinsData
  if ('jinsId' in jinsInput) {
    // It's a Jins instance - use directly
    jins = jinsInput;
  } else {
    // It's a JinsData instance - convert to Jins using getTahlil
    const fullRangeTuningSystemPitchClasses = getTuningSystemCells(tuningSystem, startingNote || tuningSystem.getNoteNames()[0]?.[0] || '');
    jins = jinsInput.getTahlil(fullRangeTuningSystemPitchClasses);
  }
  
  const pitchClasses = jins.jinsPitchClasses;
  
  // Get unique pitch classes, sorted by cents
  const sortedPitchClasses = [...pitchClasses].sort((a, b) => parseFloat(a.cents) - parseFloat(b.cents));
  
  // Remove duplicates based on cents (within 1 cent tolerance)
  const uniquePitchClasses: PitchClass[] = [];
  for (const pc of sortedPitchClasses) {
    const cents = parseFloat(pc.cents);
    if (!uniquePitchClasses.some(existing => Math.abs(parseFloat(existing.cents) - cents) < 1)) {
      uniquePitchClasses.push(pc);
    }
  }
  
  // Remove the root note (0 cents) as it's implicit in Scala format
  const scaleNotes = uniquePitchClasses.filter(pc => parseFloat(pc.cents) > 0);
  
  // Generate description
  const desc = description || 
    `${jins.name} - ${tuningSystem.getTitleEnglish()} (${tuningSystem.getCreatorEnglish()}, ${tuningSystem.getYear()})`;
  
  // Build Scala file content
  const lines = [
    `! ${desc}`,
    `! Generated by Arabic Maqam Network`,
    `! Jins: ${jins.name}`,
    `! Root note: ${pitchClasses[0]?.noteName}`,
    `! Source tuning system: ${tuningSystem.getTitleEnglish()}`,
    `!`,
    `${desc}`,
    `${scaleNotes.length}`,
    `!`,
    ...scaleNotes.map(pc => {
      // Format as cents (preferred for microtonal scales)
      const cents = parseFloat(pc.cents);
      return `${cents.toFixed(2)}`;
    })
  ];
  
  return lines.join('\n') + '\n';
}

/**
 * Exports a jins to Scala keymap (.kbm) format
 */
export function exportJinsToScalaKeymap(
  jinsInput: Jins | JinsData,
  tuningSystem: TuningSystem,
  startingNote?: NoteName,
  referenceNote?: NoteName,
  referenceFrequency?: number,
  mapSize?: number
): string {
  let jins: Jins;
  
  // Check if input is a Jins instance or JinsData
  if ('jinsId' in jinsInput) {
    // It's a Jins instance - use directly
    jins = jinsInput;
  } else {
    // It's a JinsData instance - convert to Jins using getTahlil
    const fullRangeTuningSystemPitchClasses = getTuningSystemCells(tuningSystem, startingNote || tuningSystem.getNoteNames()[0]?.[0] || '');
    jins = jinsInput.getTahlil(fullRangeTuningSystemPitchClasses);
  }
  
  const pitchClasses = jins.jinsPitchClasses;
  
  // Get unique pitch classes, sorted by cents
  const sortedPitchClasses = [...pitchClasses].sort((a, b) => parseFloat(a.cents) - parseFloat(b.cents));
  
  // Remove duplicates based on cents (within 1 cent tolerance)
  const uniquePitchClasses: PitchClass[] = [];
  for (const pc of sortedPitchClasses) {
    const cents = parseFloat(pc.cents);
    if (!uniquePitchClasses.some(existing => Math.abs(parseFloat(existing.cents) - cents) < 1)) {
      uniquePitchClasses.push(pc);
    }
  }
  
  const scaleSize = uniquePitchClasses.length;
  const actualMapSize = mapSize || 128; // Default to 128 keys (full MIDI range)
  const refFreq = referenceFrequency || tuningSystem.getDefaultReferenceFrequency() || 440.0;
  const refNote = referenceNote || pitchClasses[0]?.noteName;
  
  // Find the reference note index in the scale
  const referenceNoteIndex = uniquePitchClasses.findIndex(pc => 
    pc.noteName === refNote
  );
  
  // Default mapping: map each key to the corresponding scale degree
  const mapping = Array.from({ length: actualMapSize }, (_, i) => {
    if (i < scaleSize) {
      return i;
    }
    return i % scaleSize;
  });
  
  // Generate description
  const desc = `${jins.name} Keymap - ${tuningSystem.getTitleEnglish()} (${tuningSystem.getCreatorEnglish()}, ${tuningSystem.getYear()})`;
  
  // Build Scala keymap file content
  const lines = [
    `! ${desc}`,
    `! Generated by Arabic Maqam Network`,
    `! Jins: ${jins.name}`,
    `! Root note: ${pitchClasses[0]?.noteName}`,
    `! Reference note: ${refNote}`,
    `! Reference frequency: ${refFreq} Hz`,
    `!`,
    `${actualMapSize}`, // Map size
    `0`, // First MIDI note (C)
    `0`, // Last MIDI note (relative to first)
    `${Math.max(0, referenceNoteIndex)}`, // Reference note index
    `${refFreq}`, // Reference frequency
    `${scaleSize}`, // Scale size
    `! Key mapping:`,
    ...mapping.map((degree) => `${degree}`)
  ];
  
  return lines.join('\n') + '\n';
}

/**
 * Exports a maqam to Scala (.scl) format
 */
export function exportMaqamToScala(
  maqamInput: Maqam | MaqamData,
  tuningSystem: TuningSystem,
  startingNote?: NoteName,
  useAscending: boolean = true,
  description?: string
): string {
  let maqam: Maqam;
  
  // Check if input is a Maqam instance or MaqamData
  if ('maqamId' in maqamInput) {
    // It's a Maqam instance - use directly
    maqam = maqamInput;
  } else {
    // It's a MaqamData instance - convert to Maqam using getTahlil
    const fullRangeTuningSystemPitchClasses = getTuningSystemCells(tuningSystem, startingNote || tuningSystem.getNoteNames()[0]?.[0] || '');
    maqam = maqamInput.getTahlil(fullRangeTuningSystemPitchClasses);
  }
  
  const pitchClasses = useAscending ? maqam.ascendingPitchClasses : maqam.descendingPitchClasses;
  
  // Get unique pitch classes, sorted by cents
  const sortedPitchClasses = [...pitchClasses].sort((a, b) => parseFloat(a.cents) - parseFloat(b.cents));
  
  // Remove duplicates based on cents (within 1 cent tolerance)
  const uniquePitchClasses: PitchClass[] = [];
  for (const pc of sortedPitchClasses) {
    const cents = parseFloat(pc.cents);
    if (!uniquePitchClasses.some(existing => Math.abs(parseFloat(existing.cents) - cents) < 1)) {
      uniquePitchClasses.push(pc);
    }
  }
  
  // Remove the root note (0 cents) as it's implicit in Scala format
  const scaleNotes = uniquePitchClasses.filter(pc => parseFloat(pc.cents) > 0);
  
  // Generate description
  const desc = description || 
    `${maqam.name} (${useAscending ? 'Ascending' : 'Descending'}) - ${tuningSystem.getTitleEnglish()} (${tuningSystem.getCreatorEnglish()}, ${tuningSystem.getYear()})`;
  
  // Build Scala file content
  const lines = [
    `! ${desc}`,
    `! Generated by Arabic Maqam Network`,
    `! Maqam: ${maqam.name}`,
    `! Direction: ${useAscending ? 'Ascending' : 'Descending'}`,
    `! Root note: ${pitchClasses[0]?.noteName}`,
    `! Source tuning system: ${tuningSystem.getTitleEnglish()}`,
    `!`,
    `${desc}`,
    `${scaleNotes.length}`,
    `!`,
    ...scaleNotes.map(pc => {
      // Format as cents (preferred for microtonal scales)
      const cents = parseFloat(pc.cents);
      return `${cents.toFixed(2)}`;
    })
  ];
  
  return lines.join('\n') + '\n';
}

/**
 * Exports a maqam to Scala keymap (.kbm) format
 */
export function exportMaqamToScalaKeymap(
  maqamInput: Maqam | MaqamData,
  tuningSystem: TuningSystem,
  startingNote?: NoteName,
  useAscending: boolean = true,
  referenceNote?: NoteName,
  referenceFrequency?: number,
  mapSize?: number
): string {
  let maqam: Maqam;
  
  // Check if input is a Maqam instance or MaqamData
  if ('maqamId' in maqamInput) {
    // It's a Maqam instance - use directly
    maqam = maqamInput;
  } else {
    // It's a MaqamData instance - convert to Maqam using getTahlil
    const fullRangeTuningSystemPitchClasses = getTuningSystemCells(tuningSystem, startingNote || tuningSystem.getNoteNames()[0]?.[0] || '');
    maqam = maqamInput.getTahlil(fullRangeTuningSystemPitchClasses);
  }
  
  const pitchClasses = useAscending ? maqam.ascendingPitchClasses : maqam.descendingPitchClasses;
  
  // Get unique pitch classes, sorted by cents
  const sortedPitchClasses = [...pitchClasses].sort((a, b) => parseFloat(a.cents) - parseFloat(b.cents));
  
  // Remove duplicates based on cents (within 1 cent tolerance)
  const uniquePitchClasses: PitchClass[] = [];
  for (const pc of sortedPitchClasses) {
    const cents = parseFloat(pc.cents);
    if (!uniquePitchClasses.some(existing => Math.abs(parseFloat(existing.cents) - cents) < 1)) {
      uniquePitchClasses.push(pc);
    }
  }
  
  const scaleSize = uniquePitchClasses.length;
  const actualMapSize = mapSize || 128; // Default to 128 keys (full MIDI range)
  const refFreq = referenceFrequency || tuningSystem.getDefaultReferenceFrequency() || 440.0;
  const refNote = referenceNote || pitchClasses[0]?.noteName;
  
  // Find the reference note index in the scale
  const referenceNoteIndex = uniquePitchClasses.findIndex(pc => 
    pc.noteName === refNote
  );
  
  // Default mapping: map each key to the corresponding scale degree
  const mapping = Array.from({ length: actualMapSize }, (_, i) => {
    if (i < scaleSize) {
      return i;
    }
    return i % scaleSize;
  });
  
  // Generate description
  const desc = `${maqam.name} (${useAscending ? 'Ascending' : 'Descending'}) Keymap - ${tuningSystem.getTitleEnglish()} (${tuningSystem.getCreatorEnglish()}, ${tuningSystem.getYear()})`;
  
  // Build Scala keymap file content
  const lines = [
    `! ${desc}`,
    `! Generated by Arabic Maqam Network`,
    `! Maqam: ${maqam.name}`,
    `! Direction: ${useAscending ? 'Ascending' : 'Descending'}`,
    `! Root note: ${pitchClasses[0]?.noteName}`,
    `! Reference note: ${refNote}`,
    `! Reference frequency: ${refFreq} Hz`,
    `!`,
    `${actualMapSize}`, // Map size
    `0`, // First MIDI note (C)
    `0`, // Last MIDI note (relative to first)
    `${Math.max(0, referenceNoteIndex)}`, // Reference note index
    `${refFreq}`, // Reference frequency
    `${scaleSize}`, // Scale size
    `! Key mapping:`,
    ...mapping.map((degree) => `${degree}`)
  ];
  
  return lines.join('\n') + '\n';
}
