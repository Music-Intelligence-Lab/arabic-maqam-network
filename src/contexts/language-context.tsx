"use client";

import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";
import { getHybridArabicName } from '@/functions/hybridArabicConverter';

export type Language = 'en' | 'ar';

interface LanguageContextInterface {
  language: Language;
  setLanguage: (language: Language) => void;
  isRTL: boolean;
  t: (key: string) => string;
  getDisplayName: (name: string, type: 'note' | 'jins' | 'maqam') => string;
}

const LanguageContext = createContext<LanguageContextInterface | undefined>(undefined);

// Translation keys
const translations = {
  en: {
    // Navigation Menu
    'nav.home': 'Home',
    'nav.tools': 'Tools',
    'nav.bibliography': 'Bibliography',
    'nav.analytics': 'Analytics',
    'nav.userGuide': 'User Guide',
    'nav.about': 'About',
    'nav.credits': 'Credits',

    // Navbar Tabs
    'tabs.tuningSystem': 'Tanāghīm (tuning systems)',
    'tabs.ajnas': 'Ajnās',
    'tabs.maqamat': 'Maqamāt',
    'tabs.suyur': 'Suyūr',
    'tabs.intiqalat': 'Intiqālāt',

    // Admin Tabs
    'tabs.tuningSystemAdmin': 'Tuning System Admin',
    'tabs.jinsAdmin': 'Jins Admin',
    'tabs.maqamAdmin': 'Maqam Admin',
    'tabs.sayrAdmin': 'Sayr Admin',
    'tabs.patternsAdmin': 'Patterns Admin',
    
    // Settings
    'settings.userMode': 'User Mode',
    'settings.adminMode': 'Admin Mode',
    
    // Language selector
    'language.english': 'English',
    'language.arabic': 'العربية',
    
    // Jins Manager
    'jins.noAjnasAvailable': 'No ajnas available.',
    'jins.transpositions': 'Transpositions',
    'jins.createNewJins': 'Create New Jins',
    'jins.enterNewJinsName': 'Enter new jins name',
    'jins.save': 'Save',
    'jins.delete': 'Delete',
    'jins.clear': 'Clear',
    'jins.addSource': 'Add Source',
    'jins.selectSource': 'Select source',
    'jins.page': 'Page',
    'jins.commentsEnglish': 'Comments (English)',
    'jins.commentsArabic': 'Comments (Arabic)',
    
    // Jins Transpositions
    'jins.analysis': 'Taḥlīl (analysis)',
    'jins.centsTolerance': 'Cents Tolerance',
    'jins.darajatAlIstiqrar': 'Darajat al-Istiqrār (tonic/finalis)',
    'jins.selectLoadToKeyboard': 'Select & Load to Keyboard',
    'jins.playJins': 'Play jins',
    'jins.export': 'Export',
    'jins.noteNames': 'Note Names',
    'jins.abjadName': 'Abjad Name',
    'jins.englishName': 'English Name',
    'jins.fraction': 'fraction',
    'jins.cents': 'cents (¢)',
    'jins.decimalRatio': 'decimal ratio',
    'jins.stringLength': 'string length',
    'jins.fretDivision': 'fret division',
    'jins.midiNote': 'MIDI Note',
    'jins.frequency': 'Freq (Hz)',
    'jins.play': 'Play',
    'jins.staffNotation': 'Staff Notation',
    'jins.comments': 'Comments',
    'jins.sources': 'Sources',
    'jins.transpositionsTitle': 'Taṣwīr (transpositions)',
    'jins.all': 'All Ajnas',
    
    // Value types
    'valueType.fraction': 'Fraction',
    'valueType.cents': 'Cents',
    'valueType.decimalRatio': 'Decimal Ratio',
    'valueType.stringLength': 'String Length',
    'valueType.fretDivision': 'Fret Division',
    
    // Filter labels
    'filter.pitchClass': 'Pitch Class',
    'filter.abjadName': 'Abjad Name',
    'filter.englishName': 'English Name',
    'filter.fraction': 'Fraction',
    'filter.cents': 'Cents',
    'filter.decimalRatio': 'Decimal Ratio',
    'filter.stringLength': 'String Length',
    'filter.fretDivision': 'Fret Division',
    'filter.midiNote': 'MIDI Note',
    'filter.frequency': 'Frequency',
    'filter.staffNotation': 'Staff Notation',
    
    // Maqam Manager
    'maqam.transpositions': 'Transpositions',
    'maqam.createNewMaqam': 'Create New Maqam',
    'maqam.enterMaqamName': 'Enter maqam name',
    'maqam.saveName': 'Save Name',
    'maqam.saveAscending': 'Save Ascending',
    'maqam.saveDescending': 'Save Descending',
    'maqam.delete': 'Delete',
    'maqam.clear': 'Clear',
    'maqam.addSource': 'Add Source',
    'maqam.selectSource': 'Select source',
    'maqam.page': 'Page',
    'maqam.commentsEnglish': 'Comments (English)',
    'maqam.commentsArabic': 'Comments (Arabic)',
    
    // Maqam Transpositions
    'maqam.analysis': 'Taḥlīl (analysis)',
    'maqam.centsTolerance': 'Cents Tolerance',
    'maqam.darajatAlIstiqrar': 'Darajat al-Istiqrār (tonic/finalis)',
    'maqam.selectLoadToKeyboard': 'Select & Load to Keyboard',
    'maqam.ascendingDescending': 'Ascending > Descending',
    'maqam.ascending': 'Ascending',
    'maqam.descending': 'Descending',
    'maqam.export': 'Export',
    'maqam.scaleDegrees': 'Scale Degrees',
    'maqam.noteNames': 'Note Names',
    'maqam.abjadName': 'Abjad Name',
    'maqam.englishName': 'English Name',
    'maqam.fraction': 'fraction',
    'maqam.cents': 'cents (¢)',
    'maqam.decimalRatio': 'decimal ratio',
    'maqam.stringLength': 'string length',
    'maqam.fretDivision': 'fret division',
    'maqam.midiNote': 'MIDI Note',
    'maqam.frequency': 'Freq (Hz)',
    'maqam.play': 'Play',
    'maqam.ajnas': 'Ajnas',
    'maqam.staffNotation': 'Staff Notation',
    'maqam.comments': 'Comments',
    'maqam.sources': 'Sources',
    'maqam.transpositionsTitle': 'Taṣwīr (transpositions)',
    'maqam.all': 'All Maqamat',
    
    // Tuning System Manager
    'tuningSystem.all': 'all',
    'tuningSystem.8th10thCentury': '8th–10th c. CE',
    'tuningSystem.11th15thCentury': '11th–15th c. CE',
    'tuningSystem.16th19thCentury': '16th–19th c. CE',
    'tuningSystem.20th21stCentury': '20th–21st c. CE',
    'tuningSystem.selectOrCreate': 'Select Tuning System or Create New:',
    'tuningSystem.createNew': '-- Create New System --',
    'tuningSystem.none': '-- None --',
    'tuningSystem.sortBy': 'Sort By:',
    'tuningSystem.id': 'ID',
    'tuningSystem.creator': 'Creator (English)',
    'tuningSystem.year': 'Year',
    'tuningSystem.titleEnglish': 'Title (English)',
    'tuningSystem.titleArabic': 'Title (Arabic)',
    'tuningSystem.creatorEnglish': 'Creator (English)',
    'tuningSystem.creatorArabic': 'Creator (Arabic)',
    'tuningSystem.commentsEnglish': 'Comments (English)',
    'tuningSystem.commentsArabic': 'Comments (Arabic)',
    'tuningSystem.addSource': 'Add Source',
    'tuningSystem.selectSource': 'Select source',
    'tuningSystem.page': 'Page',
    'tuningSystem.delete': 'Delete',
    'tuningSystem.pitchClasses': 'Pitch Classes (one per line)',
    'tuningSystem.stringLength': 'String Length',
    'tuningSystem.defaultReferenceFrequency': 'Default Reference Frequency',
    'tuningSystem.save': 'Save Tuning System Changes',
    'tuningSystem.create': 'Create New Tuning System',
    'tuningSystem.deleteTuningSystem': 'Delete Tuning System',
    'tuningSystem.startingNoteName': 'Starting Note Name:',
    'tuningSystem.frequency': 'Frequency (Hz):',
    'tuningSystem.saveNoteConfiguration': 'Save Note Name Configuration',
    'tuningSystem.deleteNoteConfiguration': 'Delete Note Name Configuration',
    'tuningSystem.export': 'Export:',
    'tuningSystem.comments': 'Comments:',
    'tuningSystem.sources': 'Sources:',
    'tuningSystem.noSystemsAvailable': 'No tuning systems available.',
    'tuningSystem.unsaved': 'unsaved',
    
    // Tuning System Octave Tables
    'octave.title': 'Dīwān (octave)',
    'octave.cascadeEnabled': 'Cascade Enabled',
    'octave.cascadeDisabled': 'Cascade Disabled',
    'octave.pitchClass': 'Pitch Class',
    'octave.noteNames': 'Note Name',
    'octave.abjadName': 'Abjad Name',
    'octave.englishName': 'English Name',
    'octave.fractionRatio': 'Fraction Ratio',
    'octave.cents': 'Cents (¢)',
    'octave.decimalRatio': 'Decimal Ratio',
    'octave.stringLength': 'String Length',
    'octave.fretDivision': 'Fret Division',
    'octave.midiNote': 'Midi Note',
    'octave.frequency': 'Freq (Hz)',
    'octave.play': 'Play',
    'octave.select': 'Select',
    'octave.none': '(none)',
    
    // Selected Pitch Classes Transpositions
    'analysis.title': 'Taḥlīl (analysis)',
    'analysis.centsTolerance': 'Cents Tolerance',
    'analysis.playSelectedPitchClasses': 'Play Selected Pitch Classes',
    'analysis.noteNames': 'Note Names',
    'analysis.abjadName': 'Abjad Name',
    'analysis.englishName': 'English Name',
    'analysis.fraction': 'fraction',
    'analysis.cents': 'cents (¢)',
    'analysis.decimalRatio': 'decimal ratio',
    'analysis.stringLength': 'string length',
    'analysis.fretDivision': 'fret division',
    'analysis.midiNote': 'MIDI Note',
    'analysis.frequency': 'Freq (Hz)',
    'analysis.play': 'Play',
    
    // Modulations
    'modulations.expand': 'Expand',
    'modulations.collapse': 'Collapse',
    'modulations.ajnasModulations': 'ajnās modulations',
    'modulations.maqamatModulations': 'maqāmāt modulations',
    'modulations.deleteHop': 'Delete Hop',
    'modulations.tonic': 'Tonic',
    'modulations.third': 'Third',
    'modulations.thirdAlternative': 'Third (alternative)',
    'modulations.fourth': 'Fourth',
    'modulations.fifth': 'Fifth',
    'modulations.sixthIfNoThird': 'Sixth (if no Third)',
    'modulations.sixthAscending': 'Sixth (ascending)',
    'modulations.sixthDescending': 'Sixth (descending)',
    
    // Sayr Manager
    'sayr.selectOrCreate': 'Select Sayr or Create New:',
    'sayr.newSayr': '-- New Sayr --',
    'sayr.noSuyurAvailable': 'No suyūr available.',
    'sayr.noSource': 'No Source',
    'sayr.source': 'Source',
    'sayr.selectSource': 'Select source',
    'sayr.page': 'Page',
    'sayr.commentsEnglish': 'Comments (English)',
    'sayr.commentsArabic': 'Comments (Arabic)',
    'sayr.commentsOnSayr': 'Comments on Sayr of',
    'sayr.stops': 'Stops',
    'sayr.addStop': '+ Add Stop',
    'sayr.note': 'note',
    'sayr.jins': 'jins',
    'sayr.maqam': 'maqam',
    'sayr.direction': 'direction',
    'sayr.none': '(none)',
    'sayr.noDirection': '(no direction)',
    'sayr.ascending': 'ascending',
    'sayr.descending': 'descending',
    'sayr.ascend': 'ascend',
    'sayr.descend': 'descend',
    'sayr.ascendTo': 'ascend to',
    'sayr.descendTo': 'descend to',
    'sayr.delete': 'Delete',
    'sayr.updateSayr': 'Update Sayr',
    'sayr.saveSayr': 'Save Sayr',
    'sayr.deleteSayr': 'Delete Sayr',
    'sayr.definiteArticle': ' al-',
    'sayr.transpositionWarning': 'Some notes in this sayr could not be transposed due to tuning system limitations.',
  },
  ar: {
    // Navigation Menu 
    'nav.home': 'الرئيسية',
    'nav.tools': 'الأدوات',
    'nav.bibliography': 'المراجع',
    'nav.analytics': 'التحليلات',
    'nav.userGuide': 'دليل المستخدم',
    'nav.about': 'حول المنصة',
    'nav.credits': 'صفحة الإعتمادات',
    
    // Navbar Tabs 
    'tabs.tuningSystem': 'تناغيم',
    'tabs.ajnas': 'أجناس',
    'tabs.maqamat': 'مقامات',
    'tabs.suyur': 'سيور',
    'tabs.intiqalat': 'إنتقالات',

    // Admin Tabs 
    'tabs.tuningSystemAdmin': 'إدارة نظام التنغيم',
    'tabs.jinsAdmin': 'إدارة الجنس',
    'tabs.maqamAdmin': 'إدارة المقام',
    'tabs.sayrAdmin': 'إدارة السَير',
    'tabs.patternsAdmin': 'إدارة الأنماط',
    
    // Settings
    'settings.userMode': 'وضع المستخدم',
    'settings.adminMode': 'وضع الإدارة',
    
    // Language selector
    'language.english': 'English',
    'language.arabic': 'العربية',
    
    // Jins Manager (Arabic translations)
    'jins.noAjnasAvailable': 'لا توجد أجناس متاحة',
    'jins.transpositions': 'تصاوير',
    'jins.createNewJins': 'إنشاء جنس جديد',
    'jins.enterNewJinsName': 'أدخل اسم الجنس الجديد',
    'jins.save': 'حفظ',
    'jins.delete': 'حذف',
    'jins.clear': 'مسح',
    'jins.addSource': 'إضافة مصدر',
    'jins.selectSource': 'اختر مصدراً',
    'jins.page': 'صفحة',
    'jins.commentsEnglish': 'تعليقات (إنجليزية)',
    'jins.commentsArabic': 'تعليقات (عربية)',
    
    // Jins Transpositions (Arabic translations)
    'jins.analysis': 'تحليل',
    'jins.centsTolerance': 'تساهل السنت',
    'jins.darajatAlIstiqrar': 'درجة استقرار المقام',
    'jins.selectLoadToKeyboard': 'اختر وحمّل على لوحة المفاتيح',
    'jins.playJins': 'استمعوا للجنس',
    'jins.export': 'تصدير',
    'jins.noteNames': 'أسماء النغمات',
    'jins.abjadName': 'الاسم الأبجدي',
    'jins.englishName': 'الاسم الإنجليزي',
    'jins.fraction': 'نسبة',
    'jins.cents': 'سنت',
    'jins.decimalRatio': 'نسبة عشرية',
    'jins.stringLength': 'طول الوتر',
    'jins.fretDivision': 'تقسيم الوتر',
    'jins.midiNote': 'نوطة ميدي',
    'jins.frequency': 'تردد',
    'jins.play': 'استماع',
    'jins.staffNotation': 'تدوين',
    'jins.comments': 'تعليقات',
    'jins.sources': 'مصادر',
    'jins.transpositionsTitle': 'تصوير',
    'jins.all': 'جميع الأجناس',
    
    // Value types (Arabic translations)
    'valueType.fraction': 'نسبة',
    'valueType.cents': 'سنت',
    'valueType.decimalRatio': 'نسبة عشرية',
    'valueType.stringLength': 'طول الوتر',
    'valueType.fretDivision': 'تقسيم الوتر',
    
    // Filter labels (Arabic)
    'filter.pitchClass': 'فئة النغمة',
    'filter.abjadName': 'الاسم الأبجدي',
    'filter.englishName': 'الاسم الإنجليزي',
    'filter.fraction': 'نسبة',
    'filter.cents': 'سنت',
    'filter.decimalRatio': 'نسبة عشرية',
    'filter.stringLength': 'طول الوتر',
    'filter.fretDivision': 'تقسيم الوتر',
    'filter.midiNote': 'نوطة ميدي',
    'filter.frequency': 'تردد',
    'filter.staffNotation': 'تدوين',
    
    // Maqam Manager (Arabic translations)
    'maqam.transpositions': 'تصاوير',
    'maqam.createNewMaqam': 'إنشاء مقام جديد',
    'maqam.enterMaqamName': 'أدخل اسم المقام',
    'maqam.saveName': 'حفظ الاسم',
    'maqam.saveAscending': 'حفظ الصاعد',
    'maqam.saveDescending': 'حفظ الهابط',
    'maqam.delete': 'حذف',
    'maqam.clear': 'مسح',
    'maqam.addSource': 'إضافة مصدر',
    'maqam.selectSource': 'اختر مصدراً',
    'maqam.page': 'صفحة',
    'maqam.commentsEnglish': 'تعليقات (إنجليزية)',
    'maqam.commentsArabic': 'تعليقات (عربية)',
    
    // Maqam Transpositions (Arabic translations)
    'maqam.analysis': 'تحليل',
    'maqam.centsTolerance': 'تساهل السنت',
    'maqam.darajatAlIstiqrar': 'درجة الاستقرار',
    'maqam.selectLoadToKeyboard': 'اختر وحمّل على لوحة المفاتيح',
    'maqam.ascendingDescending': 'صاعد > هابط',
    'maqam.ascending': 'صاعد',
    'maqam.descending': 'هابط',
    'maqam.export': 'تصدير',
    'maqam.scaleDegrees': 'درجات المقام',
    'maqam.noteNames': 'أسماء النغمات',
    'maqam.abjadName': 'الاسم الأبجدي',
    'maqam.englishName': 'الاسم الإنجليزي',
    'maqam.fraction': 'نسبة',
    'maqam.cents': 'سنت',
    'maqam.decimalRatio': 'نسبة عشرية',
    'maqam.stringLength': 'طول الوتر',
    'maqam.fretDivision': 'تقسيم الوتر',
    'maqam.midiNote': 'نوطة ميدي',
    'maqam.frequency': 'تردد',
    'maqam.play': 'استماع',
    'maqam.ajnas': 'أجناس',
    'maqam.staffNotation': 'تدوين',
    'maqam.comments': 'تعليقات',
    'maqam.sources': 'مصادر',
    'maqam.transpositionsTitle': 'تصوير',
    'maqam.all': 'جميع المقامات',
    
    // Tuning System Manager (Arabic translations)
    'tuningSystem.all': 'جميع التناغيم',
    'tuningSystem.8th10thCentury': 'القرن 8-10 م.',
    'tuningSystem.11th15thCentury': 'القرن 11-15 م.',
    'tuningSystem.16th19thCentury': 'القرن 16-19 م.',
    'tuningSystem.20th21stCentury': 'القرن 20-21 م.',
    'tuningSystem.selectOrCreate': 'اختر نظام التنغيم أو أنشئ جديداً:',
    'tuningSystem.createNew': '-- إنشاء نظام جديد --',
    'tuningSystem.none': '-- لا شيء --',
    'tuningSystem.sortBy': 'ترتيب حسب:',
    'tuningSystem.id': 'المعرف',
    'tuningSystem.creator': 'المؤلف (إنجليزي)',
    'tuningSystem.year': 'السنة',
    'tuningSystem.titleEnglish': 'العنوان (إنجليزي)',
    'tuningSystem.titleArabic': 'العنوان (عربي)',
    'tuningSystem.creatorEnglish': 'المؤلف (إنجليزي)',
    'tuningSystem.creatorArabic': 'المؤلف (عربي)',
    'tuningSystem.commentsEnglish': 'تعليقات (إنجليزية)',
    'tuningSystem.commentsArabic': 'تعليقات (عربية)',
    'tuningSystem.addSource': 'إضافة مصدر',
    'tuningSystem.selectSource': 'اختر مصدراً',
    'tuningSystem.page': 'صفحة',
    'tuningSystem.delete': 'حذف',
    'tuningSystem.pitchClasses': 'فئات النغمات (واحدة في كل سطر)',
    'tuningSystem.stringLength': 'طول الوتر',
    'tuningSystem.defaultReferenceFrequency': 'تردد المرجع الافتراضي',
    'tuningSystem.save': 'حفظ تعديلات نظام التنغيم',
    'tuningSystem.create': 'إنشاء نظام تنغيم جديد',
    'tuningSystem.deleteTuningSystem': 'حذف نظام التنغيم',
    'tuningSystem.startingNoteName': 'اسم النغمة البدائية:',
    'tuningSystem.frequency': 'التردد (هرتز):',
    'tuningSystem.saveNoteConfiguration': 'حفظ إعداد أسماء النغمات',
    'tuningSystem.deleteNoteConfiguration': 'حذف إعداد أسماء النغمات',
    'tuningSystem.export': 'تصدير:',
    'tuningSystem.comments': 'تعليقات:',
    'tuningSystem.sources': 'مصادر:',
    'tuningSystem.noSystemsAvailable': 'لا توجد أنظمة تنغيم متاحة.',
    'tuningSystem.unsaved': 'غير محفوظ',
    
    // Tuning System Octave Tables (Arabic translations)
    'octave.title': 'الديوان (أوكتاف)',
    'octave.cascadeEnabled': 'التتالي مُفعَّل',
    'octave.cascadeDisabled': 'التتالي مُعطَّل',
    'octave.pitchClass': 'فئة النغمة',
    'octave.noteNames': 'أسماء النغمات',
    'octave.abjadName': 'الاسم الأبجدي',
    'octave.englishName': 'الاسم الإنجليزي',
    'octave.fractionRatio': 'نسبة',
    'octave.cents': 'سنت (¢)',
    'octave.decimalRatio': 'نسبة عشرية',
    'octave.stringLength': 'طول الوتر',
    'octave.fretDivision': 'تقسيم الوتر',
    'octave.midiNote': 'نوطة ميدي',
    'octave.frequency': 'تردد',
    'octave.play': 'استماع',
    'octave.select': 'اختيار',
    'octave.none': '(لا شيء)',
    
    // Selected Pitch Classes Transpositions (Arabic translations)
    'analysis.title': 'تحليل',
    'analysis.centsTolerance': 'تساهل السنت',
    'analysis.playSelectedPitchClasses': 'استمعوا للفئات النغمية المختارة',
    'analysis.noteNames': 'أسماء النغمات',
    'analysis.abjadName': 'الاسم الأبجدي',
    'analysis.englishName': 'الاسم الإنجليزي',
    'analysis.fraction': 'نسبة',
    'analysis.cents': 'سنت (¢)',
    'analysis.decimalRatio': 'نسبة عشرية',
    'analysis.stringLength': 'طول الوتر',
    'analysis.fretDivision': 'تقسيم الوتر',
    'analysis.midiNote': 'نوطة ميدي',
    'analysis.frequency': 'تردد (هرتز)',
    'analysis.play': 'استماع',
    
    // Modulations (Arabic translations)
    'modulations.expand': 'توسيع',
    'modulations.collapse': 'طي',
    'modulations.ajnasModulations': 'إنتقالات الأجناس',
    'modulations.maqamatModulations': 'إنتقالات المقامات',
    'modulations.deleteHop': 'حذف القفزة',
    'modulations.tonic': 'القرار',
    'modulations.third': 'الثالثة',
    'modulations.thirdAlternative': 'الثالثة (البديلة)',
    'modulations.fourth': 'الرابعة',
    'modulations.fifth': 'الخامسة',
    'modulations.sixthIfNoThird': 'السادسة (إذا لم توجد ثالثة)',
    'modulations.sixthAscending': 'السادسة (صاعدة)',
    'modulations.sixthDescending': 'السادسة (هابطة)',
    
    // Sayr Manager (Arabic translations)
    'sayr.selectOrCreate': 'اختر السير أو أنشئ جديداً:',
    'sayr.newSayr': '-- سير جديد --',
    'sayr.noSuyurAvailable': 'لا توجد سيور متاحة.',
    'sayr.noSource': 'لا يوجد مصدر',
    'sayr.source': 'المصدر',
    'sayr.selectSource': 'اختر مصدراً',
    'sayr.page': 'صفحة',
    'sayr.commentsEnglish': 'تعليقات (إنجليزية)',
    'sayr.commentsArabic': 'تعليقات (عربية)',
    'sayr.commentsOnSayr': 'تعليقات على سير',
    'sayr.stops': 'وقفات',
    'sayr.addStop': '+ إضافة وقفة',
    'sayr.note': 'نغمة',
    'sayr.jins': 'جنس',
    'sayr.maqam': 'مقام',
    'sayr.direction': 'اتجاه',
    'sayr.none': '(لا شيء)',
    'sayr.noDirection': '(لا يوجد اتجاه)',
    'sayr.ascending': 'صاعد',
    'sayr.descending': 'هابط',
    'sayr.ascend': 'صعود',
    'sayr.descend': 'هبوط',
    'sayr.ascendTo': 'صعود إلى',
    'sayr.descendTo': 'هبوط إلى',
    'sayr.delete': 'حذف',
    'sayr.updateSayr': 'تحديث السير',
    'sayr.saveSayr': 'حفظ السير',
    'sayr.deleteSayr': 'حذف السير',
    'sayr.definiteArticle': ' ال',
    'sayr.transpositionWarning': 'لا يمكن نقل بعض النغمات في هذا السير بسبب قيود نظام الضبط.',
  }
};

