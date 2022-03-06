import { Synth } from "./audiosynth";
import { useCallback, useEffect, useState } from "react";
import { useRecognizerRef } from "./use-recognizer";
import { Box, Flex, Heading, VStack } from "@chakra-ui/layout";
import { Button } from "@chakra-ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useRef } from "react";

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
  useEffect(() => {
    document.querySelector("#hello").focus();
  }, []);
  return (
    <Flex
      backgroundColor="gray.800"
      h="100vh"
      alignItems="center"
      justifyContent="center"
    >
      <Heading
        color="white"
        fontFamily="Are You Serious"
        fontWeight={400}
        fontSize={120}
        position="absolute"
        top={10}
        left={10}
        transform="rotate(-20deg)"
      >
        Sus4
      </Heading>

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
            <VStack spacing={4}>
              <MyButton id="hello" onClick={() => setShow(true)}>
                Press here
              </MyButton>
            </VStack>
          )}
        </AnimatePresence>
      </VStack>

      <Box pos="absolute" bottom={10} left={10}>
        <a
          aria-label="source code"
          href="https://github.com/intergalacticspacehighway/sus4"
          target="_blank"
          referrerPolicy="no-referrer"
        >
          <svg
            height="32"
            aria-hidden="true"
            viewBox="0 0 16 16"
            version="1.1"
            width="32"
            fill="white"
          >
            <path
              fill-rule="evenodd"
              d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"
            />
          </svg>
        </a>
      </Box>
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
        <MyButton onClick={playNewNote}>Next</MyButton>

        <MyButton
          onClick={() => {
            playNote(state.note, state.octave);
          }}
        >
          Repeat
        </MyButton>

        <MyButton
          onClick={() => {
            setShowNote(true);
          }}
        >
          Show
        </MyButton>

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

const MyButton = (props) => {
  return (
    <Button
      variant="outline"
      color="white"
      backgroundColor="transparent"
      _hover={{ backgroundColor: "transparent" }}
      _active={{ backgroundColor: "rgba(0, 0, 0, 0.8)" }}
      _focus={{
        boxShadow:
          "5px 5px 20px yellow, -5px -10px 20px blue, 5px -10px 20px red;",
      }}
      _focusVisible={{
        boxShadow:
          "5px 5px 20px yellow, -5px -10px 20px blue, 5px -10px 20px red;",
      }}
      {...props}
    />
  );
};
