import NoteName, { shiftNoteName } from "./NoteName";
import { SourcePageReference } from "./bibliography/Source";

export default class TuningSystem {
  private id: string;
  private titleEnglish: string;
  private titleArabic: string;
  private year: string;
  private sourceEnglish: string;
  private sourceArabic: string;
  private sourcePageReferences: SourcePageReference[];
  private creatorEnglish: string;
  private creatorArabic: string;
  private commentsEnglish: string;
  private commentsArabic: string;
  private tuningSystemPitchClasses: string[];
  private setsOfTuningSystemNoteNames: NoteName[][];
  private defaultReferenceFrequency: number;
  private referenceFrequencies: { [noteName: string]: number };
  private abjadNames: string[];
  private stringLength: number;
  private saved: boolean;

  constructor(
    titleEnglish: string,
    titleArabic: string,
    year: string,
    sourceEnglish: string,
    sourceArabic: string,
    SourcePageReferences: SourcePageReference[],
    creatorEnglish: string,
    creatorArabic: string,
    commentsEnglish: string,
    commentsArabic: string,
    notes: string[],
    setsOfTuningNoteNames: NoteName[][],
    abjadNames: string[],
    stringLength: number,
    referenceFrequencies: { [noteName: string]: number },
    defaultReferenceFrequency: number,
    saved: boolean
  ) {
    this.id = `${creatorEnglish}-(${year})-${titleEnglish}`.replaceAll(" ", "").replaceAll("+", "");
    this.titleEnglish = titleEnglish;
    this.titleArabic = titleArabic;
    this.year = year;
    this.sourceEnglish = sourceEnglish;
    this.sourceArabic = sourceArabic;
    this.sourcePageReferences = SourcePageReferences;
    this.creatorEnglish = creatorEnglish;
    this.creatorArabic = creatorArabic;
    this.commentsEnglish = commentsEnglish;
    this.commentsArabic = commentsArabic;
    this.tuningSystemPitchClasses = notes;
    this.setsOfTuningSystemNoteNames = setsOfTuningNoteNames;
    this.abjadNames = abjadNames;
    this.stringLength = stringLength;
    this.referenceFrequencies = referenceFrequencies;
    this.defaultReferenceFrequency = defaultReferenceFrequency;
    this.saved = saved;
  }

  getId(): string {
    return this.id;
  }

  getTitleEnglish(): string {
    return this.titleEnglish;
  }

  getTitleArabic(): string {
    return this.titleArabic;
  }

  getYear(): string {
    return this.year;
  }

  getSourceEnglish(): string {
    return this.sourceEnglish;
  }

  getSourceArabic(): string {
    return this.sourceArabic;
  }
  getSourcePageReferences(): SourcePageReference[] {
    return this.sourcePageReferences;
  }
  getCreatorEnglish(): string {
    return this.creatorEnglish;
  }

  getCreatorArabic(): string {
    return this.creatorArabic;
  }

  getCommentsEnglish(): string {
    return this.commentsEnglish;
  }

  getCommentsArabic(): string {
    return this.commentsArabic;
  }

  getPitchClasses(): string[] {
    return this.tuningSystemPitchClasses;
  }

  getNoteNames(): NoteName[][] {
    return this.setsOfTuningSystemNoteNames;
  }

  getAbjadNames(): string[] {
    return this.abjadNames;
  }

  getStringLength(): number {
    return this.stringLength;
  }

  getReferenceFrequencies(): { [noteName: string]: number } {
    return this.referenceFrequencies;
  }

  getDefaultReferenceFrequency(): number {
    return this.defaultReferenceFrequency;
  }

  isSaved(): boolean {
    return this.saved;
  }

  stringify(): string {
    return `${this.getCreatorEnglish()} (${this.getYear() ? this.getYear() : "NA"}) ${this.getTitleEnglish()}`;
  }

  getSetsOfNoteNamesShiftedUpAndDown(): NoteName[][] {
    const usedNoteNames: NoteName[][] = [];
    for (const set of this.setsOfTuningSystemNoteNames) {
      usedNoteNames.push([...set.map((noteName) => shiftNoteName(noteName, -1)), ...set, ...set.map((noteName) => shiftNoteName(noteName, 1))] as NoteName[]);
    }
    return usedNoteNames as NoteName[][];
  }

  copyWithNewSetOfNoteNames(newNoteNames: NoteName[][]): TuningSystem {
    return new TuningSystem(
      this.titleEnglish,
      this.titleArabic,
      this.year,
      this.sourceEnglish,
      this.sourceArabic,
      this.sourcePageReferences,
      this.creatorEnglish,
      this.creatorArabic,
      this.commentsEnglish,
      this.commentsArabic,
      this.tuningSystemPitchClasses,
      newNoteNames,
      this.abjadNames,
      this.stringLength,
      this.referenceFrequencies,
      this.defaultReferenceFrequency,
      this.saved
    );
  }

  static createBlankTuningSystem(): TuningSystem {
    return new TuningSystem(
      "Untitled",
      "غير مسمى",
      "",
      "Unknown Source",
      "مصدر غير معروف",
      [],
      "Unknown Creator",
      "مؤلف غير معروف",
      "",
      "",
      [],
      [],
      [],
      0,
      {},
      440,
      false
    );
  }
}