export function LanguageContextProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  // Load language from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('maqam-network-language') as Language;
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'ar')) {
      setLanguageState(savedLanguage);
    }
  }, []);

  // Save language to localStorage when it changes
  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
    localStorage.setItem('maqam-network-language', newLanguage);
    
    // Update document direction
    document.documentElement.dir = newLanguage === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLanguage === 'ar' ? 'ar' : 'en';
    
    // Force a re-render by adding a class to trigger CSS changes
    document.body.className = document.body.className.replace(/\b(ltr|rtl)\b/g, '');
    document.body.classList.add(newLanguage === 'ar' ? 'rtl' : 'ltr');
  };

  // Set initial direction on mount
  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language === 'ar' ? 'ar' : 'en';
    
    // Also set body class for additional CSS targeting
    document.body.className = document.body.className.replace(/\b(ltr|rtl)\b/g, '');
    document.body.classList.add(language === 'ar' ? 'rtl' : 'ltr');
  }, [language]);

  const isRTL = language === 'ar';

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  // Function to get display name based on current language
  const getDisplayName = (name: string, type: 'note' | 'jins' | 'maqam'): string => {
    if (language === 'ar') {
      return getHybridArabicName(name, type);
    }
    return name; // Return transliterated name for English
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        isRTL,
        t,
        getDisplayName,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export default function useLanguageContext() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguageContext must be used within a LanguageContextProvider');
  }
  return context;
}
