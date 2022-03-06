import { Synth } from "./audiosynth";
import { useCallback, useEffect, useRef, useState } from "react";

const piano = Synth.createInstrument("piano");

const allNotes = ["A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "G", "G#"];
const octaves = [3, 4];

const randomGenerator = (array) => () =>
  array[Math.floor(Math.random() * array.length)];

const randomNote = randomGenerator(allNotes);
const randomOctave = randomGenerator(octaves);

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
const SpeechGrammarList =
  window.SpeechGrammarList || window.webkitSpeechGrammarList;
const recognition = new SpeechRecognition();

// grammar doesn't work in safari
if (SpeechGrammarList) {
  const speechRecognitionList = new SpeechGrammarList();

  var commands = ["next", "repeat", "show"];
  var grammar =
    "#JSGF V1.0; grammar commands; public <command> = " +
    commands.join(" | ") +
    " ;";

  speechRecognitionList.addFromString(grammar, 1);
  recognition.grammars = speechRecognitionList;
}

recognition.continuous = true;
recognition.lang = "en-US";
recognition.interimResults = false;

recognition.start();
recognition.onend = () => {
  recognition.start();
};

const playNote = (note, octave) => {
  piano.play(note, octave, 20);
};

function App() {
  const [state, setState] = useState(() => ({
    note: randomNote(),
    octave: randomOctave(),
  }));
  const previousState = useRef(state);

  const [showNote, setShowNote] = useState(false);

  useEffect(() => {
    previousState.current.note = state.note;
    previousState.current.octave = state.octave;
  });

  const playNewNote = useCallback(() => {
    setShowNote(false);
    const newNote = randomNote();
    const newOctave = randomOctave();
    playNote(newNote, newOctave);
    setState({ note: newNote, octave: newOctave });
  }, []);

  useEffect(() => {
    recognition.onresult = (event) => {
      const command =
        event.results[event.results.length - 1][0].transcript.trim();

      if (command === "repeat") {
        playNote(previousState.current.note, previousState.current.octave);
      } else if (command === "play") {
        playNewNote();
      } else if (command === "show") {
        setShowNote(true);
      }
      console.log(
        "Confidence: " + event.results[0][0].confidence,
        event.results
      );
    };
  }, []);

  useEffect(() => {
    const eventListener = (e) => {
      if (e.key === "p") {
        playNewNote();
      } else if (e.key === "r") {
        playNote(note, octave);
      }
    };

    window.addEventListener("keydown", eventListener);

    return () => {
      window.removeEventListener("keydown", eventListener);
    };
  }, [state, playNewNote]);

  return (
    <div className="App">
      <button onClick={playNewNote}>play a random note</button>

      <button
        onClick={() => {
          setShowNote(true);
        }}
      >
        show what was played
      </button>

      <button
        onClick={() => {
          playNote(note, octave);
        }}
      >
        repeat
      </button>

      {showNote ? (
        <div>
          {state.note} {state.octave}{" "}
        </div>
      ) : null}

      <button
        id="dummy"
        onClick={() => {
          console.log("interacted");
        }}
      >
        interact with me first
      </button>
    </div>
  );
}

export default App;
