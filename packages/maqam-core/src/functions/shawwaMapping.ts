import NoteName, { getNoteNameIndexAndOctave } from "../models/NoteName";

export default function shawwaMapping(noteName: NoteName): "n" | "1p" | "2p" | "/" {
  //D3Js
  if (noteName === "none") return "/";
  const index = getNoteNameIndexAndOctave(noteName).index;

  const naturalIndices = [0, 6, 11, 16, 21, 26, 30];
  const onePartIndices = [1, 4, 7, 13, 18, 20, 22, 27, 32, 35];
  const twoPartIndices = [3, 8, 14, 19, 24, 28, 34];

  if (naturalIndices.includes(index)) {
    return "n";
  } else if (onePartIndices.includes(index)) {
    return "1p";
  } else if (twoPartIndices.includes(index)) {
    return "2p";
  } else {
    return "/";
  }
}
