import { useEffect, useRef } from "react";

export const useRecognizerRef = (resultCallback) => {
  let recognizer = useRef(null);
  useEffect(() => {
    const SpeechRecognition =
      //@ts-ignore
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const SpeechGrammarList =
      //@ts-ignore
      window.SpeechGrammarList || window.webkitSpeechGrammarList;
    recognizer.current = new SpeechRecognition();

    // grammar doesn't work in safari
    if (SpeechGrammarList) {
      const speechRecognitionList = new SpeechGrammarList();
      var commands = ["next", "repeat", "show"];
      var grammar =
        "#JSGF V1.0; grammar commands; public <command> = " +
        commands.join(" | ") +
        " ;";
      speechRecognitionList.addFromString(grammar, 1);
      recognizer.current.grammars = speechRecognitionList;
    }
    recognizer.current.continuous = true;
    recognizer.current.lang = "en-US";
    recognizer.current.interimResults = false;
    recognizer.current.start();

    recognizer.current.onend = () => {
      recognizer.current.start();
    };
  }, []);

  useEffect(() => {
    recognizer.current.onresult = resultCallback;
  }, [resultCallback]);

  return recognizer;
};
