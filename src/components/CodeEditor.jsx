import { useRef, useState, useEffect } from "react";
import { Box, HStack, Button, Text, Flex, Spacer } from "@chakra-ui/react";
import { Editor } from "@monaco-editor/react";
import LanguageSelector from "./LanguageSelector";
import { CODE_SNIPPETS } from "../constants";
import Output from "./Output";
import axios from "axios";
import * as Y from "yjs";
import { WebrtcProvider } from "y-webrtc";
import { MonacoBinding } from "y-monaco";
import { getCompletion } from "../api/completions";
import { useNavigate } from "react-router-dom"; 
import AICompletionProvider from "../services/monacocompletionProvider";



const CodeEditor = () => {
  const editorRef = useRef();
  const [value, setValue] = useState(""); // Editor value
  const [language, setLanguage] = useState("javascript"); // Editor language
  const [monaco, setMonaco] = useState(null);
  const [username, setUsername] = useState("");  // Store username from MongoDB
  const completionProviderRef = useRef(null);

  const navigate = useNavigate();

  const initializeAICompletions = (editor, monacoInstance) => {
    if (!editor || !monacoInstance) return;
  
  if (completionProviderRef.current) {
    completionProviderRef.current.dispose();
  }

  const provider = new AICompletionProvider(language);
  provider.init(editor, monacoInstance);
  completionProviderRef.current = provider;
};

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    navigate("/login");
  };

  useEffect(() => {
    if (editorRef.current && monaco) {
      initializeAICompletions(editorRef.current, monaco);
    }
  }, [language]);

  useEffect(() => {
    return () => {
      if (completionProviderRef.current) {
        completionProviderRef.current.dispose();
      }
    };
  }, []);

  // 🔹 Fetch the username and saved code when the component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        window.location.href = '/login';
        return;
      }

      try {
        const response = await axios.get("http://localhost:3000/get-user-info", {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        // Set the username from the response
        setUsername(response.data.username);

        // Fetch saved code after getting username
        const savedCodeResponse = await axios.get("http://localhost:3000/get-code", {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (savedCodeResponse.data.codes.length > 0) {
          setValue(savedCodeResponse.data.codes[0].code);
          setLanguage(savedCodeResponse.data.codes[0].language);
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
        if (err.response?.status === 401) {
          alert("Your session has expired. Please login again.");
          window.location.href = '/login';
        } else {
          alert("Failed to fetch user data: " + (err.response?.data?.message || "Unknown error"));
        }
      }
    };

    fetchUserData();
  }, []); // Runs once when the component mounts

  // 🔹 Register completion provider for AI suggestions
  const registerCompletionProvider = (editor, monaco) => {
    if (completionProviderRef.current) {
      completionProviderRef.current.dispose();
    }

    const provider = monaco.languages.registerCompletionItemProvider(language, {
      triggerCharacters: ['.', '(', '{', '[', '"', "'", ' '],
      async provideCompletionItems(model, position) {
        const wordInfo = model.getWordUntilPosition(position);

        const textUntilPosition = model.getValueInRange({
          startLineNumber: Math.max(1, position.lineNumber - 10),
          startColumn: 1,
          endLineNumber: position.lineNumber,
          endColumn: position.column,
        });

        try {
          const completion = await getCompletion({
            prompt: textUntilPosition,
            language: language
          });

          if (!completion.text) return { suggestions: [] };

          const suggestion = {
            label: completion.text,
            kind: monaco.languages.CompletionItemKind.Text,
            insertText: completion.text,
            range: {
              startLineNumber: position.lineNumber,
              startColumn: wordInfo.startColumn,
              endLineNumber: position.lineNumber,
              endColumn: wordInfo.endColumn
            },
            detail: 'AI Suggestion',
            documentation: 'Generated code completion'
          };

          return { suggestions: [suggestion] };
        } catch (error) {
          console.error('Error getting completion:', error);
          return { suggestions: [] };
        }
      }
    });

    completionProviderRef.current = provider;
  };

  // 🔹 Initialize the editor with Yjs for collaborative editing
  const onMount = (editor, monacoInstance) => {
    editorRef.current = editor;
    setMonaco(monacoInstance);
    editor.focus();

    initializeAICompletions(editor, monacoInstance);

    const doc = new Y.Doc();
    const provider = new WebrtcProvider("test-room", doc);
    const type = doc.getText(value);

    const binding = new MonacoBinding(
      type,
      editor.getModel(),
      new Set([editor]),
      provider.awareness
    );

    // Register completion provider
    registerCompletionProvider(editor, monacoInstance);
  };

  // 🔹 Handle code saving
  const handleSaveCode = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You must be logged in to save your code.");
      return;
    }
    try {
      const response = await axios.post(
        "http://localhost:3000/save-code",
        { code: value, language },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data) {
        alert("Code saved successfully!");
      }
    } catch (err) {
      console.error("Error saving code:", err);
      if (err.response?.status === 401) {
        alert("Your session has expired. Please login again.");
        window.location.href = '/login';
      } else {
        alert("Failed to save code: " + (err.response?.data?.message || "Unknown error"));
      }
    }
  };

  // 🔹 Language selection handler
  const onSelect = (newLanguage) => {
    setLanguage(newLanguage);
    setValue(CODE_SNIPPETS[newLanguage]);

    if (monaco && editorRef.current) {
      registerCompletionProvider(editorRef.current, monaco);
    }
  };

  return (
    <Box>
      <HStack spacing={4}>
        <Box w="50%">
          <div>
          <Flex alignItems="center" mb={4}>
        <Text fontSize="xl">Hi, {username}</Text>
        <Spacer />
        <Button colorScheme="red" onClick={handleLogout}>
          Logout
        </Button>
      </Flex>
            <LanguageSelector language={language} onSelect={onSelect} />
            <Button colorScheme="green" mb={4} onClick={handleSaveCode}>
              Save
            </Button>
          </div>
          <Editor
            options={{
              minimap: { enabled: false },
    quickSuggestions: { other: true, comments: true, strings: true },
    suggestOnTriggerCharacters: true,
    acceptSuggestionOnEnter: "on",
    snippetSuggestions: "inline",
    suggest: { 
      preview: true, 
      showMethods: true, 
      showFunctions: true,
      enabled: true // Make sure suggestions are enabled
            }}
          }
            height="75vh"
            theme="vs-dark"
            language={language}
            value={value}
            onMount={onMount}
            onChange={(value) => setValue(value)}
          />
        </Box>
        <Output editorRef={editorRef} language={language} />
      </HStack>
    </Box>
  );
};

export default CodeEditor;
