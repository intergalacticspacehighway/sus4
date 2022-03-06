import { Synth } from "./audiosynth";
import { useCallback, useEffect, useState } from "react";
import { useRecognizerRef } from "./use-recognizer";
import { Box, Flex, VStack } from "@chakra-ui/layout";
import { Button } from "@chakra-ui/button";
import { motion, AnimatePresence } from "framer-motion";

const piano = Synth.createInstrument("piano");

const allNotes = ["A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "G", "G#"];
const octaves = [3, 4];

const randomGenerator = (array) => () =>
  array[Math.floor(Math.random() * array.length)];

const randomNote = randomGenerator(allNotes);
const randomOctave = randomGenerator(octaves);

const playNote = (note, octave) => {
  piano.play(note, octave, 20);
};

function App() {
  const [show, setShow] = useState(false);
  return (
    <Flex
      backgroundColor="gray.800"
      h="100vh"
      alignItems="center"
      justifyContent="center"
    >
      <VStack>
        <AnimatePresence>
          {show ? (
            <motion.div
              initial={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.2 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
            >
              <Play />
            </motion.div>
          ) : (
            <Button onClick={() => setShow(true)}>Press here to enter</Button>
          )}
        </AnimatePresence>
      </VStack>
    </Flex>
  );
}

const Play = () => {
  const [state, setState] = useState(() => ({
    note: randomNote(),
    octave: randomOctave(),
  }));
  const [showNote, setShowNote] = useState(false);

  const resultCallback = (event) => {
    const command =
      event.results[event.results.length - 1][0].transcript.trim();
    if (command === "repeat") {
      playNote(state.note, state.octave);
    } else if (command === "next") {
      playNewNote();
    } else if (command === "show") {
      setShowNote(true);
    }
    console.log("Confidence: " + event.results[0][0].confidence, event.results);
  };

  useRecognizerRef(resultCallback);

  const playNewNote = useCallback(() => {
    setShowNote(false);
    const newNote = randomNote();
    const newOctave = randomOctave();
    playNote(newNote, newOctave);
    setState({ note: newNote, octave: newOctave });
  }, []);

  const playCurrentNote = useCallback(() => {
    playNote(state.note, state.octave);
  }, [state]);

  useEffect(() => {
    const eventListener = (e) => {
      if (e.key === "n") {
        playNewNote();
      } else if (e.key === "r") {
        playCurrentNote();
      } else if (e.key === "s") {
        setShowNote(true);
      }
    };

    window.addEventListener("keydown", eventListener);

    return () => {
      window.removeEventListener("keydown", eventListener);
    };
  }, [playNewNote, playCurrentNote]);

  return (
    <Box>
      <VStack spacing={4} alignItems="stretch">
        <Button onClick={playNewNote}>Play</Button>

        <Button
          onClick={() => {
            playNote(state.note, state.octave);
          }}
        >
          Repeat
        </Button>

        <Button
          onClick={() => {
            setShowNote(true);
          }}
        >
          Show
        </Button>

        <Box height={14}>
          {showNote ? (
            <Flex
              borderWidth="2px"
              borderStyle="dashed"
              color="white"
              alignItems="center"
              justifyContent="center"
              height={14}
              borderRadius={10}
            >
              {state.note} {state.octave}{" "}
            </Flex>
          ) : null}
        </Box>
      </VStack>

      <Flex mt={50}>
        <Box color="gray.300" mt="4">
          <Box fontWeight="bold" mb={1}>
            Voice commands
          </Box>
          <VStack alignItems="flex-start" spacing={1}>
            <Box>say 'next' - to play a random note</Box>
            <Box>say 'repeat' - to repeat the note</Box>
            <Box>say 'show' - to show the played note</Box>
          </VStack>
        </Box>

        <Box w={20} />

        <Box color="gray.300" mt="4">
          <Box fontWeight="bold" mb={2}>
            Keyboard shortcuts
          </Box>
          <VStack alignItems="flex-start" spacing={1}>
            <Box>press 'n' - to play a random note</Box>
            <Box>press 'r' - to repeat the note</Box>
            <Box>press 's' - to show the note</Box>
          </VStack>
        </Box>
      </Flex>
    </Box>
  );
};

export default App;
