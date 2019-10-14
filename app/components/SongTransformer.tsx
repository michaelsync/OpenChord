import React, { useState, useEffect, FunctionComponent } from "react";
import ChordSheetJS, { Song } from 'chordsheetjs'
import Chord from 'chordjs'
import CustomHtmlDivFormatter from "../utils/CustomHtmlDivFormatter";

interface SongProps {
  chords: Array<Chord>
  htmlSong: string
}
interface Props {
  chordProSong?: string
  chordSheetSong?: string
  transposeDelta?: number
  showTabs?: boolean
  children(props: SongProps): JSX.Element;
}

const processChord = (item: (ChordSheetJS.ChordLyricsPair | ChordSheetJS.Tag), processor: (parsedChord: Chord) => Chord) => {
  if (item instanceof ChordSheetJS.ChordLyricsPair && item.chords) {
    const parsedChord = Chord.parse(item.chords);

    if (parsedChord) {
      const processedChordLyricsPair = item.clone();
      processedChordLyricsPair.chords = processor(parsedChord).toString();
      return processedChordLyricsPair;
    }
  }
  return item;
};

const transformSong = (song: Song, processor: (parsedChord: Chord) => Chord) => {
  song.lines = song.lines.map((line) => {
    line.items = line.items.map(item => processChord(item, processor));
    return line;
  });
  return song;
};

const SongTransformer: FunctionComponent<Props> = (props) => {
  let { showTabs = true, transposeDelta = 0, chordProSong } = props
  let htmlSong = ''
  let song: Song
  if (chordProSong != null) {
    if (!showTabs) {
      chordProSong = chordProSong.replace(/{sot}(.*\r\n)*?{eot}/g, '')
    }
    song = new ChordSheetJS.ChordProParser().parse(chordProSong);
  } else {
    song = new ChordSheetJS.ChordSheetParser({ preserveWhitespace: true }).parse(props.chordSheetSong!);
  }
  let transposedSong = song
  if (transposeDelta != 0) {
    transposedSong = transformSong(song, chord => chord.transpose(transposeDelta));
  }
  let allChords = Array<Chord>()
  transposedSong.lines.forEach(line => {
    line.items.forEach(item => {
      if (item instanceof ChordSheetJS.ChordLyricsPair && item.chords) {
        const parsedChord = Chord.parse(item.chords);
        if (parsedChord != null && allChords.find(c => c.toString() == parsedChord.toString()) == null) {
          allChords.push(parsedChord)
        }
      }
    });
  })
  htmlSong = new CustomHtmlDivFormatter().format(transposedSong)

  return props.children({ chords: allChords, htmlSong })
}
export default SongTransformer